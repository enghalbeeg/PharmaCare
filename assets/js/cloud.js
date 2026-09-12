/* ============================================================
   PharmaCare — Cloud layer (Firebase Auth + Firestore)
   Multi-tenant SaaS. Loaded only when FIREBASE_ENABLED is true.
   Uses the Firebase v11 modular SDK via dynamic ESM import,
   so the rest of the app stays buildless / non-module.
   ============================================================ */
window.Cloud = (() => {
  const V = window.FIREBASE_SDK_VERSION || "11.0.2";
  const CDN = (m) => `https://www.gstatic.com/firebasejs/${V}/firebase-${m}.js`;
  const COLLECTIONS = ['medicines','sales','customers','suppliers','purchases','payments','cashcloses','labtests','laborders','stockadjustments'];

  let fb = {};        // holds imported SDK functions
  let app, auth, db;
  let unsub = [];     // active snapshot unsubscribers
  let profile = null; // { uid, email, name, role, pharmacyId }

  /* ---------- Load SDK + init app ---------- */
  async function init(){
    const appMod  = await import(CDN('app'));
    const authMod = await import(CDN('auth'));
    const fsMod   = await import(CDN('firestore'));
    fb = { ...appMod, ...authMod, ...fsMod };

    app = fb.initializeApp(window.FIREBASE_CONFIG);
    auth = fb.getAuth(app);
    await fb.setPersistence(auth, fb.browserLocalPersistence).catch(()=>{});
    // Firestore with offline persistence (works as PWA, syncs when back online)
    try {
      db = fb.initializeFirestore(app, {
        localCache: fb.persistentLocalCache({ tabManager: fb.persistentMultipleTabManager() })
      });
    } catch(e){ db = fb.getFirestore(app); }
    return true;
  }

  /* ---------- Path helpers ---------- */
  const col = (pid, name) => fb.collection(db, 'pharmacies', pid, name);
  const dref = (pid, name, id) => fb.doc(db, 'pharmacies', pid, name, id);
  const settingsRef = (pid) => fb.doc(db, 'pharmacies', pid, 'meta', 'settings');

  /* ---------- Auth ---------- */
  async function loadProfile(user){
    if (!user) return null;
    try {
      // Super-admin check first (locked collection — designated only via console).
      let isSuper = false;
      try { isSuper = (await fb.getDoc(fb.doc(db,'superadmins',user.uid))).exists(); } catch(e){}
      const snap = await fb.getDoc(fb.doc(db, 'users', user.uid));
      const data = snap.exists() ? snap.data() : {};
      profile = { uid:user.uid, email:user.email, name:data.name|| (isSuper?'Platform Admin':user.email),
                  role: isSuper ? 'Super Admin' : (data.role||'Staff'),
                  pharmacyId:data.pharmacyId||null, isSuperAdmin:isSuper };
    } catch(e){
      profile = { uid:user.uid, email:user.email, name:user.email, role:'Staff', pharmacyId:null, isSuperAdmin:false };
    }
    return profile;
  }

  function onAuth(cb){
    fb.onAuthStateChanged(auth, async (user) => { cb(await loadProfile(user)); });
  }

  async function login(email, password){
    const cred = await fb.signInWithEmailAndPassword(auth, email, password);
    return loadProfile(cred.user);
  }

  async function register({ email, password, name, pharmacyName }, starterSeed){
    const cred = await fb.createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const pid = uid; // owner's pharmacyId == their uid (unique, simple, rule-friendly)
    await fb.setDoc(fb.doc(db,'pharmacies',pid), {
      name: pharmacyName || 'My Pharmacy', ownerUid: uid, ownerEmail: email,
      status: 'pending', plan: 'free', createdAt: fb.serverTimestamp()
    });
    await fb.setDoc(fb.doc(db,'users',uid), {
      name, email, role:'Administrator', pharmacyId: pid, createdAt: fb.serverTimestamp()
    });
    if (starterSeed) await seedPharmacy(pid, starterSeed);
    return loadProfile(cred.user);
  }

  async function logout(){ stopListening(); profile = null; await fb.signOut(auth); }

  /* ---------- Staff (admin adds team member without losing own session) ---------- */
  async function addStaff({ email, password, name, role }){
    if (!profile) throw new Error('Not signed in');
    const pid = profile.pharmacyId;
    // invite doc first (so the new user's /users doc passes security rules)
    await fb.setDoc(fb.doc(db,'pharmacies',pid,'invites', email.toLowerCase()), { role, name, createdBy: profile.uid, createdAt: fb.serverTimestamp() });
    // create the auth user on a secondary app instance to keep the admin signed in
    const secondary = fb.initializeApp(window.FIREBASE_CONFIG, 'staff-' + Date.now());
    const secAuth = fb.getAuth(secondary), secDb = fb.getFirestore(secondary);
    try {
      const cred = await fb.createUserWithEmailAndPassword(secAuth, email, password);
      // write the profile via the SECONDARY db so request.auth.uid === the new user (rule passes)
      await fb.setDoc(fb.doc(secDb,'users',cred.user.uid), {
        name, email, role, pharmacyId: pid, createdAt: fb.serverTimestamp()
      });
      await fb.signOut(secAuth);
    } finally {
      await fb.deleteApp(secondary);
    }
  }

  /* ---------- Super-admin creates a pharmacy + its owner (no self-registration needed) ---------- */
  async function createPharmacy({ pharmacyName, ownerName, ownerEmail, password, city, plan }, starterSeed){
    const secondary = fb.initializeApp(window.FIREBASE_CONFIG, 'create-' + Date.now());
    const secAuth = fb.getAuth(secondary), secDb = fb.getFirestore(secondary);
    let pid;
    try {
      const cred = await fb.createUserWithEmailAndPassword(secAuth, ownerEmail, password);
      pid = cred.user.uid; // owner owns the pharmacy; pid === owner uid
      // Created as 'pending' so it passes the create rule (auth.uid === ownerUid); activated below.
      await fb.setDoc(fb.doc(secDb,'pharmacies',pid), {
        name: pharmacyName, ownerUid: pid, ownerEmail, city: city||'', status:'pending', plan: plan||'free', createdAt: fb.serverTimestamp()
      });
      await fb.setDoc(fb.doc(secDb,'users',pid), {
        name: ownerName, email: ownerEmail, role:'Administrator', pharmacyId: pid, createdAt: fb.serverTimestamp()
      });
      if (starterSeed){
        const batch = fb.writeBatch(secDb);
        (starterSeed.suppliers||[]).forEach(s => batch.set(fb.doc(secDb,'pharmacies',pid,'suppliers',s.id), s));
        (starterSeed.customers||[]).forEach(c => batch.set(fb.doc(secDb,'pharmacies',pid,'customers',c.id), c));
        (starterSeed.medicines||[]).forEach(m => batch.set(fb.doc(secDb,'pharmacies',pid,'medicines',m.id), m));
        (starterSeed.labtests||[]).forEach(t => batch.set(fb.doc(secDb,'pharmacies',pid,'labtests',t.id), t));
        if (starterSeed.settings) batch.set(fb.doc(secDb,'pharmacies',pid,'meta','settings'), starterSeed.settings, { merge:true });
        await batch.commit();
      }
      await fb.signOut(secAuth);
    } finally {
      await fb.deleteApp(secondary);
    }
    // Activate from the super-admin's own session (isSuperAdmin update rule).
    await fb.updateDoc(fb.doc(db,'pharmacies',pid), { status:'active' });
    return pid;
  }

  /* ---------- Realtime listeners ---------- */
  function listen(pid, onData){
    stopListening();
    COLLECTIONS.forEach(name => {
      const u = fb.onSnapshot(col(pid, name), (snap) => {
        onData(name, snap.docs.map(d => ({ id:d.id, ...d.data() })));
      }, (err) => console.warn('snapshot', name, err.message));
      unsub.push(u);
    });
    const us = fb.onSnapshot(settingsRef(pid), (snap) => {
      onData('settings', snap.exists() ? snap.data() : {});
    }, ()=>{});
    unsub.push(us);
    // staff list for this pharmacy
    const uu = fb.onSnapshot(fb.query(fb.collection(db,'users'), fb.where('pharmacyId','==',pid)), (snap)=>{
      onData('users', snap.docs.map(d=>({ id:d.id, ...d.data() })));
    }, ()=>{});
    unsub.push(uu);
    // the pharmacy doc itself (status / plan / feature overrides) — gates the app
    const up = fb.onSnapshot(fb.doc(db,'pharmacies',pid), (snap)=>{
      onData('_pharmacy', snap.exists() ? { id:snap.id, ...snap.data() } : null);
    }, ()=>{});
    unsub.push(up);
    // platform config (announcement + feature flags + plan limits) — read-only for tenants
    const uc = fb.onSnapshot(fb.doc(db,'platform','config'), (snap)=>{
      onData('_config', snap.exists() ? snap.data() : {});
    }, ()=>{});
    unsub.push(uc);
  }
  function stopListening(){ unsub.forEach(u=>{ try{u();}catch(e){} }); unsub = []; }

  /* ============================================================
     SUPER-ADMIN — platform-wide operations
     ============================================================ */
  let superUnsub = [];
  function listenPlatform(onData){
    stopSuperListening();
    superUnsub.push(fb.onSnapshot(fb.collection(db,'pharmacies'), (snap)=>{
      onData('pharmacies', snap.docs.map(d=>({ id:d.id, ...d.data() })));
    }, (e)=>console.warn('platform pharmacies', e.message)));
    superUnsub.push(fb.onSnapshot(fb.collection(db,'users'), (snap)=>{
      onData('allUsers', snap.docs.map(d=>({ id:d.id, ...d.data() })));
    }, (e)=>console.warn('platform users', e.message)));
    superUnsub.push(fb.onSnapshot(fb.doc(db,'platform','config'), (snap)=>{
      onData('_config', snap.exists() ? snap.data() : {});
    }, ()=>{}));
    superUnsub.push(fb.onSnapshot(fb.query(fb.collection(db,'auditlog'), fb.orderBy('at','desc'), fb.limit(100)), (snap)=>{
      onData('audit', snap.docs.map(d=>({ id:d.id, ...d.data() })));
    }, ()=>{}));
    superUnsub.push(fb.onSnapshot(fb.query(fb.collection(db,'errorlog'), fb.orderBy('at','desc'), fb.limit(100)), (snap)=>{
      onData('errors', snap.docs.map(d=>({ id:d.id, ...d.data() })));
    }, ()=>{}));
  }
  function stopSuperListening(){ superUnsub.forEach(u=>{ try{u();}catch(e){} }); superUnsub = []; }

  const setPharmacyStatus = (pid, status) => fb.updateDoc(fb.doc(db,'pharmacies',pid), { status });
  const setPharmacyPlan   = (pid, plan)   => fb.updateDoc(fb.doc(db,'pharmacies',pid), { plan });
  const updatePharmacy    = (pid, patch)  => fb.updateDoc(fb.doc(db,'pharmacies',pid), patch);

  /* ---------- Platform config (announcement, feature flags, plans) ---------- */
  const saveConfig = (patch) => fb.setDoc(fb.doc(db,'platform','config'), { ...patch, updatedAt: fb.serverTimestamp() }, { merge:true });
  // Audit log: top-level /auditlog/{id}
  const logAudit = (entry) => fb.addDoc(fb.collection(db,'auditlog'), { ...entry, at: Date.now() }).catch(()=>{});
  // Client error reports: top-level /errorlog/{id}
  const reportError = (entry) => fb.addDoc(fb.collection(db,'errorlog'), { ...entry, at: Date.now() }).catch(()=>{});
  const clearError  = (id) => fb.deleteDoc(fb.doc(db,'errorlog',id));
  // Send a password-reset email. We attach a continue URL so the link returns to the
  // app's login page; if that domain isn't authorized we retry without it (Firebase
  // still sends the email — the continue URL is only a nicety).
  // Self-service password change: reauthenticate with the current password, then set the new one.
  async function changeMyPassword(currentPassword, newPassword){
    const user = auth.currentUser;
    if (!user || !user.email) throw { code:'auth/no-current-user' };
    const cred = fb.EmailAuthProvider.credential(user.email, currentPassword);
    await fb.reauthenticateWithCredential(user, cred);
    await fb.updatePassword(user, newPassword);
    return true;
  }

  const resetUserPassword = async (email) => {
    const addr = String(email||'').trim().toLowerCase();
    if (!addr) throw { code:'auth/missing-email' };
    const settings = { url: location.origin + location.pathname, handleCodeInApp: false };
    try {
      await fb.sendPasswordResetEmail(auth, addr, settings);
    } catch(err){
      if (err && /continue-uri|continue_uri/.test(err.code||'')) {
        await fb.sendPasswordResetEmail(auth, addr); // retry without continue URL
      } else throw err;
    }
    return true;
  };

  // Full delete: wipe all subcollections, the pharmacy doc, and its user profiles.
  async function deletePharmacyFull(pid){
    for (const name of [...COLLECTIONS, 'invites', 'meta']){
      const snap = await fb.getDocs(fb.collection(db,'pharmacies',pid,name)).catch(()=>({docs:[]}));
      for (let i=0;i<snap.docs.length;i+=400){
        const batch = fb.writeBatch(db);
        snap.docs.slice(i,i+400).forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    }
    const us = await fb.getDocs(fb.query(fb.collection(db,'users'), fb.where('pharmacyId','==',pid))).catch(()=>({docs:[]}));
    for (let i=0;i<us.docs.length;i+=400){
      const batch = fb.writeBatch(db);
      us.docs.slice(i,i+400).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    await fb.deleteDoc(fb.doc(db,'pharmacies',pid));
  }

  // Read one pharmacy's full data once (for super-admin drill-in).
  async function fetchPharmacyData(pid){
    const out = { pharmacyId: pid };
    for (const name of COLLECTIONS){
      const snap = await fb.getDocs(fb.collection(db,'pharmacies',pid,name)).catch(()=>({docs:[]}));
      out[name] = snap.docs.map(d=>({ id:d.id, ...d.data() }));
    }
    const st = await fb.getDoc(settingsRef(pid)).catch(()=>null);
    out.settings = st && st.exists() ? st.data() : {};
    return out;
  }

  /* ---------- Writes ---------- */
  // Firestore rejects `undefined` values (incl. inside nested objects/arrays). Strip them
  // recursively so lab panels, orders, etc. with optional empty fields always save cleanly.
  function clean(v){
    if (Array.isArray(v)) return v.map(clean);
    if (v && typeof v === 'object' && !(v instanceof Date)){
      const o = {}; for (const k in v){ if (v[k] !== undefined) o[k] = clean(v[k]); } return o;
    }
    return v;
  }
  const set    = (name, id, data) => fb.setDoc(dref(profile.pharmacyId, name, id), clean(data), { merge:true });
  const update = (name, id, patch) => fb.updateDoc(dref(profile.pharmacyId, name, id), clean(patch));
  const remove = (name, id) => fb.deleteDoc(dref(profile.pharmacyId, name, id));
  const setSettings = (obj) => fb.setDoc(settingsRef(profile.pharmacyId), clean(obj), { merge:true });

  /* ---------- Seed a new pharmacy (inventory only, no fake sales) ---------- */
  async function seedPharmacy(pid, seed){
    const batch = fb.writeBatch(db);
    (seed.suppliers||[]).forEach(s => batch.set(fb.doc(db,'pharmacies',pid,'suppliers',s.id), s));
    (seed.customers||[]).forEach(c => batch.set(fb.doc(db,'pharmacies',pid,'customers',c.id), c));
    (seed.medicines||[]).forEach(m => batch.set(fb.doc(db,'pharmacies',pid,'medicines',m.id), m));
    (seed.labtests||[]).forEach(t => batch.set(fb.doc(db,'pharmacies',pid,'labtests',t.id), t));
    if (seed.settings) batch.set(settingsRef(pid), seed.settings, { merge:true });
    await batch.commit();
  }

  /* ---------- Bulk write (used by "load demo" / import in cloud mode) ---------- */
  async function bulkLoad(data){
    const pid = profile.pharmacyId;
    const chunks = [];
    const push = (name, arr) => (arr||[]).forEach(o => chunks.push(['pharmacies',pid,name,o.id,o]));
    push('medicines', data.medicines); push('sales', data.sales); push('customers', data.customers);
    push('suppliers', data.suppliers); push('purchases', data.purchases);
    push('payments', data.payments); push('cashcloses', data.cashcloses);
    push('labtests', data.labtests); push('laborders', data.laborders);
    for (let i=0;i<chunks.length;i+=400){
      const batch = fb.writeBatch(db);
      chunks.slice(i,i+400).forEach(([a,b,c,d,o]) => batch.set(fb.doc(db,a,b,c,d), o));
      await batch.commit();
    }
    if (data.settings) await setSettings(data.settings);
  }

  async function wipePharmacy(){
    const pid = profile.pharmacyId;
    for (const name of COLLECTIONS){
      const snap = await fb.getDocs(col(pid, name));
      for (let i=0;i<snap.docs.length;i+=400){
        const batch = fb.writeBatch(db);
        snap.docs.slice(i,i+400).forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    }
  }

  return { init, onAuth, login, register, logout, addStaff, createPharmacy, listen, stopListening,
           set, update, remove, setSettings, bulkLoad, wipePharmacy,
           listenPlatform, stopSuperListening, setPharmacyStatus, setPharmacyPlan, updatePharmacy,
           deletePharmacyFull, fetchPharmacyData,
           saveConfig, logAudit, reportError, clearError, resetUserPassword, changeMyPassword,
           get profile(){ return profile; } };
})();
