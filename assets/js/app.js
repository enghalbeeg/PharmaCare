/* ============================================================
   PharmaCare — App (router + views + interactions)
   ============================================================ */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  // Debounce filter/search rebuilds so typing stays smooth on large lists.
  const debounce = (fn, ms=130) => { let h; return function(...a){ clearTimeout(h); h=setTimeout(()=>fn.apply(this,a), ms); }; };
  const { icon, esc, toast, modal, closeModal, confirm: confirmDialog, initials, avatarColor, emptyState } = UI;
  const money = Store.money, num = Store.num;

  /* ---------------- i18n (Af-Soomaali ⇆ English) ---------------- */
  let LANG = localStorage.getItem('pharma_lang') || 'en';
  const SO = {
    // nav + sections
    'Dashboard':'Shaashadda','Point of Sale':'Iibinta','Medicines':'Daawooyinka','Purchases':'Iibsiga',
    'Suppliers':'Alaab-qeybiyeyaal','Sales History':'Taariikhda Iibka','Customers':'Macaamiisha',
    'Deyn (Credit)':'Deyn','Cash Close':'Xidhitaan Lacageed','Reports':'Warbixino','Settings':'Dejinta',
    'Main':'Guud','Inventory':'Bakhaarka','Sales':'Iibka','Insights':'Falanqayn','System':'Nidaamka',
    // titles / subtitles
    'Overview of your pharmacy':'Guudmar farmasigaaga','Create a new sale':'Samee iib cusub',
    'Manage your inventory':'Maamul bakhaarkaaga','Stock-in & purchase orders':'Soo-gelin & dalabyo iibsi',
    'Your medicine suppliers':'Alaab-qeybiyeyaasha daawooyinka','All completed transactions':'Dhammaan iibka la sameeyay',
    'Customer directory':'Liiska macaamiisha','Track who owes you and record payments':'Raac cidda kugu leh & diiwaangeli bixinta',
    'Reconcile the cash drawer at day end':'Isku-xisaabi lacagta dhamaadka maalinta',
    'Business insights':'Falanqaynta ganacsiga','Configure your system':'Habee nidaamkaaga',
    'Deyn — Credit & Debt':'Deyn — Amaah & Deyn','Reports & Analytics':'Warbixino & Falanqayn',
    // dashboard
    "Today's Revenue":'Dakhliga Maanta',"Today's Sales":'Iibka Maanta','Inventory Value':'Qiimaha Bakhaarka',
    'Low Stock Alerts':'Digniin Stock Yar','Recent Sales':'Iibkii Ugu Dambeeyay','Top Selling Products':'Daawooyinka Ugu Iibka Badan',
    'Low Stock':'Stock Yar','Expiring Soon':'Dhowaan Dhacaya','Revenue — Last 14 Days':'Dakhliga — 14 Maalmood',
    'Stock by Category':'Stock Qaybo ahaan','View all':'Eeg dhammaan','All good!':'Wax walba way fiican yihiin!',
    'No low stock items right now.':'Hadda ma jiraan alaab stock yar.','All fresh!':'Dhammaan way cusub yihiin!',
    'No medicines expiring soon.':'Ma jiraan daawooyin dhowaan dhacaya.','No sales yet':'Weli iib ma jirin',
    'No data':'Xog ma jirto','need reorder':'u baahan dib-dalab',
    // common buttons / actions / labels
    'Add Medicine':'Ku dar Daawo','Add Customer':'Ku dar Macmiil','Add Supplier':'Ku dar Alaab-qeybiye',
    'New Purchase':'Iibsi Cusub','Add Staff':'Ku dar Shaqaale','Save':'Kaydi','Cancel':'Jooji','Save Changes':'Kaydi',
    'Delete':'Tirtir','Edit':'Wax ka beddel','Close':'Xidh','Print':'Daabac','Export CSV':'Soo saar CSV',
    'Export Sales CSV':'Soo saar Iibka CSV','Confirm':'Xaqiiji','Add':'Ku dar','Back to pharmacies':'Ku noqo farmasiyada',
    // inventory + table headers
    'Medicine':'Daawo','Category':'Qaybta','Stock':'Stock','Cost':'Qiime-dhaca','Price':'Qiimaha','Expiry':'Dhicitaanka',
    'Supplier':'Alaab-qeybiye','All Categories':'Dhammaan Qaybaha','All Status':'Dhammaan Xaaladaha',
    'Low / Out of Stock':'Stock Yar / Dhammaaday','Out of Stock':'Stock Dhammaaday','In stock':'Stock jira','Low stock':'Stock yar','Out of stock':'Dhammaaday','Valid':'Sax','Expired':'Dhacay',
    'Search by name, generic or barcode…':'Raadi magac, generic ama barcode…',
    'No medicines found':'Daawo lama helin','Try adjusting your filters or add a new medicine.':'Isku day filter kale ama ku dar daawo cusub.',
    // medicine form
    'Add New Medicine':'Ku dar Daawo Cusub','Edit Medicine':'Wax ka beddel Daawada','Medicine Details':'Faahfaahinta Daawada',
    'Pricing & Stock':'Qiimaha & Stock','Expiry & Location':'Dhicitaan & Goob','Medicine Name':'Magaca Daawada',
    'Generic Name':'Magaca Guud','Barcode':'Barcode','Batch No.':'Lambarka Batch','Quantity':'Tirada','Unit':'Halbeeg',
    'Cost Price':'Qiimaha Iibsiga','Selling Price':'Qiimaha Iibinta','Expiry Date':'Taariikhda Dhicitaanka',
    'Reorder Level':'Heerka Dib-dalabka','Shelf Location':'Goobta Shelf-ka','Scan or type':'Scan ama qor',
    // catalog
    'Medicine Catalog':'Liiska Daawooyinka','From Catalog':'Liiska Daawooyinka',
    'Pick a common medicine to quickly add it — then just set your price and quantity.':'Dooro daawo caan ah si dhakhso ah u kor — kadibna kaliya geli qiimahaaga iyo tiradaada.',
    'Search medicine…':'Raadi daawo…','Close':'Xidh','No medicines match your search.':'Wax daawo ah lama helin.',
    // security / change password
    'Security':'Amniga','Change Password':'Beddel Furaha (Password)','Update Password':'Cusboonaysii Furaha',
    'Change your account password. You will need your current password.':'Beddel furaha akoonkaaga. Waxaad u baahan tahay furahaaga hadda.',
    'Current password':'Furaha hadda','New password':'Furaha cusub','Confirm new password':'Xaqiiji furaha cusub',
    'At least 6 characters':'Ugu yaraan 6 xaraf','New passwords do not match.':'Furayaasha cusub isma laha.',
    'Password updated successfully.':'Furaha si guul leh ayaa loo cusboonaysiiyay.','Cancel':'Jooji',
    // settings polish
    'Plan':'Qorshe','month':'bil','Details shown on receipts':'Faahfaahin lagu muujiyo rasiidhada',
    'Currency, tax & stock alerts':'Lacag, cashuur & digniin stock','People with access':'Dadka helaya',
    'Account password':'Furaha akoonka','Backup & restore':'Backup & soo celin','Your billing plan':'Qorshahaaga lacag-bixinta',
    'Irreversible actions':'Ficillo aan dib loo celin karin',
    'Sales Receipt':'Rasiidhka Iibka','Refund Receipt':'Rasiidhka Celinta',
    // Receipt & printing settings
    'Invoice format, size & logo':'Qaabka rasiidhka, cabbirka & logo',
    'Invoice Prefix':'Horgalaha Invoice','e.g. INV → INV-00001':'tusaale INV → INV-00001',
    'Receipt Size':'Cabbirka Rasiidhka','Thermal 80mm':'Thermal 80mm','Thermal 58mm':'Thermal 58mm','A5 framed card':'A5 kaadh-qaabaysan',
    'Pharmacy Logo':'Logo Farmashiga','Change':'Beddel','Upload':'Soo shub','Remove':'Ka saar',
    'PNG/JPG shown on receipts. Keep it small (≤ 250 KB).':'PNG/JPG oo rasiidhka ka muuqda. Ha yaraato (≤ 250 KB).',
    'Save Receipt Settings':'Kaydi Habaynta Rasiidhka',
    // Dashboard attention + backup
    'Needs attention':'U baahan feejignaan','Low stock':'Stock yar','Out of stock':'Stock dhammaaday','Expiring / expired':'Dhacaya / dhacay','Debtors':'Deyn-qaadayaal',
    'You haven’t made a backup yet.':'Weli backup ma aadan samayn.','Your last backup was %d days ago.':'Backup-kaagii u dambeeyay wuxuu ahaa %d maalmood ka hor.',
    'Download a backup to keep your data safe.':'Soo dejiso backup si xogtaadu u nabad gasho.','Backup now':'Backup hadda',
    // Reports
    'Apply':'Codso','Clear':'Nadiifi',
    // Inventory: stock adjustments & reorder
    'Reorder':'Dib-dalab','Stock Log':'Diiwaanka Stock','Add':'Ku dar','Current stock':'Stock-ga hadda',
    'Quantity':'Tirada','Reason':'Sababta','Note (optional)':'Faallo (ikhtiyaari)','Apply Adjustment':'Codso Beddelka',
    'Expired / discarded':'Dhacay / la tuuray','Damaged / broken':'Kharribmay / jabay','Lost / theft':'Lumay / xatooyo',
    'Returned to supplier':'Loo celiyay alaab-qeybiye','Count correction (down)':'Sixid tirada (hoos)','Found / recount up':'La helay / kororka','Count correction (up)':'Sixid tirada (kor)','Other':'Kale',
    'Create PO':'Samee PO','Items at or below their reorder level, grouped by supplier. Create a purchase order with the suggested quantities.':'Alaabta gaadhay ama ka hoosaysa heerka dib-dalabka, iyadoo loo kala saaray alaab-qeybiye. Samee dalab-iibsi oo leh tirooyinka la soo jeediyay.','Tip: set a supplier on a medicine (Edit) to enable one-click PO for it.':'Talo: u deji alaab-qeybiye daawada (Edit) si aad hal-guji ugu samayso PO.',
    'New accounts are created by the PharmaCare admin.':'Akoonnada cusub waxaa sameeya maamulaha PharmaCare.',
    'Got it':'Waan fahmay','Official message':'Fariin rasmi ah',
    'This system runs on a simple monthly subscription. The terms below apply to every billing cycle:':'Nidaamkani wuxuu ku shaqeeyaa rukaab bille ah oo fudud. Shuruudaha hoose wuxuu khuseeyaa wareeg kasta oo lacag-bixin ah:',
    'Monthly billing cycle':'Wareegga Lacag-bixinta Bil-kasta','After each payment the service stays fully active for exactly 1 month.':'Lacag-bixin kasta kadib, adeeggu wuxuu si buuxda u shaqaynayaa muddo 1 bil ah.',
    '3-day grace period':'Muddo 3 maalmood ah oo nasiino','If a payment is late, you get 3 days of dashboard warnings before any restriction.':'Haddii lacag-bixintu daahdo, waxaad helaysaa 3 maalmood oo digniin dashboard ah ka hor xayiraad kasta.',
    'Automatic lock':'Xidhid toos ah','After the grace period the system locks until the next payment is recorded.':'Muddada nasiinada kadib, nidaamku wuu xidhmayaa ilaa lacag-bixinta xigta la diiwaan geliyo.',
    'Key points':'Qodobbada Muhiimka ah',
    // cash close
    'Cash sales today':'Iibka cash maanta','transactions':'wax-iibsiyo','Deyn payments today':'Lacag-bixinta deynta maanta','payments':'lacag-bixino',
    'Expected cash':'Cash la filayo','sales + deyn':'iib + deyn',"Close Today's Drawer":'Xidh Khasnadda Maanta',
    'Count the cash and record any over/short':'Tiri cash-ka oo diiwaan geli kala duwanaanshaha','Opening float':'Cash bilowga',
    'cash at start of day':'cash maalinta bilowgeeda','Expected in drawer':'Cash la filayo khasnadda','Counted cash in drawer':'Cash la tiriyay khasnadda',
    'Balanced ✓':'Sax ✓','Short':'Naaqus','Over':'Dheeraad','Save Cash Close':'Kaydi Xidhitaanka','optional':'ikhtiyaari',
    'Recent Closes':'Xidhitaannada Dhowaan','Your last drawer counts':'Tirinta khasnaddaada ugu dambeysay','counted':'la tiriyay','txns':'iibyo',
    'Shift':'Shaqo-wakhti','Day':'Maalin','Night':'Habeen','Full Day':'Maalin Dhan','Whole day':'Maalinta oo dhan',
    'Cash sales':'Iibka cash','Deyn payments':'Lacag-bixinta deynta','Close Drawer':'Xidh Khasnadda',
    // laboratory
    'Laboratory':'Shaybaadh','Lab orders, results & test catalog':'Dalabyada shaybaadhka, natiijooyinka & liiska baadhitaannada',
    'New Lab Order':'Dalab Cusub','Edit Lab Order':'Wax ka beddel Dalabka','Create Order':'Abuur Dalab',
    'Orders today':'Dalabyada maanta','Pending results':'Natiijo sugaya','Lab revenue (today)':'Dakhliga shaybaadhka (maanta)','Tests offered':'Baadhitaanno la bixiyo',
    'Order':'Dalab','Patient':'Bukaan','Doctor':'Dhakhtar','Tests':'Baadhitaanno','tests':'baadhitaanno','Status':'Xaalad',
    'Pending':'Sugaya','Completed':'La dhammeeyay','Print report':'Daabac warbixinta','Enter results':'Geli natiijada','View':'Eeg','Delete':'Tirtir',
    'Search order, patient or doctor…':'Raadi dalab, bukaan ama dhakhtar…','Test Catalog':'Liiska Baadhitaannada',
    'Patient Name':'Magaca Bukaanka','Full name':'Magaca buuxa','Referring Doctor':'Dhakhtarka Soo Diray','Link Customer':'Ku xidh Macmiil','None':'Midna',
    'Select Tests':'Dooro Baadhitaanno','Filter tests…':'Shaandhee baadhitaanno…','selected':'la doortay','Select at least one test.':'Dooro ugu yaraan hal baadhitaan.',
    'Please select at least one test to create the order.':'Fadlan dooro ugu yaraan hal baadhitaan si aad dalabka u abuurto.',
    'Lab order created.':'Dalabka shaybaadhka waa la abuuray.','Lab order updated.':'Dalabka waa la cusboonaysiiyay.','Add tests to the catalog first.':'Marka hore baadhitaanno ku dar liiska.',
    'Enter Results':'Geli Natiijada','Ref':'Tixraac','Result':'Natiijo','Save Draft':'Kaydi Qabyo','Save & Complete':'Kaydi & Dhammee','Draft saved.':'Qabyada waa la kaydiyay.',
    'Results saved & report ready.':'Natiijada waa la kaydiyay, warbixintuna diyaar.','High':'Sare','Low':'Hooseeya','Normal':'Caadi',
    'Lab Technician':'Farsamayaqaanka Shaybaadhka','Reference':'Tixraac',
    'Lab Test Catalog':'Liiska Baadhitaannada Shaybaadhka','Search test…':'Raadi baadhitaan…','New Test':'Baadhitaan Cusub','Edit Test':'Wax ka beddel Baadhitaanka',
    'Category':'Qayb','Sample':'Sample','Price':'Qiime','No tests yet. Add from the catalog or create one.':'Weli baadhitaanno ma jiraan. Ka dar liiska ama abuur mid.',
    'Test Name':'Magaca Baadhitaanka','Code':'Code','Sample Type':'Nooca Sample-ka','Reference Range':'Xadka Tixraaca','Unit':'Halbeeg',
    'Add Test':'Ku dar Baadhitaan','Test added.':'Baadhitaanka waa la daray.','Test updated.':'Baadhitaanka waa la cusboonaysiiyay.','Test deleted.':'Baadhitaanka waa la tirtiray.',
    'Add from Catalog':'Ka dar Liiska','Pick a common test — set your price after.':'Dooro baadhitaan caan ah — qiimaha kadib dhig.','Added':'La daray','No tests match your search.':'Wax baadhitaan ah lama helin.',
    'Test':'Baadhitaan',
    // lab panels + samples + new categories
    'Panel':'Koox','components':'qaybood','All Samples':'Dhammaan Sample-yada',
    'Blood':'Dhiig','Urine':'Kaadi','Stool':'Saxaro','Sputum':'Candhuuf','Swab':'Xoqid','Semen':'Shahwo','CSF':'Dareere Laf-dhabar','Fluid':'Dareere','Tissue':'Unug',
    'Coagulation':'Dhiig-xidhid','Pathology':'Cudur-baadhis',
    // POS
    'Current Sale':'Iibka Hadda','Customer':'Macmiil','Subtotal':'Wadar-hoosaad','Discount':'Dhimis','Tax':'Cashuur','Total':'Wadarta',
    'Walk-in — or type any name':'Walk-in — ama qor magac kasta','Pick a saved customer or type a new one — it will be saved automatically.':'Dooro macmiil la kaydiyay ama qor mid cusub — si toos ah ayaa loo kaydin doonaa.',
    'Clear':'Nadiifi','Cart is empty.':'Gaadhiga waa madhan yahay.','Click products to add them.':'Riix alaabta si aad u darto.',
    'Search or scan product…':'Raadi ama scan-garee alaab…','All':'Dhammaan','Complete Payment':'Dhammee Lacag-bixinta',
    'Amount due':'Lacagta la rabo','Payment Method':'Habka Lacag-bixinta','Amount Received':'Lacagta La Helay',
    'Confirm & Print':'Xaqiiji & Daabac','Cash':'Cash','Card':'Kaar','Mobile Money':'Mobile Money','Deyn (Credit)':'Deyn (Amaah)',
    'Change':'Baaqi','Mobile Money Provider':'Bixiyaha Mobile Money','Reference / Txn No.':'Reference / Lambarka',
    // sales
    'Invoice':'Qaansheeg','Date':'Taariikhda','Items':'Alaabta','Cashier':'Khasnajiga','Payment':'Lacag-bixin',
    'Total Transactions':'Wadarta Iibka','Total Revenue':'Wadarta Dakhliga','Gross Profit':'Faa'+"'"+'iidada Guud',
    'Search invoice, customer or cashier…':'Raadi qaansheeg, macmiil ama khasnaji…','No sales found':'Iib lama helin',
    // customers / suppliers
    'Phone':'Telefoon','Orders':'Dalabyo','Total Spent':'Wadarta La Bixiyay','Full Name':'Magaca Buuxa','Address':'Cinwaan',
    'Company Name':'Magaca Shirkadda','Contact Person':'Qofka La Xidhiidho','Search customers…':'Raadi macaamiil…','Search suppliers…':'Raadi alaab-qeybiyeyaal…',
    'No customers':'Macaamiil ma jiraan','No suppliers':'Alaab-qeybiyeyaal ma jiraan',
    // purchases
    'Reference':'Tixraac','Note':'Fiiro','New Purchase / Stock-In':'Iibsi Cusub / Soo-gelin','Add Line Item':'Ku dar Shay',
    'Total Cost':'Wadarta Qiimaha','Save & Update Stock':'Kaydi & Cusboonaysii Stock','No purchases yet':'Weli iibsi ma jirin',
    // reports
    'Last 7 days':'7 Maalmood','Last 30 days':'30 Maalmood','Last 90 days':'90 Maalmood','Revenue':'Dakhli',
    'Avg. Order Value':'Celcelis Dalab','Revenue Trend':'Isbeddelka Dakhliga','Top Products by Revenue':'Alaabta Ugu Dakhli Badan',
    'Payment Methods':'Habab Lacag-bixin','Revenue by Category':'Dakhli Qayb ahaan','Needs Attention':'Fiiro u baahan',
    'Low stock items':'Alaab stock yar','Expiring soon':'Dhowaan dhacaya','Manage Inventory':'Maamul Bakhaarka',
    // deyn
    'Total Outstanding':'Wadarta Lagugu Leeyahay','Debtors':'Deyn-qaateyaal','Credit Sales':'Iibka Amaahda',
    'Search debtor by name or phone…':'Raadi deyn-qaate magac ama telefoon…','Record Payment':'Diiwaangeli Bixin','Bixin':'Bixin',
    'Current balance (deyn)':'Hadhaaga deynta','Amount Paid':'Lacagta La Bixiyay','Balance owed':'Hadhaaga lagugu leeyahay',
    'Payment received':'Lacag la helay','Credit sale':'Iib amaah','No outstanding debts':'Deyn furan ma jirto',
    // cash close
    "Close Today's Drawer":'Xidh Khasnadda Maanta','Expected cash sales today':'Iibka cash ee la filayo maanta',
    'Opening float':'Lacagta bilowga','Counted cash in drawer':'Cash la tiriyay khasnadda','Difference (over / short)':'Faraqga (siyaado/dhimis)',
    'Save Cash Close':'Kaydi Xidhitaanka','Recent Closes':'Xidhitaannadii Dambe','No closes yet':'Weli xidhitaan ma jirin',
    // settings
    'Pharmacy Profile':'Profile Farmasi','Pharmacy Name':'Magaca Farmasiga','Receipt Footer Note':'Qoraalka Rasiidhka',
    'Save Profile':'Kaydi Profile','Sales Configuration':'Dejinta Iibka','Currency Symbol':'Calaamadda Lacagta',
    'Symbol Position':'Booska Calaamadda','Tax Rate (%)':'Heerka Cashuurta (%)','Low Stock Threshold':'Xadka Stock Yar',
    'Expiry Warning (days)':'Digniin Dhicitaan (maalmo)','Save Configuration':'Kaydi Dejinta','Staff Accounts':'Akoonada Shaqaalaha',
    'Data Management':'Maamulka Xogta','Export Backup (JSON)':'Soo saar Backup (JSON)','Import Backup':'Soo deji Backup',
    'Reload Demo Data':'Dib u soo deji Demo','Danger Zone':'Aag Khatar ah','Erase All Data':'Tirtir Xogta Oo Dhan','Storage used':'Kayd la isticmaalay',
    // auth + status gate
    'Welcome back 👋':'Soo dhowow 👋','Sign in to manage your pharmacy':'Gal si aad u maamusho farmasigaaga',
    'Sign In':'Gal','Username':'Magaca isticmaalaha','Password':'Furaha sirta','Email':'Iimayl',
    'Awaiting approval':'Sugaya Ansixin','Account suspended':'Akoonka waa la hakiyay','Not approved':'Lama ansixin','Sign out':'Ka bax',
    'Logout':'Ka bax',
    // billing & subscription
    'Subscription expired':'Diiwaangelinta (Subscription-ka) waa dhacday',
    'Your monthly subscription has ended and the grace period is over. Please renew your subscription to restore access.':'Rukummadaada bishaa way dhammaatay, muddadii dheeriga ahaydna waa dhammaatay. Fadlan cusboonaysii rukummadaada si aad u hesho adeegga.',
    'Subscription expired.':'Rukummadaadu waa dhammaatay.',
    'Pay within':'Fadlan ku bixi',
    'days':'maalmood',
    'day':'maalin',
    'to avoid your account being locked. Please contact your provider to renew.':'gudahood si aad uga fogaato in nidaamka lagaa xidho. Kala xidhiidh maamulaha si aad u cusboonaysiiso.',
    'Your subscription renews in':'Rukummadaadu waxay cusboonaanaysaa',
    'Subscription Billing':'Bixinta Rukummada',
    'Monthly fee':'Lacagta bisha',
    'Paid until':'La bixiyay ilaa',
    'Last payment':'Bixintii u dambaysay',
    'Record Payment (+1 month)':'Diiwaangeli Lacagta (+1 Bil)',
    'Subscription Agreement':'Heshiiska Adeegga (Subscription Agreement)',
    'Agreement Terms & Conditions':'Shuruudaha & Qodobada Heshiiska',
    'Plan duration':'Muddada qorshaha',
    '1 Month':'1 Bil',
    'Grace Period':'Muddada Digniinta',
    '3 Days':'3 Maalmood',
    'Renew Subscription':'Cusboonaysii Rukummada',
    'Active':'Awood u leh',
    'Grace':'Digniin',
    'Locked':'Loo xidhay',
    'Days left':'Maalmood ayaa hadhay',
    'No billing':'Billing ma jiro',
    'Active ·':'Awood u leh ·',
    'Grace ·':'Digniin ·',
    'Signed in as':'Waxaad ku soo gashay',
    'Good morning':'Subax wanaagsan','Good afternoon':'Galab wanaagsan','Good evening':'Habeen wanaagsan',
  };
  const t = (s) => (LANG==='so' && SO[s]) ? SO[s] : s;
  function setLang(l){ LANG=l; localStorage.setItem('pharma_lang', l); document.documentElement.lang = (l==='so'?'so':'en'); if(Store.session()) render(); }

  /* Auto-translate the whole rendered UI into Somali (only exact dictionary matches —
     user data like medicine/customer names is never touched). */
  function trText(raw){
    const k = raw.trim(); if(!k) return null;
    if (SO[k]) return raw.replace(k, SO[k]);
    const m = k.match(/^(.*?)(\s*\*)$/); // "Label *" required markers
    if (m && SO[m[1]]) return raw.replace(m[1], SO[m[1]]);
    return null;
  }
  function translateNode(node){
    if (LANG!=='so' || !node) return;
    if (node.nodeType===3){ const r=trText(node.nodeValue); if(r!==null) node.nodeValue=r; return; }
    if (node.nodeType!==1) return;
    const ph=node.getAttribute && node.getAttribute('placeholder'); if(ph && SO[ph]) node.setAttribute('placeholder', SO[ph]);
    const ti=node.getAttribute && node.getAttribute('title'); if(ti && SO[ti]) node.setAttribute('title', SO[ti]);
    const w=document.createTreeWalker(node, NodeFilter.SHOW_TEXT); let n; const arr=[]; while(n=w.nextNode()) arr.push(n);
    arr.forEach(tn=>{ const r=trText(tn.nodeValue); if(r!==null) tn.nodeValue=r; });
    node.querySelectorAll && node.querySelectorAll('[placeholder]').forEach(el=>{ const p=el.getAttribute('placeholder'); if(SO[p]) el.setAttribute('placeholder', SO[p]); });
  }
  function setupTranslateObserver(){
    const obs = new MutationObserver(muts=>{ if(LANG!=='so') return; muts.forEach(m=> m.addedNodes.forEach(translateNode)); });
    ['#app-content','#modal-root','#login-screen','#toast-root'].forEach(sel=>{ const el=$(sel); if(el) obs.observe(el, {childList:true, subtree:true}); });
  }

  /* ---------------- Premium polish helpers ---------------- */
  const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function relTime(ts){
    if(!ts) return '—'; const s=Math.floor((Date.now()-ts)/1000);
    if(s<45) return LANG==='so'?'hadda':'just now';
    const m=Math.floor(s/60); if(m<60) return m+(LANG==='so'?' daq kahor':'m ago');
    const h=Math.floor(m/60); if(h<24) return h+(LANG==='so'?' saac kahor':'h ago');
    const d=Math.floor(h/24); if(d<7) return d+(LANG==='so'?' mln kahor':'d ago');
    return Store.dateFmt(ts);
  }
  // Animate any .kpi-value by parsing its formatted text (no view changes needed).
  function animateCounts(root){
    if (reduceMotion()) return;
    (root||document).querySelectorAll('.kpi-value').forEach(el=>{
      const raw = el.textContent.trim();
      const m = raw.match(/^([^\d\-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
      if(!m) return;
      const target = parseFloat(m[2].replace(/,/g,'')); if(!isFinite(target)||target===0) return;
      if(el.dataset.cv === String(target)) return;            // already shown — don't re-animate
      el.dataset.cv = String(target);
      const dec = m[2].includes('.')?2:0, pre=m[1], suf=m[3];
      const fmt=(v)=> pre + v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}) + suf;
      const t0=performance.now(), dur=650;
      const step=(now)=>{ const p=Math.min(1,(now-t0)/dur); el.textContent=fmt(target*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(step); else el.textContent=fmt(target); };
      requestAnimationFrame(step);
    });
  }
  // Brief success celebration (checkmark + confetti).
  function celebrate(){
    if (reduceMotion()) return;
    const el=document.createElement('div'); el.className='celebrate';
    el.innerHTML = `<div class="celebrate-check">${icon('check')}</div>` +
      Array.from({length:16}).map((_,i)=>`<span class="confetti c${i%5}" style="left:${6+Math.random()*88}%;animation-delay:${(Math.random()*.25).toFixed(2)}s"></span>`).join('');
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1500);
  }
  // Re-trigger the content enter animation on real route changes.
  let lastEnterRoute = null;
  function playViewTransition(r){
    if (reduceMotion()) return;
    if (r === lastEnterRoute) return; lastEnterRoute = r;
    const c=$('#app-content'); if(!c) return; c.style.animation='none'; void c.offsetWidth; c.style.animation='';
  }
  let cloudLoading = false;
  function skeletonView(){
    const k = '<div class="kpi"><div class="skeleton" style="width:44px;height:44px;border-radius:12px"></div><div class="skeleton sk-line" style="width:55%;margin-top:14px"></div><div class="skeleton sk-line" style="width:42%;height:26px"></div></div>';
    return `<div class="kpi-grid">${k+k+k+k}</div><div class="grid-2"><div class="card skeleton sk-card"></div><div class="card skeleton sk-card"></div></div>`;
  }

  /* ---------------- State ---------------- */
  const state = {
    inv:   { search:'', category:'all', status:'all' },
    pos:   { search:'', category:'all', customerId:'', customerName:'', discount:0, cart:[] },
    sales: { search:'' },
    cust:  { search:'' },
    supp:  { search:'' },
    reports:{ range:30, from:'', to:'' },
    plat:  { search:'', status:'all', plan:'all' },
    deyn:  { search:'' },
    catalog:{ search:'', category:'all' },
    lab:   { search:'', status:'all' },
    labcat:{ search:'', category:'all' },
    labpick:{ search:'', sample:'all' },
    cc:    { shift:null },
  };

  /* ---------------- Navigation config ---------------- */
  const NAV = [
    { section:'Main' },
    { path:'dashboard', label:'Dashboard', icon:'dashboard' },
    { path:'pos', label:'Point of Sale', icon:'cart' },
    { section:'Inventory' },
    { path:'inventory', label:'Medicines', icon:'pill', badge:()=>Store.lowStockItems().length },
    { path:'purchases', label:'Purchases', icon:'inbox' },
    { path:'suppliers', label:'Suppliers', icon:'truck' },
    { section:'Sales' },
    { path:'sales', label:'Sales History', icon:'receipt' },
    { path:'customers', label:'Customers', icon:'users' },
    { path:'deyn', label:'Deyn (Credit)', icon:'dollar', badge:()=>Store.debtors().length },
    { section:'Laboratory' },
    { path:'lab', label:'Laboratory', icon:'flask', badge:()=>Store.pendingLabOrders().length },
    { section:'Insights' },
    { path:'cashclose', label:'Cash Close', icon:'box' },
    { path:'reports', label:'Reports', icon:'chart' },
    { section:'System' },
    { path:'settings', label:'Settings', icon:'settings' },
  ];
  const TITLES = {
    dashboard:['Dashboard','Overview of your pharmacy'],
    pos:['Point of Sale','Create a new sale'],
    inventory:['Medicines','Manage your inventory'],
    purchases:['Purchases','Stock-in & purchase orders'],
    suppliers:['Suppliers','Your medicine suppliers'],
    sales:['Sales History','All completed transactions'],
    customers:['Customers','Customer directory'],
    deyn:['Deyn — Credit & Debt','Track who owes you and record payments'],
    lab:['Laboratory','Lab orders, results & test catalog'],
    cashclose:['Cash Close','Reconcile the cash drawer at day end'],
    reports:['Reports & Analytics','Business insights'],
    settings:['Settings','Configure your system'],
  };

  /* ---------------- Super-admin (Platform Console) ---------------- */
  const isSuper = () => !!(Store.session() && Store.session().isSuperAdmin);
  const SUPER_NAV = [
    { section:'Platform' },
    { path:'overview', label:'Overview', icon:'grid' },
    { path:'pharmacies', label:'Pharmacies', icon:'pill', badge:()=>Store.platform.stats().total },
    { path:'pending', label:'Approvals', icon:'inbox', badge:()=>Store.platform.stats().pending },
    { section:'Control' },
    { path:'features', label:'Features & Plans', icon:'tag' },
    { path:'announce', label:'Announcements', icon:'mail' },
    { section:'Monitoring' },
    { path:'platform-users', label:'Users', icon:'users' },
    { path:'audit', label:'Audit Log', icon:'clock' },
    { path:'errors', label:'Error Reports', icon:'alert', badge:()=>Store.platform.stats().errors },
    { section:'System' },
    { path:'platform-settings', label:'Settings', icon:'settings' },
  ];
  const SUPER_TITLES = {
    overview:['Platform Overview','All pharmacies at a glance'],
    pharmacies:['Pharmacies','Manage every tenant pharmacy'],
    pending:['Pending Approvals','Review new pharmacy requests'],
    features:['Features & Plans','Toggle modules and set plan limits'],
    announce:['Announcements','Broadcast a message to all pharmacies'],
    'platform-users':['Platform Users','Everyone across all pharmacies'],
    audit:['Audit Log','Recent platform admin activity'],
    errors:['Error Reports','Client errors reported across pharmacies'],
    'platform-settings':['Platform Settings','Global configuration'],
    pharmacy:['Pharmacy Details','Tenant detail & management'],
  };
  const SUPER_ROUTES = ['overview','pharmacies','pending','features','announce','platform-users','audit','errors','platform-settings'];

  /* ============================================================ INIT */
  const BRAND_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 8-7 7-7-7"/><path d="M12 2v13"/><circle cx="12" cy="20" r="2"/></svg>`;
  let suppressAuthRedirect = false; // prevents a flash to the login screen mid-registration

  async function init(){
    document.documentElement.setAttribute('data-theme', localStorage.getItem('pharma_theme') || 'light');
    document.documentElement.lang = (LANG==='so'?'so':'en');
    wireGlobal();
    setupTranslateObserver();
    // Surface client errors to the super-admin (pharmacy users only, cloud mode).
    const report = (msg, stack) => { const s=Store.session(); if(s && !s.isSuperAdmin){ try{ Store.reportError(msg, stack); }catch(_){} } };
    // Ignore noise from browser extensions & cross-origin scripts (crypto wallets, Firefox
    // reader, ad-blockers, etc.) — these aren't app bugs and flood the error report log.
    const isNoiseError = (msg, e) => {
      const m = String(msg==null?'':msg);
      if (!m || m === 'Script error.' || m === 'Script error' || m === 'Unhandled: undefined' || m === 'Unhandled: null') return true;
      if (/ethereum|web3|metamask|__firefox__|selectedAddress|solana|coinbase|phantom|evmAsk|walletconnect|chrome-extension|moz-extension|safari-web-extension|webkit-masked-url|ResizeObserver loop/i.test(m)) return true;
      const src = e && (e.filename || (e.target && (e.target.src || e.target.href)) || '');
      if (src && /^(chrome-extension|moz-extension|safari-web-extension|webkit-masked-url):/i.test(src)) return true;
      // scripts loaded from a foreign origin (not our host or the Firebase SDK CDN)
      if (src && /^https?:\/\//i.test(src) && src.indexOf(location.origin)!==0 && !/gstatic\.com|googleapis\.com|firebaseio\.com/i.test(src)) return true;
      return false;
    };
    window.addEventListener('error', (e)=>{ if(isNoiseError(e.message, e)) return; report(e.message, e.error && e.error.stack); });
    window.addEventListener('unhandledrejection', (e)=>{ const msg='Unhandled: '+((e.reason&&e.reason.message)||e.reason); if(isNoiseError(msg, null)) return; report(msg, e.reason && e.reason.stack); });
    // Realtime: re-render when data changes (but never while the user is typing).
    // Coalesce bursts of snapshot updates (12+ listeners can fire at once) into ONE
    // render per animation frame — avoids redundant full re-renders and keeps the UI snappy.
    Store.onChange(() => {
      if (!Store.session() || $('#app-shell').hidden) return;
      cloudLoading = false; // first data arrived
      const a = document.activeElement;
      if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
      scheduleRender();
    });

    if (window.FIREBASE_ENABLED && window.Cloud){
      Store.initCloud();
      showAuthLoading();
      try {
        await Cloud.init();
        Cloud.onAuth((profile) => {
          if (profile && (profile.isSuperAdmin || profile.pharmacyId)) startCloudSession(profile);
          else if (!suppressAuthRedirect) renderAuth('login');
        });
      } catch(err){
        console.error('Firebase init failed:', err);
        toast('Cloud connection failed — running in local mode.','warn');
        Store.initLocal();
        Store.session() ? showApp() : renderAuth('login');
      }
    } else {
      Store.initLocal();
      Store.session() ? showApp() : renderAuth('login');
    }
  }

  function startCloudSession(profile){
    Store.setSession(profile);
    cloudLoading = true; // show skeletons until the first snapshot arrives
    if (profile.isSuperAdmin){
      Cloud.listenPlatform((name, data) => Store.applyPlatformData(name, data));
    } else {
      Cloud.listen(profile.pharmacyId, (name, data) => Store.applyCloudData(name, data));
    }
    showApp();
  }

  function showAuthLoading(){
    $('#app-shell').hidden = true;
    const screen = $('#login-screen'); screen.hidden = false;
    screen.querySelector('.login-card').innerHTML =
      `<div class="login-brand"><div class="brand-logo">${BRAND_SVG}</div>
        <div><h1 class="brand-name">PharmaCare</h1><p class="brand-tag">Pharmacy Management System</p></div></div>
       <div style="text-align:center;padding:34px 0">
         <div class="spinner"></div><p class="muted" style="margin-top:16px">Connecting to the cloud…</p></div>`;
  }

  /* ---------------- Auth screen (login / register) ---------------- */
  function renderAuth(view='login'){
    // Self-registration is disabled — pharmacies are created only by the super-admin.
    if (view === 'register') view = 'login';
    $('#app-shell').hidden = true;
    const screen = $('#login-screen'); screen.hidden = false;
    const cloud = Store.isCloud();
    const modeChip = cloud
      ? `<span class="badge teal" style="margin-left:auto">☁ Cloud</span>`
      : `<span class="badge gray" style="margin-left:auto">💾 Local demo</span>`;
    const brand = `<div class="login-brand"><div class="brand-logo">${BRAND_SVG}</div>
        <div style="flex:1"><h1 class="brand-name">PharmaCare</h1><p class="brand-tag">Pharmacy Management System</p></div>${modeChip}</div>`;
    const card = screen.querySelector('.login-card');

    if (view === 'register' && cloud){
      card.innerHTML = `${brand}
        <h2 class="login-title">Create your pharmacy 🏥</h2>
        <p class="login-sub">Sets up a new account — you become the admin.</p>
        <form id="auth-form" class="login-form" autocomplete="off">
          <label class="field"><span class="field-label">Your Name</span>
            <div class="input-icon">${icon('user')}<input type="text" id="r-name" placeholder="e.g. Amina Yusuf" required></div></label>
          <label class="field"><span class="field-label">Pharmacy Name</span>
            <div class="input-icon">${icon('pill')}<input type="text" id="r-pharmacy" placeholder="e.g. Caafimaad Pharmacy" required></div></label>
          <label class="field"><span class="field-label">Email</span>
            <div class="input-icon">${icon('mail')}<input type="email" id="r-email" placeholder="you@email.com" required></div></label>
          <label class="field"><span class="field-label">Password</span>
            <div class="input-icon">${icon('lock')}<input type="password" id="r-password" placeholder="At least 6 characters" minlength="6" required></div></label>
          <div id="auth-error" class="login-error" hidden></div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="auth-submit">Create Account</button>
        </form>
        <div class="login-hint">Already have an account? <a href="#" data-auth="login" style="color:var(--primary-700);font-weight:600">Sign in</a></div>`;
      $('#auth-form').onsubmit = doRegister;
    } else if (view === 'forgot' && cloud){
      card.innerHTML = `${brand}
        <h2 class="login-title">Reset your password 🔑</h2>
        <p class="login-sub">We'll email you a secure link to set a new password.</p>
        <form id="auth-form" class="login-form" autocomplete="off">
          <label class="field"><span class="field-label">Email</span>
            <div class="input-icon">${icon('mail')}<input type="email" id="f-email" placeholder="you@email.com" required></div></label>
          <div id="auth-error" class="login-error" hidden></div>
          <div id="auth-ok" class="login-hint" style="background:var(--success-soft);color:var(--success);border-color:transparent" hidden></div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="auth-submit">Send reset link</button>
        </form>
        <div class="login-hint"><a href="#" data-auth="login" style="color:var(--primary-700);font-weight:600">← Back to sign in</a></div>`;
      $('#auth-form').onsubmit = doForgot;
    } else {
      const localHint = `<div class="login-hint"><strong>Demo:</strong> <code>admin</code>/<code>admin</code> · super-admin <code>superadmin</code>/<code>super</code></div>`;
      const cloudHint = `<div class="login-hint" style="text-align:center">${t('New accounts are created by the PharmaCare admin.')}</div>`;
      card.innerHTML = `${brand}
        <h2 class="login-title">Welcome back 👋</h2>
        <p class="login-sub">Sign in to manage your pharmacy</p>
        <form id="auth-form" class="login-form" autocomplete="off">
          <label class="field"><span class="field-label">${cloud?'Email':'Username'}</span>
            <div class="input-icon">${icon(cloud?'mail':'user')}<input type="${cloud?'email':'text'}" id="l-user" placeholder="${cloud?'you@email.com':'admin'}" required></div></label>
          <label class="field"><span class="field-label">Password</span>
            <div class="input-icon">${icon('lock')}<input type="password" id="l-password" placeholder="••••••" required></div></label>
          ${cloud?`<div style="text-align:right;margin-top:-8px"><a href="#" data-auth="forgot" style="font-size:12.5px;color:var(--primary-700);font-weight:600">Forgot password?</a></div>`:''}
          <div id="auth-error" class="login-error" hidden></div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="auth-submit">Sign In</button>
        </form>
        ${cloud ? cloudHint : localHint}`;
      $('#auth-form').onsubmit = doLogin;
    }
  }

  function authError(msg){ const e=$('#auth-error'); if(e){ e.hidden=false; e.textContent=msg; } }
  function authBusy(b, label){ const btn=$('#auth-submit'); if(btn){ btn.disabled=b; btn.textContent=b?'Please wait…':label; } }

  async function doLogin(e){
    e.preventDefault();
    const user = $('#l-user').value.trim(), pw = $('#l-password').value;
    if (Store.isCloud()){
      authBusy(true,'Sign In');
      try { await Cloud.login(user, pw); /* onAuth handles transition */ }
      catch(err){ authBusy(false,'Sign In'); authError(friendlyAuthError(err)); }
    } else {
      const u = Store.login(user, pw);
      if (u){ showApp(); toast(`Welcome back, ${u.name.split(' ')[0]}!`,'success'); }
      else authError('Invalid username or password. Try admin / admin.');
    }
  }

  async function doForgot(e){
    e.preventDefault();
    const email = $('#f-email').value.trim().toLowerCase();
    authBusy(true,'Send reset link');
    try {
      await Cloud.resetUserPassword(email);
      const ok=$('#auth-ok'); if(ok){ ok.hidden=false;
        ok.innerHTML='✅ If <strong>'+esc(email)+'</strong> is registered, a reset link is on its way.<br>Check your inbox <strong>and the Spam/Junk folder</strong> — it can take a minute.'; }
      $('#auth-error').hidden = true; authBusy(false,'Send reset link');
      const btn=$('#auth-submit'); if(btn) btn.disabled=true; // prevent spamming
    } catch(err){ authBusy(false,'Send reset link'); authError(friendlyAuthError(err)); }
  }

  async function doRegister(e){
    e.preventDefault();
    const name=$('#r-name').value.trim(), pharmacyName=$('#r-pharmacy').value.trim();
    const email=$('#r-email').value.trim(), password=$('#r-password').value;
    authBusy(true,'Create Account');
    suppressAuthRedirect = true;
    try {
      const profile = await Cloud.register({ email, password, name, pharmacyName }, Store.buildStarterSeed(pharmacyName));
      toast('Pharmacy created! Welcome aboard 🎉','success');
      startCloudSession(profile);
    } catch(err){ authBusy(false,'Create Account'); authError(friendlyAuthError(err)); }
    finally { suppressAuthRedirect = false; }
  }

  function friendlyAuthError(err){
    const c = (err && err.code) || '';
    if (c.includes('email-already-in-use')) return 'That email is already registered. Try signing in.';
    if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found')) return 'Wrong email or password.';
    if (c.includes('invalid-email')) return 'Please enter a valid email address.';
    if (c.includes('weak-password')) return 'Password should be at least 6 characters.';
    if (c.includes('network')) return 'Network error. Check your connection.';
    return (err && err.message) ? err.message.replace('Firebase: ','') : 'Something went wrong.';
  }

  function showApp(){
    $('#login-screen').hidden = true;
    $('#app-shell').hidden = false;
    const sup = isSuper();
    $('#app-shell').classList.toggle('super', sup);
    $('.sidebar-brand-text').textContent = sup ? 'Platform' : 'PharmaCare';
    const home = sup ? '#/overview' : '#/dashboard';
    buildNav();
    setUser();
    const r = route();
    const validSuper = SUPER_ROUTES.includes(r) || r.startsWith('pharmacy/');
    if (!location.hash || (sup && !validSuper) || (!sup && (SUPER_TITLES[r] && !TITLES[r]))) location.hash = home;
    else render();
  }

  function setUser(){
    const s = Store.session(); if(!s) return;
    $('#user-name').textContent = s.name;
    $('#user-role').textContent = s.role;
    const av = $('#user-avatar'); av.textContent = initials(s.name); av.style.background = avatarColor(s.name);
  }

  function buildNav(){
    const cur = route();
    const superMode = isSuper() && !Store.inSupport();
    const navItems = superMode ? SUPER_NAV
      : NAV.filter(it => it.section || ((!NAV_FEATURE[it.path] || Store.featureEnabled(NAV_FEATURE[it.path])) && roleAllows(it.path)))
           .filter((it,i,arr)=> !it.section || (arr[i+1] && !arr[i+1].section)); // drop section headers left with no items
    $('#sidebar-nav').innerHTML = navItems.map(item => {
      if (item.section) return `<div class="nav-section">${esc(t(item.section))}</div>`;
      const badge = item.badge ? item.badge() : 0;
      return `<a href="#/${item.path}" class="nav-link ${item.path===cur?'active':''}">
        ${icon(item.icon)}<span>${esc(t(item.label))}</span>
        ${badge>0?`<span class="nav-badge">${badge}</span>`:''}</a>`;
    }).join('');
  }

  /* ============================================================ ROUTER */
  const route = () => (location.hash.replace('#/','') || 'dashboard').split('?')[0];
  let afterRender = null;

  const NAV_FEATURE = { pos:'pos', inventory:'inventory', purchases:'purchases', suppliers:'suppliers', sales:'sales', customers:'customers', reports:'reports', deyn:'deyn', cashclose:'cashClose', lab:'lab' };

  /* Role-based access — which routes each role can open (Administrator/Super Admin = all).
     'settings' is allowed for everyone (so any staff can change their own password); the
     sensitive cards inside Settings are gated separately to Administrators. */
  const ROLE_ACCESS = {
    Pharmacist: new Set(['dashboard','pos','inventory','purchases','suppliers','sales','customers','deyn','lab','cashclose','reports','settings']),
    Cashier:    new Set(['dashboard','pos','sales','customers','deyn','cashclose','settings']),
    Staff:      new Set(['dashboard','pos','sales','customers','settings']),
  };
  const isAdminRole = () => { const s=Store.session()||{}; return s.isSuperAdmin || s.role==='Administrator' || s.role==='Super Admin'; };
  function roleAllows(path){
    const s = Store.session(); if(!s) return false;
    if (s.isSuperAdmin || Store.inSupport() || s.role==='Administrator' || s.role==='Super Admin') return true;
    const set = ROLE_ACCESS[s.role] || ROLE_ACCESS.Staff;
    return set.has(path);
  }
  function supportBanner(){
    const s = Store.inSupport();
    return `<div class="support-banner">${icon('eye')}<span>Support view — <strong>${esc(s.name)}</strong> · read-only</span>
      <button class="btn btn-sm" data-action="exit-support">${icon('x')} Exit support</button></div>`;
  }

  // Batch rapid data-change re-renders into one per frame (see Store.onChange above).
  let renderScheduled = false;
  function scheduleRender(){
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => { renderScheduled = false; render(); });
  }
  function render(){
    if (!Store.session()) return;
    { const ll=$('#lang-label'); if(ll) ll.textContent = LANG.toUpperCase(); }
    const support = Store.inSupport();
    const superMode = isSuper() && !support;
    $('#app-shell').classList.toggle('super', superMode);
    if (superMode) return renderPlatform();
    // Pharmacy app (a normal pharmacy user, OR a super-admin in support mode)
    if (!support){
      const st = Store.pharmacyStatus();
      if (st !== 'active'){ showStatusGate(st); return; }
      if (Store.myBilling().state === 'locked'){ showStatusGate('billing'); return; }
    }
    // gates passed → make sure we're showing the app (not a leftover gate/login screen)
    $('#login-screen').hidden = true; $('#app-shell').hidden = false;
    let r = route();
    if (!roleAllows(r)){ location.hash = '#/dashboard'; return; } // role-gated route
    const featKey = NAV_FEATURE[r];
    if (featKey && !Store.featureEnabled(featKey)){ location.hash = '#/dashboard'; return; } // gated feature
    const [title, sub] = TITLES[r] || ['PharmaCare',''];
    $('#page-title').textContent = t(title);
    $('#page-subtitle').textContent = t(sub);
    buildNav();
    updateStorageMeter();
    updateAlerts();
    afterRender = null;
    if (cloudLoading && Store.isCloud()){ playViewTransition('loading'); $('#app-content').innerHTML = skeletonView(); return; }
    const views = { dashboard:viewDashboard, pos:viewPOS, inventory:viewInventory, purchases:viewPurchases,
      suppliers:viewSuppliers, sales:viewSales, customers:viewCustomers, deyn:viewDeyn, cashclose:viewCashClose,
      lab:viewLab, reports:viewReports, settings:viewSettings };
    const fn = views[r] || viewDashboard;
    const bill = support ? null : Store.myBilling();
    const banners = (support ? supportBanner() : '') + (bill ? billingBanner(bill) : '') + (Store.announcement() ? announcementBanner(Store.announcement()) : '');
    playViewTransition(r);
    $('#app-content').innerHTML = banners + fn();
    if (afterRender) afterRender();
    if (LANG==='so') translateNode($('#app-shell'));
    animateCounts($('#app-content'));
    $('#app-content').scrollTop = 0;
    window.scrollTo(0,0);
    if (!support) checkDirectMessage(); // surface any operator message to this pharmacy
  }

  function renderPlatform(){
    const r = route();
    const key = r.startsWith('pharmacy/') ? 'pharmacy' : r;
    const [title, sub] = SUPER_TITLES[key] || SUPER_TITLES.overview;
    $('#page-title').textContent = title;
    $('#page-subtitle').textContent = sub;
    buildNav();
    { const pend = Store.platform.stats().pending; const dot=$('#notif-dot');
      dot.hidden = pend===0; dot.textContent = pend>99?'99+':(pend||''); dot.classList.toggle('count', pend>0); }
    afterRender = null;
    if (cloudLoading && Store.isCloud()){ playViewTransition('loading'); $('#app-content').innerHTML = skeletonView(); return; }
    let html;
    if (r.startsWith('pharmacy/')) html = viewPlatformPharmacyDetail(r.split('/')[1]);
    else html = ({ overview:viewPlatformOverview, pharmacies:viewPlatformPharmacies, pending:viewPlatformPending,
      features:viewPlatformFeatures, announce:viewPlatformAnnounce, audit:viewPlatformAudit, errors:viewPlatformErrors,
      'platform-users':viewPlatformUsers, 'platform-settings':viewPlatformSettings }[r] || viewPlatformOverview)();
    playViewTransition('p:'+key);
    $('#app-content').innerHTML = html;
    if (afterRender) afterRender();
    if (LANG==='so') translateNode($('#app-shell'));
    animateCounts($('#app-content'));
    window.scrollTo(0,0);
  }

  /* ---------------- Account status gate (pharmacy users) ---------------- */
  function showStatusGate(status){
    $('#app-shell').hidden = true;
    const screen = $('#login-screen'); screen.hidden = false;
    const info = {
      pending:  { ico:'clock', color:'amber', title:'Awaiting approval', emoji:'⏳',
        msg:'Your pharmacy account is being reviewed by the platform admin. You’ll get full access as soon as it’s approved.' },
      suspended:{ ico:'alert', color:'red', title:'Account suspended', emoji:'⛔',
        msg:'Your pharmacy has been suspended. Please contact the platform administrator to restore access.' },
      rejected: { ico:'x', color:'red', title:'Not approved', emoji:'🚫',
        msg:'Your pharmacy registration was not approved. Reach out to the platform administrator for details.' },
      billing:  { ico:'lock', color:'red', title:'Subscription expired', emoji:'🔒',
        msg:'Your monthly subscription has ended and the grace period is over. Please renew your subscription to restore access.' },
    }[status] || { ico:'info', color:'gray', title:'Unavailable', emoji:'ℹ️', msg:'Your account is currently unavailable.' };
    const s = Store.session() || {};
    screen.querySelector('.login-card').innerHTML = `
      <div class="login-brand"><div class="brand-logo">${BRAND_SVG}</div>
        <div style="flex:1"><h1 class="brand-name">PharmaCare</h1><p class="brand-tag">Pharmacy Management System</p></div></div>
      <div style="text-align:center;padding:14px 0 6px">
        <div style="font-size:46px;line-height:1;margin-bottom:14px">${info.emoji}</div>
        <h2 class="login-title" style="text-align:center">${info.title}</h2>
        <p class="login-sub" style="margin:8px auto 0;max-width:340px">${esc(info.msg)}</p>
      </div>
      <div class="login-hint" style="display:flex;align-items:center;gap:10px;justify-content:center">
        ${icon('user')} Signed in as <strong>${esc(s.name||'')}</strong></div>
      <button class="btn btn-secondary btn-block btn-lg" data-action="logout" style="margin-top:16px">${icon('refresh')} Sign out</button>`;
  }

  window.addEventListener('hashchange', () => { render(); $('#app-shell').classList.remove('nav-open'); });

  /* ============================================================ PLATFORM (super-admin) */
  const platStatusBadge = (s) => { const m={active:['green','Active'],pending:['amber','Pending'],suspended:['red','Suspended'],rejected:['gray','Rejected']};
    const [c,l]=m[s||'active']||m.active; return `<span class="badge ${c}">${c!=='gray'?`<span class="dot ${c}"></span>`:''}${l}</span>`; };
  const platPlanBadge = (p) => p==='pro' ? `<span class="badge teal">★ Pro</span>` : `<span class="badge gray">Free</span>`;
  const billBadge = (b) => { if(!b||b.unset) return `<span class="badge gray">No billing</span>`;
    const m={ active:['green','Active · '+b.daysLeft+'d left'], grace:['amber','Grace · '+b.daysLeft+'d'], locked:['red','Locked'] };
    const [c,l]=m[b.state]||['gray',b.state]; return `<span class="badge ${c}">${l}</span>`; };
  const smIcon = (n) => icon(n,'style="width:15px;height:15px"');

  function viewPlatformOverview(){
    const ph = Store.platform.pharmacies();
    const st = Store.platform.stats();
    const now = new Date(); const months=[];
    for(let i=5;i>=0;i--){ const d=new Date(now.getFullYear(), now.getMonth()-i, 1);
      months.push({ label:d.toLocaleDateString('en-GB',{month:'short'}), ts:d.getTime(), end:new Date(now.getFullYear(),now.getMonth()-i+1,1).getTime() }); }
    const growth = months.map(m=>({ label:m.label, value: ph.filter(p=>{const c=p.createdAt||0; return c>=m.ts && c<m.end;}).length }));
    const planData = [{label:'Free',value:st.total-st.pro},{label:'Pro',value:st.pro}].filter(x=>x.value>0);
    const pending = ph.filter(p=>p.status==='pending');
    const recent = [...ph].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,6);
    const kpi=(ico,color,label,val,extra)=>`<div class="kpi"><div class="kpi-top"><div class="kpi-ico ${color}">${icon(ico)}</div>${extra||''}</div><div class="kpi-label">${label}</div><div class="kpi-value">${val}</div></div>`;
    return `
    <div class="kpi-grid">
      ${kpi('pill','teal','Total Pharmacies',num(st.total))}
      ${kpi('check','green','Active',num(st.active))}
      ${kpi('inbox','amber','Pending Approval',num(st.pending), st.pending?`<a href="#/pending" class="btn btn-soft btn-sm">Review</a>`:'')}
      ${kpi('dollar','indigo','Platform Revenue',money(st.revenue))}
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-head">${icon('chart')}<h3>New Pharmacies — Last 6 Months</h3></div>
        <div class="card-body">${Charts.bars(growth)}</div></div>
      <div class="card"><div class="card-head">${icon('grid')}<h3>Plan Distribution</h3></div>
        <div class="card-body">${planData.length?Charts.donut(planData):emptyState('grid','No data','')}</div></div>
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-head">${icon('inbox')}<h3>Pending Approvals</h3><span class="spacer"></span>${pending.length?`<span class="badge amber">${pending.length}</span>`:''}</div>
        <div class="card-body" style="padding:8px 20px">${pending.length? `<div class="mini-list">${pending.slice(0,6).map(p=>`<div class="mini-item">
          <div class="mini-ico" style="background:var(--warning-soft);color:var(--warning)">${icon('pill')}</div>
          <div class="mini-main"><div class="mini-title">${esc(p.name)}</div><div class="mini-sub">${esc(p.ownerEmail||'')}</div></div>
          <div style="display:flex;gap:6px"><button class="btn btn-primary btn-sm" data-action="approve-pharmacy" data-id="${p.id}">${icon('check')} Approve</button>
          <button class="icon-btn sm" data-action="reject-pharmacy" data-id="${p.id}" title="Reject">${icon('x')}</button></div></div>`).join('')}</div>`
          : emptyState('check','All caught up','No pharmacies waiting for approval.')}</div></div>
      <div class="card"><div class="card-head">${icon('clock')}<h3>Recent Pharmacies</h3><span class="spacer"></span><a href="#/pharmacies" class="btn btn-ghost btn-sm">View all</a></div>
        <div class="card-body" style="padding:8px 20px"><div class="mini-list">${recent.map(p=>`<div class="mini-item">
          <span class="avatar" style="background:${avatarColor(p.name)}">${initials(p.name)}</span>
          <div class="mini-main"><div class="mini-title">${esc(p.name)}</div><div class="mini-sub">${esc(p.city||'')} · ${Store.dateFmt(p.createdAt)}</div></div>
          ${platStatusBadge(p.status)}</div>`).join('')}</div></div></div>
    </div>`;
  }

  function platformPharmacyRows(){
    const f=state.plat; let list=Store.platform.pharmacies();
    if(f.search){const q=f.search.toLowerCase();list=list.filter(p=>p.name.toLowerCase().includes(q)||(p.ownerEmail||'').toLowerCase().includes(q)||(p.city||'').toLowerCase().includes(q));}
    if(f.status!=='all')list=list.filter(p=>(p.status||'active')===f.status);
    if(f.plan!=='all')list=list.filter(p=>(p.plan||'free')===f.plan);
    if(!list.length)return emptyState('pill','No pharmacies found','Try adjusting your filters.');
    return `<div class="table-wrap"><table class="data"><thead><tr><th>Pharmacy</th><th>Owner</th><th>Plan</th><th>Status</th><th class="t-right">Products</th><th class="t-right">Revenue</th><th>Joined</th><th></th></tr></thead><tbody>${list.map(p=>{
      const s=p.stats||{}; const st=p.status||'active';
      const sa = st==='pending'?`<button class="icon-btn sm" data-action="approve-pharmacy" data-id="${p.id}" title="Approve">${icon('check')}</button>`
        : st==='active'?`<button class="icon-btn sm" data-action="suspend-pharmacy" data-id="${p.id}" title="Suspend">${icon('alert')}</button>`
        : st==='suspended'?`<button class="icon-btn sm" data-action="activate-pharmacy" data-id="${p.id}" title="Activate">${icon('refresh')}</button>`:'';
      return `<tr>
        <td><div style="display:flex;align-items:center;gap:11px"><span class="avatar" style="background:${avatarColor(p.name)}">${initials(p.name)}</span><div><div class="cell-main">${esc(p.name)}</div><div class="cell-sub">${esc(p.city||'—')}</div></div></div></td>
        <td><div class="cell-sub">${esc(p.ownerEmail||'—')}</div></td>
        <td>${platPlanBadge(p.plan)}</td><td>${platStatusBadge(st)}<div style="margin-top:4px">${billBadge(Store.billingState(p))}</div></td>
        <td class="t-right">${num(s.products||0)}</td><td class="t-right"><strong>${money(s.revenue||0)}</strong></td>
        <td><div class="cell-sub">${Store.dateFmt(p.createdAt)}</div></td>
        <td><div class="row-actions"><a class="icon-btn sm" href="#/pharmacy/${p.id}" title="View details">${icon('eye')}</a>${sa}<button class="icon-btn sm" data-action="delete-pharmacy" data-id="${p.id}" title="Delete">${icon('trash')}</button></div></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }
  function viewPlatformPharmacies(){
    const f=state.plat;
    afterRender=()=>{const si=$('#plat-search');if(si)si.oninput=()=>{state.plat.search=si.value;$('#plat-results').innerHTML=platformPharmacyRows();};
      const ss=$('#plat-status');if(ss)ss.onchange=()=>{state.plat.status=ss.value;$('#plat-results').innerHTML=platformPharmacyRows();};
      const pp=$('#plat-plan');if(pp)pp.onchange=()=>{state.plat.plan=pp.value;$('#plat-results').innerHTML=platformPharmacyRows();};};
    return `<div class="toolbar">
      <div class="search">${icon('search')}<input type="search" id="plat-search" placeholder="Search pharmacy, owner, city…" value="${esc(f.search)}"/></div>
      <select id="plat-status"><option value="all">All Status</option><option value="active" ${f.status==='active'?'selected':''}>Active</option><option value="pending" ${f.status==='pending'?'selected':''}>Pending</option><option value="suspended" ${f.status==='suspended'?'selected':''}>Suspended</option><option value="rejected" ${f.status==='rejected'?'selected':''}>Rejected</option></select>
      <select id="plat-plan"><option value="all">All Plans</option><option value="free" ${f.plan==='free'?'selected':''}>Free</option><option value="pro" ${f.plan==='pro'?'selected':''}>Pro</option></select>
      <span style="flex:1"></span>
      <button class="btn btn-primary" data-action="create-pharmacy">${icon('plus')} New Pharmacy</button>
    </div><div class="card"><div id="plat-results">${platformPharmacyRows()}</div></div>`;
  }
  function openCreatePharmacyModal(){
    modal({ title:'Create New Pharmacy', size:'lg', icon:'pill',
      body:`<form id="cp-form">
        <div class="form-section"><div class="form-section-title">${icon('pill')} Pharmacy</div><div class="form-grid">
          <label class="field full"><span class="field-label">Pharmacy Name *</span><input name="pharmacyName" required placeholder="e.g. Caafimaad Pharmacy"></label>
          <label class="field"><span class="field-label">City</span><input name="city" placeholder="e.g. Mogadishu"></label>
          <label class="field"><span class="field-label">Plan</span><select name="plan"><option value="free">Free</option><option value="pro">Pro</option></select></label>
        </div></div>
        <div class="form-section"><div class="form-section-title">${icon('user')} Owner (Administrator)</div><div class="form-grid">
          <label class="field"><span class="field-label">Owner Name *</span><input name="ownerName" required placeholder="e.g. Amina Yusuf"></label>
          <label class="field"><span class="field-label">Owner Email *</span><input name="ownerEmail" type="email" required placeholder="owner@email.com"></label>
          <label class="field full"><span class="field-label">Temporary Password *</span><input name="password" type="password" minlength="6" required placeholder="At least 6 characters"></label>
        </div>
        <p class="field-hint">The pharmacy starts <strong>clean</strong> (empty inventory) and <strong>active</strong> — the owner can sign in immediately with this email &amp; password and add their own medicines.</p></div>
      </form>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary" id="cp-save">${icon('plus')} Create Pharmacy</button>` });
    $('#cp-save').onclick = async () => {
      const f=$('#cp-form'); if(!f.reportValidity()) return;
      const d=Object.fromEntries(new FormData(f).entries());
      const btn=$('#cp-save'); btn.disabled=true; btn.textContent='Creating…';
      try { await Store.platform.createPharmacy(d); closeModal(); toast(`Pharmacy "${d.pharmacyName}" created.`,'success'); }
      catch(err){ btn.disabled=false; btn.innerHTML=`${icon('plus')} Create Pharmacy`; toast(friendlyAuthError(err),'error'); }
    };
  }

  function viewPlatformPending(){
    const list=Store.platform.pharmacies().filter(p=>p.status==='pending');
    if(!list.length)return emptyState('check','No pending approvals','New pharmacy registrations will appear here for your review.');
    return `<div class="grid-3">${list.map(p=>`<div class="card"><div class="card-pad">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><span class="avatar" style="background:${avatarColor(p.name)}">${initials(p.name)}</span>
        <div style="flex:1;min-width:0"><div class="cell-main" style="font-size:15px">${esc(p.name)}</div><div class="cell-sub">${esc(p.city||'')}</div></div></div>
      <div style="display:flex;flex-direction:column;gap:7px;font-size:13px;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:9px;color:var(--text-2)">${smIcon('user')} ${esc(p.ownerName||'—')}</div>
        <div style="display:flex;align-items:center;gap:9px;color:var(--text-2)">${smIcon('mail')} ${esc(p.ownerEmail||'—')}</div>
        <div style="display:flex;align-items:center;gap:9px;color:var(--text-2)">${smIcon('calendar')} ${Store.dateFmt(p.createdAt)}</div></div>
      <div style="display:flex;gap:8px"><button class="btn btn-primary" style="flex:1" data-action="approve-pharmacy" data-id="${p.id}">${icon('check')} Approve</button>
        <button class="btn btn-secondary" data-action="reject-pharmacy" data-id="${p.id}">${icon('x')} Reject</button></div>
    </div></div>`).join('')}</div>`;
  }

  function viewPlatformUsers(){
    const users=Store.platform.users(); const phById={}; Store.platform.pharmacies().forEach(p=>phById[p.id]=p.name);
    if(!users.length)return emptyState('users','No users yet','Users across all pharmacies will appear here.');
    return `<div class="card"><div class="table-wrap"><table class="data"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Pharmacy</th></tr></thead><tbody>${users.map(u=>`<tr>
      <td><div style="display:flex;align-items:center;gap:11px"><span class="avatar" style="background:${avatarColor(u.name)}">${initials(u.name)}</span><span class="cell-main">${esc(u.name)}</span></div></td>
      <td><div class="cell-sub">${esc(u.email||'—')}</div></td>
      <td><span class="badge ${u.role==='Administrator'?'teal':u.role==='Pharmacist'?'blue':'gray'}">${esc(u.role||'Staff')}</span></td>
      <td>${esc(phById[u.pharmacyId]||'—')}</td></tr>`).join('')}</tbody></table></div></div>`;
  }

  function viewPlatformSettings(){
    const s=Store.session()||{}; const st=Store.platform.stats();
    return `<div class="settings-grid">
      <div class="card"><div class="card-head">${icon('user')}<h3>Your Admin Account</h3></div><div class="card-body">
        <div style="display:flex;align-items:center;gap:14px"><span class="avatar" style="width:52px;height:52px;font-size:18px;background:${avatarColor(s.name||'A')}">${initials(s.name||'A')}</span>
          <div><div class="cell-main" style="font-size:16px">${esc(s.name||'Platform Admin')}</div><div class="cell-sub">${esc(s.email||s.username||'')}</div>
          <span class="badge teal" style="margin-top:5px">👑 ${esc(s.role||'Super Admin')}</span></div></div></div></div>
      <div class="card"><div class="card-head">${icon('grid')}<h3>Platform Summary</h3></div><div class="card-body">
        <div class="stat-inline"><div class="si"><div class="si-label">Pharmacies</div><div class="si-value">${st.total}</div></div>
          <div class="si"><div class="si-label">Users</div><div class="si-value">${st.users}</div></div>
          <div class="si"><div class="si-label">Pro plans</div><div class="si-value">${st.pro}</div></div></div></div></div>
      <div class="card"><div class="card-head">${icon('info')}<h3>About</h3></div><div class="card-body">
        <p class="muted" style="font-size:13px;line-height:1.6">You are signed in as the platform operator. Approve new pharmacies, manage plans, and suspend or remove tenants. Each pharmacy's data stays fully isolated — you access it only for support.</p>
        <div class="badge ${Store.isCloud()?'teal':'gray'}" style="margin-top:12px">${Store.isCloud()?'☁ Cloud mode':'💾 Local demo'}</div></div></div>
    </div>`;
  }

  function viewPlatformPharmacyDetail(pid){
    const p=Store.platform.pharmacies().find(x=>x.id===pid);
    if(!p)return emptyState('pill','Pharmacy not found','It may have been removed.', `<a href="#/pharmacies" class="btn btn-primary">Back to pharmacies</a>`);
    const s=p.stats||{}; const st=p.status||'active'; const staff=Store.platform.usersOf(pid);
    const actions=[];
    if(st==='pending')actions.push(`<button class="btn btn-primary" data-action="approve-pharmacy" data-id="${pid}">${icon('check')} Approve</button>`,`<button class="btn btn-secondary" data-action="reject-pharmacy" data-id="${pid}">${icon('x')} Reject</button>`);
    if(st==='active')actions.push(`<button class="btn btn-secondary" data-action="suspend-pharmacy" data-id="${pid}">${icon('alert')} Suspend</button>`);
    if(st==='suspended')actions.push(`<button class="btn btn-primary" data-action="activate-pharmacy" data-id="${pid}">${icon('refresh')} Activate</button>`);
    const planBtn = p.plan==='pro'?`<button class="btn btn-secondary" data-action="set-plan-free" data-id="${pid}">Downgrade to Free</button>`:`<button class="btn btn-soft" data-action="set-plan-pro" data-id="${pid}">★ Upgrade to Pro</button>`;
    return `<a href="#/pharmacies" class="btn btn-ghost btn-sm" style="margin-bottom:14px">← Back to pharmacies</a>
    <div class="card" style="margin-bottom:18px"><div class="card-body" style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
      <span class="avatar" style="width:64px;height:64px;font-size:24px;background:${avatarColor(p.name)}">${initials(p.name)}</span>
      <div style="flex:1;min-width:200px"><div style="font-family:var(--font-display);font-size:22px;font-weight:800">${esc(p.name)}</div>
        <div class="muted" style="font-size:13px;margin-top:3px">${esc(p.city||'')} · Owner: ${esc(p.ownerEmail||'—')} · Joined ${Store.dateFmt(p.createdAt)}</div>
        <div style="display:flex;gap:8px;margin-top:9px;flex-wrap:wrap">${platStatusBadge(st)} ${platPlanBadge(p.plan)} ${billBadge(Store.billingState(p))}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">${actions.join('')} ${planBtn}
        <button class="btn btn-soft" data-action="impersonate" data-id="${pid}">${icon('eye')} Open as</button>
        <button class="btn btn-primary" data-action="message-pharmacy" data-id="${pid}">${icon('mail')} Send Message</button>
        <button class="btn btn-secondary" data-action="edit-pharmacy" data-id="${pid}">${icon('edit')} Edit</button>
        ${p.ownerEmail?`<button class="btn btn-secondary" data-action="reset-pw" data-email="${esc(p.ownerEmail)}">${icon('lock')} Reset password</button>`:''}
        <button class="btn btn-danger" data-action="delete-pharmacy" data-id="${pid}">${icon('trash')} Delete</button></div>
    </div></div>
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico teal">${icon('box')}</div></div><div class="kpi-label">Products</div><div class="kpi-value">${num(s.products||0)}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico indigo">${icon('receipt')}</div></div><div class="kpi-label">Sales</div><div class="kpi-value">${num(s.sales||0)}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico green">${icon('dollar')}</div></div><div class="kpi-label">Revenue</div><div class="kpi-value">${money(s.revenue||0)}</div></div>
    </div>
    ${(()=>{ const b=Store.billingState(p); const sub=p.subscription||{};
      return `<div class="card" style="margin-bottom:18px"><div class="card-head">${icon('dollar')}<h3>Subscription Billing</h3><span class="spacer"></span>${billBadge(b)}</div>
        <div class="card-body" style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
          <div class="si"><div class="si-label">Monthly fee</div><div class="si-value">${money(sub.amount||Store.getConfig().billing.defaultMonthlyFee)}</div></div>
          <div class="si"><div class="si-label">Paid until</div><div class="si-value" style="font-size:16px">${sub.paidUntil?Store.dateFmt(sub.paidUntil):'—'}</div></div>
          <div class="si"><div class="si-label">Last payment</div><div class="si-value" style="font-size:16px">${sub.lastPaymentAt?Store.dateFmt(sub.lastPaymentAt):'—'}</div></div>
          <span class="spacer"></span>
          <button class="btn btn-primary" data-action="record-subscription" data-id="${pid}">${icon('dollar')} Record Payment (+1 month)</button>
        </div></div>`; })()}
    <div class="card"><div class="card-head">${icon('users')}<h3>Staff (${staff.length})</h3></div><div class="card-body" style="padding:8px 20px">
      ${staff.length?`<div class="mini-list">${staff.map(u=>`<div class="mini-item"><span class="avatar" style="background:${avatarColor(u.name)}">${initials(u.name)}</span>
        <div class="mini-main"><div class="mini-title">${esc(u.name)}</div><div class="mini-sub">${esc(u.email||'')}</div></div>
        <span class="badge ${u.role==='Administrator'?'teal':'gray'}">${esc(u.role||'Staff')}</span></div>`).join('')}</div>`:`<p class="muted" style="padding:14px 0;font-size:13px">No staff records.</p>`}
    </div></div>`;
  }

  function announcementBanner(a){
    const c = { info:'blue', success:'green', warn:'amber' }[a.type] || 'blue';
    const ic = { info:'info', success:'check', warn:'alert' }[a.type] || 'info';
    return `<div class="announce-banner ${c}">${icon(ic)}<span>${esc(a.message)}</span></div>`;
  }
  function billingBanner(bill){
    if (!bill) return '';
    if (bill.state === 'grace'){
      const daysStr = bill.daysLeft === 1 ? t('day') : t('days');
      return `<div class="announce-banner amber">${icon('alert')}<span><strong>${t('Subscription expired.')}</strong> ${t('Pay within')} <strong>${bill.daysLeft}</strong> ${daysStr} ${t('to avoid your account being locked. Please contact your provider to renew.')}</span></div>`;
    }
    if (bill.state === 'active' && bill.daysLeft != null && bill.daysLeft <= 5){
      const daysStr = bill.daysLeft === 1 ? t('day') : t('days');
      return `<div class="announce-banner blue">${icon('clock')}<span>${t('Your subscription renews in')} <strong>${bill.daysLeft}</strong> ${daysStr}.</span></div>`;
    }
    return '';
  }

  function viewPlatformFeatures(){
    const cfg = Store.platform.config();
    const feats = Object.entries(cfg.features);
    afterRender = () => {
      $$('.feat-toggle').forEach(t=> t.onchange=()=>{ Store.platform.saveConfig({ features:{ [t.dataset.key]:{ enabled:t.checked } } }); toast('Feature '+(t.checked?'enabled':'disabled')+'.','success'); });
      $$('.feat-plan').forEach(s=> s.onchange=()=>{ Store.platform.saveConfig({ features:{ [s.dataset.key]:{ minPlan:s.value } } }); toast('Minimum plan updated.','success'); });
      const pf=$('#plan-form'); if(pf) pf.onsubmit=(e)=>{ e.preventDefault(); const d=Object.fromEntries(new FormData(pf).entries());
        Store.platform.saveConfig({ plans:{ free:{maxProducts:+d['free.maxProducts'],maxStaff:+d['free.maxStaff']}, pro:{maxProducts:+d['pro.maxProducts'],maxStaff:+d['pro.maxStaff']} } }); toast('Plan limits saved.','success'); };
    };
    return `<div class="grid-2">
      <div class="card"><div class="card-head">${icon('tag')}<h3>Feature Flags</h3><span class="spacer"></span><span class="muted" style="font-size:12px">module · min-plan · on/off</span></div>
        <div class="card-body" style="padding:6px 20px">${feats.map(([key,f])=>`<div class="feat-row">
          <div class="feat-main"><div class="feat-name">${esc(f.label)}</div><div class="feat-key">${esc(key)}</div></div>
          <select class="feat-plan" data-key="${key}"><option value="free" ${f.minPlan==='free'?'selected':''}>Free+</option><option value="pro" ${f.minPlan==='pro'?'selected':''}>Pro only</option></select>
          <label class="switch"><input type="checkbox" class="feat-toggle" data-key="${key}" ${f.enabled!==false?'checked':''}><span class="switch-slider"></span></label>
        </div>`).join('')}</div></div>
      <div class="card"><div class="card-head">${icon('dollar')}<h3>Plan Limits</h3></div>
        <div class="card-body"><form id="plan-form" style="display:flex;flex-direction:column;gap:18px">
          <div><div class="field-label" style="margin-bottom:9px;color:var(--text)">Free plan</div><div class="form-grid">
            <label class="field"><span class="field-label">Max products</span><input name="free.maxProducts" type="number" min="0" value="${cfg.plans.free.maxProducts}"></label>
            <label class="field"><span class="field-label">Max staff</span><input name="free.maxStaff" type="number" min="0" value="${cfg.plans.free.maxStaff}"></label></div></div>
          <div><div class="field-label" style="margin-bottom:9px;color:var(--text)">Pro plan</div><div class="form-grid">
            <label class="field"><span class="field-label">Max products</span><input name="pro.maxProducts" type="number" min="0" value="${cfg.plans.pro.maxProducts}"></label>
            <label class="field"><span class="field-label">Max staff</span><input name="pro.maxStaff" type="number" min="0" value="${cfg.plans.pro.maxStaff}"></label></div></div>
          <button class="btn btn-primary" type="submit">${icon('save')} Save Plan Limits</button>
        </form></div></div>
    </div>`;
  }

  function viewPlatformAnnounce(){
    const a = Store.platform.config().announcement;
    afterRender = () => { const f=$('#announce-form'); if(f) f.onsubmit=(e)=>{ e.preventDefault();
      const d=Object.fromEntries(new FormData(f).entries());
      Store.platform.saveConfig({ announcement:{ message:d.message, type:d.type, active: f.querySelector('[name=active]').checked } });
      toast('Announcement saved & broadcast.','success'); render(); }; };
    return `<div class="grid-2">
      <div class="card"><div class="card-head">${icon('mail')}<h3>Broadcast Announcement</h3></div>
        <div class="card-body"><form id="announce-form" style="display:flex;flex-direction:column;gap:14px">
          <label class="field"><span class="field-label">Message</span><textarea name="message" placeholder="e.g. 🎉 New: barcode scanning is now live for Pro pharmacies!">${esc(a.message||'')}</textarea></label>
          <div class="form-grid">
            <label class="field"><span class="field-label">Type</span><select name="type"><option value="info" ${a.type==='info'?'selected':''}>Info (blue)</option><option value="success" ${a.type==='success'?'selected':''}>Success (green)</option><option value="warn" ${a.type==='warn'?'selected':''}>Warning (amber)</option></select></label>
            <label class="field"><span class="field-label">Active (show to all)</span><label class="switch" style="margin-top:7px"><input type="checkbox" name="active" ${a.active?'checked':''}><span class="switch-slider"></span></label></label>
          </div>
          <button class="btn btn-primary" type="submit">${icon('save')} Save &amp; Broadcast</button>
        </form></div></div>
      <div class="card"><div class="card-head">${icon('eye')}<h3>Live Preview</h3></div>
        <div class="card-body">${a.message?announcementBanner(a):emptyState('mail','No message yet','Pharmacies see a banner at the top of their app when this is active.')}
          <p class="muted" style="font-size:12.5px;margin-top:14px">Status: ${a.active?'<span class="badge green">● Broadcasting</span>':'<span class="badge gray">○ Off</span>'}</p></div></div>
    </div>`;
  }

  function viewPlatformAudit(){
    const log = Store.platform.audit();
    if(!log.length) return emptyState('clock','No activity yet','Admin actions (approvals, plan changes, deletions, config edits) are recorded here.');
    const meta=(a)=>({ 'pharmacy.active':['green','approved / activated'],'pharmacy.pending':['amber','set to pending'],'pharmacy.suspended':['red','suspended'],'pharmacy.rejected':['gray','rejected'],'pharmacy.delete':['red','deleted'],'pharmacy.edit':['blue','edited'],'plan.pro':['teal','upgraded to Pro'],'plan.free':['gray','moved to Free'],'config.update':['blue','updated platform config'] }[a]||['gray',a]);
    return `<div class="card"><div class="card-body" style="padding:6px 20px"><div class="mini-list">${log.map(e=>{const [c,verb]=meta(e.action);
      return `<div class="mini-item"><div class="mini-ico" style="background:var(--surface-2);color:var(--text-2)">${icon('clock')}</div>
        <div class="mini-main"><div class="mini-title"><strong>${esc(e.by||'Admin')}</strong> ${esc(verb)}${e.target?` · <strong>${esc(e.target)}</strong>`:''}</div><div class="mini-sub">${Store.dateTimeFmt(e.at)}</div></div>
        <span class="badge ${c}">${esc(e.action)}</span></div>`;}).join('')}</div></div></div>`;
  }

  function viewPlatformErrors(){
    const errs = Store.platform.errors();
    if(!errs.length) return emptyState('check','No errors reported','Client-side errors from any pharmacy appear here for troubleshooting.');
    const phName={}; Store.platform.pharmacies().forEach(p=>phName[p.id]=p.name);
    return `<div class="toolbar"><span class="muted" style="font-weight:500">${errs.length} ${errs.length===1?'report':'reports'}</span>
        <span style="flex:1"></span>
        <button class="btn btn-danger btn-sm" data-action="clear-all-errors">${icon('trash')} Clear All</button></div>
      <div class="card"><div class="table-wrap"><table class="data"><thead><tr><th>Error</th><th>Pharmacy</th><th>Where</th><th>When</th><th></th></tr></thead><tbody>${errs.map(e=>`<tr>
      <td><div class="cell-main" style="font-weight:500;color:var(--danger)">${esc(e.message)}</div>${e.email?`<div class="cell-sub">${esc(e.email)}</div>`:''}</td>
      <td>${esc(phName[e.pharmacyId]||e.pharmacyId||'—')}</td>
      <td><code style="font-size:12px">${esc(e.url||'—')}</code></td>
      <td><div class="cell-sub">${Store.dateTimeFmt(e.at)}</div></td>
      <td><button class="icon-btn sm" data-action="clear-error" data-id="${e.id}" title="Dismiss">${icon('check')}</button></td></tr>`).join('')}</tbody></table></div></div>`;
  }

  function openEditPharmacyModal(pid){
    const p = Store.platform.pharmacies().find(x=>x.id===pid); if(!p) return;
    modal({ title:'Edit Pharmacy', icon:'pill',
      body:`<form id="editph-form"><div class="form-grid">
        <label class="field full"><span class="field-label">Pharmacy Name</span><input name="name" value="${esc(p.name||'')}" required></label>
        <label class="field"><span class="field-label">City</span><input name="city" value="${esc(p.city||'')}"></label>
        <label class="field"><span class="field-label">Owner Email</span><input name="ownerEmail" value="${esc(p.ownerEmail||'')}"></label>
      </div></form>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary" id="save-editph">${icon('save')} Save</button>` });
    $('#save-editph').onclick=()=>{ const f=$('#editph-form'); if(!f.reportValidity())return;
      Store.platform.updatePharmacy(pid, Object.fromEntries(new FormData(f).entries())); closeModal(); toast('Pharmacy updated.','success'); };
  }

  // Super-admin composes a direct message to ONE pharmacy.
  function openSendMessageModal(pid){
    const p = Store.platform.pharmacies().find(x=>x.id===pid); if(!p) return;
    const types = [['info','Info','blue'],['success','Success','green'],['warning','Important','amber']];
    modal({ title:'Send Message — '+p.name, size:'md', icon:'mail',
      body:`<form id="msg-form" style="display:flex;flex-direction:column;gap:14px">
        <div class="form-grid">
          <label class="field"><span class="field-label">From (sender / role) *</span>
            <input name="from" required value="Engineer" placeholder="e.g. Engineer, Support Team"></label>
          <label class="field"><span class="field-label">Type</span>
            <select name="type">${types.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>
        </div>
        <label class="field"><span class="field-label">Title *</span>
          <input name="title" required maxlength="80" placeholder="e.g. Cusboonaysiin nidaamka"></label>
        <label class="field"><span class="field-label">Message *</span>
          <textarea name="body" required maxlength="800" rows="5" placeholder="Qor fariintaada halkan…"></textarea></label>
        <p class="field-hint">${icon('info')} Fariintani waxay u soo bixi doontaa ${esc(p.name)} qaab quruxsan markay soo galaan.</p>
      </form>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button>
        <button class="btn btn-primary" id="msg-send">${icon('mail')} Send Message</button>` });
    $('#msg-send').onclick = async () => {
      const f=$('#msg-form'); if(!f.reportValidity()) return;
      const d=Object.fromEntries(new FormData(f).entries());
      const btn=$('#msg-send'); btn.disabled=true; btn.textContent='Sending…';
      try{ await Store.platform.sendMessage(pid, d); closeModal(); toast('Message sent to '+p.name+'.','success'); }
      catch(err){ btn.disabled=false; btn.innerHTML=`${icon('mail')} Send Message`; toast((err&&err.message)||'Failed to send.','error'); }
    };
  }

  /* ---------- Pharmacy side: show a direct message from the operator ---------- */
  function openDirectMessageModal(dm){
    const typ = dm.type==='success' ? {c:'var(--success)', sf:'var(--success-soft)', ic:'check'}
              : dm.type==='warning' ? {c:'var(--warning)', sf:'var(--warning-soft)', ic:'alert'}
              : {c:'var(--primary)', sf:'var(--primary-soft)', ic:'mail'};
    const from = dm.from||'PharmaCare Team';
    modal({ title:'', size:'sm', icon:'mail', body:`
      <div class="dm-wrap">
        <div class="dm-accent" style="background:${typ.c}"></div>
        <div class="dm-head">
          <span class="dm-avatar" style="background:${avatarColor(from)}">${initials(from)}</span>
          <div class="dm-who"><div class="dm-from">${esc(from)}</div>
            <div class="dm-role">${icon('shield')} Official message · ${relTime(dm.at)}</div></div>
          <span class="dm-badge" style="background:${typ.sf};color:${typ.c}">${icon(typ.ic)}</span>
        </div>
        ${dm.title?`<h3 class="dm-title">${esc(dm.title)}</h3>`:''}
        <p class="dm-body">${esc(dm.body).replace(/\n/g,'<br>')}</p>
      </div>`,
      footer:`<button class="btn btn-primary btn-block" data-modal-close>${t('Got it')}</button>` });
  }
  function checkDirectMessage(){
    const p = Store.getMyPharmacy(); if(!p) return;
    const dm = p.directMessage; if(!dm || !dm.id) return;
    let seen=null; try{ seen=localStorage.getItem('pharma_seen_msg'); }catch(_){}
    if(seen === dm.id) return;
    try{ localStorage.setItem('pharma_seen_msg', dm.id); }catch(_){}
    openDirectMessageModal(dm);
  }

  function openSubscriptionModal(pid){
    const p = Store.platform.pharmacies().find(x=>x.id===pid); if(!p) return;
    const b = Store.billingState(p); const sub = p.subscription||{}; const cur = Store.getSettings().currency;
    const fee = sub.amount || Store.getConfig().billing.defaultMonthlyFee;
    modal({ title:'Record Subscription Payment — '+p.name, icon:'dollar',
      body:`<div style="margin-bottom:16px;display:flex;gap:20px;flex-wrap:wrap">
          <div class="si"><div class="si-label">Current status</div><div style="margin-top:4px">${billBadge(b)}</div></div>
          <div class="si"><div class="si-label">Paid until</div><div class="si-value" style="font-size:16px">${sub.paidUntil?Store.dateFmt(sub.paidUntil):'—'}</div></div></div>
        <form id="sub-form"><div class="form-grid">
          <label class="field"><span class="field-label">Amount (this month) *</span><div class="input-affix"><span class="affix">${esc(cur)}</span><input name="amount" type="number" step="0.01" min="0" value="${fee}" required></div></label>
          <label class="field"><span class="field-label">Extends by</span><input value="1 month" disabled></label>
        </div><p class="field-hint">Recording a payment sets <strong>paid until</strong> to one month from ${b.state==='active'?'the current expiry':'today'} and restores access if locked.</p></form>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary" id="save-sub">${icon('check')} Record Payment</button>` });
    $('#save-sub').onclick=async()=>{ const f=$('#sub-form'); if(!f.reportValidity())return;
      const amt=+($('#sub-form [name=amount]').value)||0;
      const btn=$('#save-sub'); btn.disabled=true; btn.textContent='Saving…';
      try{ await Store.platform.recordSubscriptionPayment(pid, amt); closeModal(); toast('Subscription payment recorded · +1 month.','success'); }
      catch(err){ btn.disabled=false; btn.innerHTML=`${icon('check')} Record Payment`; toast(err.message||'Failed.','error'); } };
  }

  async function enterSupportMode(pid){
    const p = Store.platform.pharmacies().find(x=>x.id===pid); if(!p) return;
    if (!Store.isCloud()){ toast('Open-as uses real tenant data — available in Cloud mode.','warn'); return; }
    toast('Opening '+p.name+'…','info');
    try {
      const data = await Store.fetchPharmacy(pid);
      if (Cloud.stopSuperListening) Cloud.stopSuperListening(); // pause platform listeners while impersonating
      Store.enterSupport(pid, p.name, data);
      location.hash = '#/dashboard'; render();
    } catch(e){ toast('Could not open pharmacy: '+(e.message||''),'error'); }
  }

  /* ============================================================ DASHBOARD */
  function viewDashboard(){
    const meds = Store.all('medicines');
    const today = Store.todaySales();
    const todayRev = Store.revenue(today);
    const allSales = Store.all('sales');
    const lowStock = Store.lowStockItems();
    const expiring = Store.expiringItems();

    // 14-day trend
    const days = [];
    for (let i=13;i>=0;i--){ const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-i);
      const next = d.getTime()+86400000;
      const rev = Store.revenue(Store.salesBetween(d.getTime(), next-1));
      days.push({ label:d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}), value:+rev.toFixed(2) }); }

    // category donut
    const catCount = {};
    meds.forEach(m=>{ catCount[m.category]=(catCount[m.category]||0)+1; });
    const donutData = Object.entries(catCount).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);

    // top products (by qty sold all-time)
    const sold = {};
    allSales.forEach(s=> s.items.forEach(it=>{ sold[it.name]=(sold[it.name]||0)+it.qty; }));
    const top = Object.entries(sold).map(([name,qty])=>({name,qty})).sort((a,b)=>b.qty-a.qty).slice(0,5);
    const maxTop = Math.max(...top.map(t=>t.qty),1);

    const recent = allSales.slice().sort((a,b)=>(b.date||0)-(a.date||0)).slice(0,6);

    const kpi = (ico, color, label, value, trend, extra) => `<div class="kpi">
      <div class="kpi-top"><div class="kpi-ico ${color}">${icon(ico)}</div>${trend||''}</div>
      <div class="kpi-label">${label}</div><div class="kpi-value">${value}</div>${extra||''}</div>`;

    const yesterday = (()=>{ const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-1);
      return Store.revenue(Store.salesBetween(d.getTime(), d.getTime()+86399999)); })();
    const revTrend = yesterday>0 ? ((todayRev-yesterday)/yesterday*100) : 0;
    const trendBadge = `<span class="kpi-trend ${revTrend>=0?'up':'down'}">${icon(revTrend>=0?'trendUp':'trendDown')}${Math.abs(revTrend).toFixed(0)}%</span>`;

    const hour=new Date().getHours();
    const greet = hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
    const fname = ((Store.session()||{}).name||'').split(' ')[0];
    const todayStr = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});

    // Needs-attention strip: one glanceable row of everything that needs action.
    const outStock = Store.all('medicines').filter(m=>(m.quantity||0)<=0).length;
    const expSoon = Store.expiringItems().length;
    const debtCount = Store.featureEnabled('deyn') ? Store.debtors().length : 0;
    const attn = [];
    if(lowStock.length) attn.push(['pill','amber',t('Low stock'),lowStock.length,'#/inventory']);
    if(outStock)        attn.push(['box','red',t('Out of stock'),outStock,'#/inventory']);
    if(expSoon)         attn.push(['clock','red',t('Expiring / expired'),expSoon,'#/inventory']);
    if(debtCount)       attn.push(['dollar','teal',t('Debtors'),debtCount,'#/deyn']);
    const attnStrip = attn.length ? `<div class="attention-strip">
      <div class="as-head">${icon('alert')}<span>${t('Needs attention')}</span></div>
      <div class="as-items">${attn.map(a=>`<a href="${a[4]}" class="as-chip ${a[1]}"><span class="as-ico">${icon(a[0])}</span><b>${num(a[3])}</b> ${a[2]}</a>`).join('')}</div>
    </div>` : '';

    // Gentle backup reminder (per-browser) once there is data to lose.
    const bAge = backupAgeDays();
    const backupBanner = (allSales.length && (bAge===null || bAge>=7)) ? `<div class="announce-banner amber dash-backup">
      ${icon('box')}<span>${bAge===null?t('You haven’t made a backup yet.'):t('Your last backup was %d days ago.').replace('%d',bAge)} ${t('Download a backup to keep your data safe.')}</span>
      <button class="btn btn-soft btn-sm" data-action="export-data" style="margin-left:auto">${icon('download')} ${t('Backup now')}</button></div>` : '';

    return `
    <div class="dash-greeting"><div><h2>${t(greet)}, ${esc(fname)} 👋</h2><p class="muted">${todayStr}</p></div></div>
    ${backupBanner}
    ${attnStrip}
    <div class="kpi-grid">
      ${kpi('dollar','teal',"Today's Revenue", money(todayRev), trendBadge, Charts.spark(days.map(d=>d.value)))}
      ${kpi('cart','indigo',"Today's Sales", num(today.length)+' orders')}
      ${kpi('box','green','Inventory Value', money(Store.inventoryValue()))}
      ${kpi('alert','red','Low Stock Alerts', num(lowStock.length)+' items')}
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head">${icon('chart')}<h3>Revenue — Last 14 Days</h3><span class="spacer"></span>
          <span class="badge teal">${money(Store.revenue(Store.salesBetween(days[0]?Date.now()-14*86400000:0, Date.now())))} total</span></div>
        <div class="card-body">${Charts.line(days, { valueFmt:(v)=>Store.getSettings().currency+v })}</div>
      </div>
      <div class="card">
        <div class="card-head">${icon('grid')}<h3>Stock by Category</h3></div>
        <div class="card-body">${Charts.donut(donutData)}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head">${icon('receipt')}<h3>Recent Sales</h3><span class="spacer"></span>
          <a href="#/sales" class="btn btn-ghost btn-sm">View all ${icon('trendUp')}</a></div>
        <div class="card-body" style="padding:8px 20px">
          ${recent.length ? `<div class="mini-list">${recent.map(s=>{
            const cust = Store.find('customers', s.customerId);
            return `<div class="mini-item">
              <div class="mini-ico" style="background:var(--primary-soft);color:var(--primary-700)">${icon('receipt')}</div>
              <div class="mini-main"><div class="mini-title">${esc(s.invoiceNo)}</div>
                <div class="mini-sub">${esc(cust?cust.name:'Walk-in')} · ${relTime(s.date)}</div></div>
              <div class="mini-val">${money(s.total)}</div></div>`;
          }).join('')}</div>` : emptyState('receipt','No sales yet','Sales will appear here once you make them.')}
        </div>
      </div>
      <div class="card">
        <div class="card-head">${icon('trendUp')}<h3>Top Selling Products</h3></div>
        <div class="card-body" style="padding:16px 20px">
          ${top.length ? top.map((t,i)=>`<div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px">
              <span style="font-weight:600">${i+1}. ${esc(t.name)}</span><span class="muted">${t.qty} sold</span></div>
            <div class="bar-track"><div class="bar-fill" style="width:${(t.qty/maxTop*100).toFixed(0)}%"></div></div>
          </div>`).join('') : emptyState('box','No data','Make some sales to see top products.')}
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head">${icon('alert')}<h3>Low Stock</h3><span class="spacer"></span>
          ${lowStock.length?`<span class="badge amber">${lowStock.length} need reorder</span>`:''}</div>
        <div class="card-body" style="padding:8px 20px">
          ${lowStock.length ? `<div class="mini-list">${lowStock.slice(0,6).map(m=>{
            const st = Store.stockStatus(m);
            return `<div class="mini-item">
              <div class="mini-ico" style="background:var(--${st.color==='red'?'danger':'warning'}-soft);color:var(--${st.color==='red'?'danger':'warning'})">${icon('pill')}</div>
              <div class="mini-main"><div class="mini-title">${esc(m.name)}</div><div class="mini-sub">${esc(m.category)}</div></div>
              <span class="badge ${st.color}">${m.quantity} left</span></div>`;
          }).join('')}</div>` : emptyState('check','All good!','No low stock items right now.')}
        </div>
      </div>
      <div class="card">
        <div class="card-head">${icon('clock')}<h3>Expiring Soon</h3><span class="spacer"></span>
          ${expiring.length?`<span class="badge red">${expiring.length} items</span>`:''}</div>
        <div class="card-body" style="padding:8px 20px">
          ${expiring.length ? `<div class="mini-list">${expiring.slice(0,6).map(m=>{
            const ex = Store.expiryStatus(m);
            return `<div class="mini-item">
              <div class="mini-ico" style="background:var(--${ex.color}-soft);color:var(--${ex.color==='red'?'danger':'warning'})">${icon('clock')}</div>
              <div class="mini-main"><div class="mini-title">${esc(m.name)}</div><div class="mini-sub">Exp: ${Store.dateFmt(m.expiryDate)}</div></div>
              <span class="badge ${ex.color}">${ex.label}</span></div>`;
          }).join('')}</div>` : emptyState('check','All fresh!','No medicines expiring soon.')}
        </div>
      </div>
    </div>`;
  }

  /* ============================================================ INVENTORY */
  function inventoryRows(){
    const s = state.inv;
    let meds = Store.all('medicines');
    if (s.search){ const q=s.search.toLowerCase();
      meds = meds.filter(m => m.name.toLowerCase().includes(q) || (m.genericName||'').toLowerCase().includes(q) || (m.barcode||'').includes(q)); }
    if (s.category!=='all') meds = meds.filter(m=>m.category===s.category);
    if (s.status!=='all') meds = meds.filter(m=>{
      if (s.status==='low') return Store.stockStatus(m).key!=='ok';
      if (s.status==='out') return Store.stockStatus(m).key==='out';
      if (s.status==='expiring') return ['expired','critical','soon'].includes(Store.expiryStatus(m).key);
      return true; });

    if (!meds.length) return emptyState('pill','No medicines found','Try adjusting your filters or add a new medicine.',
      `<button class="btn btn-primary" data-action="add-medicine">${icon('plus')} Add Medicine</button>`);

    return `<div class="table-wrap"><table class="data">
      <thead><tr><th>Medicine</th><th>Category</th><th>Stock</th><th class="t-right">Cost</th><th class="t-right">Price</th><th>Expiry</th><th>Supplier</th><th></th></tr></thead>
      <tbody>${meds.map(m=>{
        const st = Store.stockStatus(m); const ex = Store.expiryStatus(m);
        const sup = Store.find('suppliers', m.supplierId);
        return `<tr>
          <td><div class="cell-main">${esc(m.name)}</div><div class="cell-sub">${esc(m.genericName||'')} ${m.barcode?'· '+esc(m.barcode):''}</div></td>
          <td><span class="badge gray">${esc(m.category)}</span></td>
          <td><span class="badge ${st.color}"><span class="dot ${st.color}"></span>${m.quantity} ${esc(m.unit||'pcs')}</span></td>
          <td class="t-right">${money(m.costPrice)}</td>
          <td class="t-right"><strong>${money(m.sellPrice)}</strong></td>
          <td><div class="cell-sub">${Store.dateFmt(m.expiryDate)}</div><span class="badge ${ex.color}" style="margin-top:2px">${ex.label}</span></td>
          <td><div class="cell-sub">${esc(sup?sup.name:'—')}</div></td>
          <td><div class="row-actions">
            <button class="icon-btn sm" data-action="adjust-stock" data-id="${m.id}" title="Adjust stock" aria-label="Adjust stock">${icon('adjust')}</button>
            <button class="icon-btn sm" data-action="edit-medicine" data-id="${m.id}" title="Edit" aria-label="Edit medicine">${icon('edit')}</button>
            <button class="icon-btn sm" data-action="delete-medicine" data-id="${m.id}" title="Delete" aria-label="Delete medicine">${icon('trash')}</button>
          </div></td></tr>`;
      }).join('')}</tbody></table></div>`;
  }

  function viewInventory(){
    const s = state.inv;
    const cats = ['all', ...Store.CATEGORIES];
    afterRender = () => {
      const si = $('#inv-search'); if(si){ si.oninput = debounce(() => { state.inv.search = si.value; $('#inv-results').innerHTML = inventoryRows(); });
        si.onfocus = () => si.setSelectionRange(si.value.length,si.value.length); }
      const cat = $('#inv-cat'); if(cat) cat.onchange = () => { state.inv.category = cat.value; $('#inv-results').innerHTML = inventoryRows(); };
      const stt = $('#inv-status'); if(stt) stt.onchange = () => { state.inv.status = stt.value; $('#inv-results').innerHTML = inventoryRows(); };
    };
    return `
    <div class="toolbar">
      <div class="search">${icon('search')}<input type="search" id="inv-search" placeholder="Search by name, generic or barcode…" value="${esc(s.search)}"/></div>
      <select id="inv-cat">${cats.map(c=>`<option value="${c}" ${s.category===c?'selected':''}>${c==='all'?'All Categories':c}</option>`).join('')}</select>
      <select id="inv-status">
        <option value="all" ${s.status==='all'?'selected':''}>All Status</option>
        <option value="low" ${s.status==='low'?'selected':''}>Low / Out of Stock</option>
        <option value="out" ${s.status==='out'?'selected':''}>Out of Stock</option>
        <option value="expiring" ${s.status==='expiring'?'selected':''}>Expiring Soon</option>
      </select>
      <span style="flex:1"></span>
      <button class="btn btn-secondary" data-action="reorder-list">${icon('inbox')} ${t('Reorder')}${Store.lowStockItems().length?` <span class="badge amber" style="margin-left:2px">${Store.lowStockItems().length}</span>`:''}</button>
      <button class="btn btn-secondary" data-action="stock-log">${icon('clock')} ${t('Stock Log')}</button>
      <button class="btn btn-secondary" data-action="export-inventory">${icon('download')} Export CSV</button>
      <button class="btn btn-secondary" data-action="open-catalog">${icon('package')} From Catalog</button>
      <button class="btn btn-primary" data-action="add-medicine">${icon('plus')} Add Medicine</button>
    </div>
    <div class="card"><div id="inv-results">${inventoryRows()}</div></div>`;
  }

  /* ---------- Stock adjustments (write-off / correction) ---------- */
  const ADJUST_REASONS = [
    ['expired','Expired / discarded','remove'],
    ['damaged','Damaged / broken','remove'],
    ['lost','Lost / theft','remove'],
    ['return-supplier','Returned to supplier','remove'],
    ['count-down','Count correction (down)','remove'],
    ['found','Found / recount up','add'],
    ['count-up','Count correction (up)','add'],
    ['other','Other','both'],
  ];
  function openStockAdjustModal(medId){
    const m = Store.find('medicines', medId); if(!m){ toast('Medicine not found.','error'); return; }
    modal({ title:'Adjust Stock — '+m.name, size:'sm', icon:'adjust',
      body:`<div class="adjust-cur"><span>${t('Current stock')}</span><strong>${m.quantity} ${esc(m.unit||'pcs')}</strong></div>
        <div class="seg" style="margin:14px 0">
          <button type="button" class="seg-btn active" data-adj-dir="remove">${icon('trendDown')} ${t('Remove')}</button>
          <button type="button" class="seg-btn" data-adj-dir="add">${icon('trendUp')} ${t('Add')}</button>
        </div>
        <div class="form-grid">
          <label class="field"><span class="field-label">${t('Quantity')} *</span><input type="number" id="adj-qty" min="1" step="1" value="1"/></label>
          <label class="field"><span class="field-label">${t('Reason')}</span><select id="adj-reason">${ADJUST_REASONS.map(r=>`<option value="${r[0]}">${t(r[1])}</option>`).join('')}</select></label>
        </div>
        <label class="field" style="margin-top:12px"><span class="field-label">${t('Note (optional)')}</span><input id="adj-note" placeholder="e.g. batch BTH-0012 expired"/></label>
        <div id="adj-preview" class="adjust-preview"></div>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary" id="adj-save">${icon('save')} ${t('Apply Adjustment')}</button>` });
    let dir='remove';
    const qtyI=$('#adj-qty'), prev=$('#adj-preview'), reasonSel=$('#adj-reason');
    const upd=()=>{ const q=Math.max(0,Math.floor(Number(qtyI.value)||0)); const after=dir==='remove'?Math.max(0,m.quantity-q):m.quantity+q;
      prev.innerHTML=`${m.quantity} <span class="ap-arrow">→</span> <strong>${after} ${esc(m.unit||'pcs')}</strong>`; prev.className='adjust-preview '+(dir==='remove'?'down':'up'); };
    $$('.seg-btn').forEach(b=> b.onclick=()=>{ $$('.seg-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); dir=b.dataset.adjDir; upd(); });
    qtyI.oninput=upd; upd();
    $('#adj-save').onclick=()=>{
      const q=Math.max(0,Math.floor(Number(qtyI.value)||0)); if(q<=0){ toast('Enter a quantity greater than 0.','warn'); return; }
      const before=m.quantity; const after=dir==='remove'?Math.max(0,before-q):before+q;
      Store.update('medicines', m.id, { quantity:after });
      const rl=(ADJUST_REASONS.find(r=>r[0]===reasonSel.value)||[]);
      Store.insert('stockadjustments', { medicineId:m.id, name:m.name, type:dir, qty:q, reason:reasonSel.value, reasonLabel:rl[1]||'', note:($('#adj-note').value||'').trim(), before, after, by:(Store.session()||{}).name||'Staff', date:Date.now() });
      closeModal(); toast(`Stock adjusted: ${m.name} → ${after} ${m.unit||'pcs'}.`,'success'); render();
    };
  }

  function openStockLogModal(){
    const logs = Store.all('stockadjustments').slice().sort((a,b)=>(b.date||0)-(a.date||0)).slice(0,80);
    const body = !logs.length ? emptyState('clock','No adjustments yet','Stock write-offs and corrections you make will appear here.')
      : `<div class="table-wrap"><table class="data">
          <thead><tr><th>Date</th><th>Medicine</th><th>Reason</th><th class="t-right">Change</th><th class="t-right">After</th><th>By</th></tr></thead>
          <tbody>${logs.map(l=>`<tr>
            <td><div class="cell-sub">${Store.dateTimeFmt(l.date)}</div></td>
            <td><div class="cell-main">${esc(l.name)}</div>${l.note?`<div class="cell-sub">${esc(l.note)}</div>`:''}</td>
            <td><span class="badge gray">${esc(l.reasonLabel||l.reason||'—')}</span></td>
            <td class="t-right"><strong style="color:var(--${l.type==='remove'?'danger':'success'})">${l.type==='remove'?'−':'+'}${l.qty}</strong></td>
            <td class="t-right">${l.after}</td>
            <td><div class="cell-sub">${esc(l.by||'—')}</div></td></tr>`).join('')}</tbody></table></div>`;
    modal({ title:'Stock Adjustment Log', size:'lg', icon:'clock', body, footer:`<button class="btn btn-secondary" data-modal-close>Close</button>` });
  }

  /* ---------- Reorder list → purchase order ---------- */
  function suggestReorderQty(m){
    const lvl = Number(m.reorderLevel || Store.getSettings().lowStockThreshold) || 0;
    const target = Math.max(lvl*2, lvl+1, 1);
    return Math.max(1, target - (Number(m.quantity)||0));
  }
  function openReorderModal(){
    const low = Store.lowStockItems();
    if(!low.length){ modal({ title:'Reorder List', size:'sm', icon:'inbox',
      body:emptyState('check','Nothing to reorder','All stock is above its reorder level. 🎉'),
      footer:`<button class="btn btn-secondary" data-modal-close>Close</button>` }); return; }
    const groups={};
    low.forEach(m=>{ const sid=m.supplierId||''; if(!groups[sid]) groups[sid]={ supplierId:sid, name:(Store.find('suppliers',sid)||{}).name||'No supplier assigned', items:[] }; groups[sid].items.push(m); });
    const body = `<p class="muted" style="margin-bottom:14px;font-size:13px">${t('Items at or below their reorder level, grouped by supplier. Create a purchase order with the suggested quantities.')}</p>
      ${Object.values(groups).map(g=>`<div class="reorder-group">
        <div class="rg-head">${icon('truck')}<h4>${esc(g.name)}</h4><span class="badge gray">${g.items.length}</span>
          <span class="spacer"></span>${g.supplierId?`<button class="btn btn-soft btn-sm" data-action="reorder-po" data-id="${g.supplierId}">${icon('inbox')} ${t('Create PO')}</button>`:''}</div>
        <div class="mini-list">${g.items.map(m=>`<div class="mini-item">
          <div class="mini-ico" style="background:var(--warning-soft);color:var(--warning)">${icon('pill')}</div>
          <div class="mini-main"><div class="mini-title">${esc(m.name)}</div><div class="mini-sub">${m.quantity} left · reorder @ ${m.reorderLevel||Store.getSettings().lowStockThreshold}</div></div>
          <span class="badge amber">+${suggestReorderQty(m)}</span></div>`).join('')}</div>
      </div>`).join('')}
      ${Object.values(groups).some(g=>!g.supplierId)?`<div class="field-hint" style="margin-top:10px">${t('Tip: set a supplier on a medicine (Edit) to enable one-click PO for it.')}</div>`:''}`;
    modal({ title:'Reorder List', size:'lg', icon:'inbox', body, footer:`<button class="btn btn-secondary" data-modal-close>Close</button>` });
  }

  function medicineForm(m){
    const sup = Store.all('suppliers');
    const o = m || { unit:'pcs', reorderLevel:Store.getSettings().lowStockThreshold };
    const cur = Store.getSettings().currency;
    return `<form id="med-form" autocomplete="off">
      <div class="form-section">
        <div class="form-section-title">${icon('pill')} Medicine Details</div>
        <div class="form-grid">
          <label class="field full"><span class="field-label">Medicine Name *</span><input name="name" required autocomplete="off" value="${esc(o.name||'')}" placeholder="e.g. Paracetamol 500mg"/></label>
          <label class="field"><span class="field-label">Generic Name</span><input name="genericName" value="${esc(o.genericName||'')}" placeholder="e.g. Acetaminophen"/></label>
          <label class="field"><span class="field-label">Category *</span><select name="category" required>${Store.CATEGORIES.map(c=>`<option ${o.category===c?'selected':''}>${c}</option>`).join('')}</select></label>
          <label class="field"><span class="field-label">Barcode</span><input name="barcode" value="${esc(o.barcode||'')}" placeholder="Scan or type"/></label>
          <label class="field"><span class="field-label">Batch No.</span><input name="batchNo" value="${esc(o.batchNo||'')}" placeholder="BTH-0000"/></label>
        </div>
      </div>
      <div class="form-section">
        <div class="form-section-title">${icon('dollar')} Pricing &amp; Stock</div>
        <div class="form-grid">
          <label class="field"><span class="field-label">Cost Price *</span><div class="input-affix"><span class="affix">${esc(cur)}</span><input name="costPrice" type="number" step="0.01" min="0" required value="${o.costPrice??''}" placeholder="0.00"/></div></label>
          <label class="field"><span class="field-label">Selling Price *</span><div class="input-affix"><span class="affix">${esc(cur)}</span><input name="sellPrice" type="number" step="0.01" min="0" required value="${o.sellPrice??''}" placeholder="0.00"/></div></label>
          <label class="field"><span class="field-label">Quantity *</span><input name="quantity" type="number" min="0" required value="${o.quantity??''}" placeholder="0"/></label>
          <label class="field"><span class="field-label">Unit</span><input name="unit" value="${esc(o.unit||'pcs')}" placeholder="pcs / box / bottle"/></label>
          <label class="field full"><span class="field-label">Reorder Level</span><input name="reorderLevel" type="number" min="0" value="${o.reorderLevel??20}"/><span class="field-hint">Get a low-stock alert when quantity falls to or below this number.</span></label>
        </div>
      </div>
      <div class="form-section">
        <div class="form-section-title">${icon('calendar')} Expiry &amp; Location</div>
        <div class="form-grid">
          <label class="field"><span class="field-label">Expiry Date *</span><input name="expiryDate" type="date" required value="${esc(o.expiryDate||'')}"/></label>
          <label class="field"><span class="field-label">Supplier</span><select name="supplierId"><option value="">— None —</option>${sup.map(sp=>`<option value="${sp.id}" ${o.supplierId===sp.id?'selected':''}>${esc(sp.name)}</option>`).join('')}</select></label>
          <label class="field full"><span class="field-label">Shelf Location</span><input name="location" value="${esc(o.location||'')}" placeholder="e.g. Shelf A-1"/></label>
        </div>
      </div>
    </form>`;
  }

  // m with an id => edit existing; m without id => prefill a new medicine (e.g. from catalog); no m => blank new.
  function openMedicineModal(m){
    const isEdit = !!(m && m.id);
    modal({ title: isEdit?'Edit Medicine':'Add New Medicine', size:'lg', icon:'pill', body: medicineForm(m),
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button>
        <button class="btn btn-primary" id="save-med">${icon('save')} ${isEdit?'Save Changes':'Add Medicine'}</button>` });
    $('#save-med').onclick = () => {
      const f = $('#med-form'); if(!f.reportValidity()) return;
      const fd = new FormData(f); const data = Object.fromEntries(fd.entries());
      ['quantity','costPrice','sellPrice','reorderLevel'].forEach(k=> data[k]=Number(data[k]||0));
      if (isEdit){ Store.update('medicines', m.id, data); toast('Medicine updated.','success'); }
      else { Store.insert('medicines', data); toast('Medicine added to inventory.','success'); }
      closeModal(); render();
    };
  }

  function openChangePasswordModal(){
    if(!Store.isCloud()){ toast('Password change works in Cloud mode.','warn'); return; }
    modal({ title:'Change Password', size:'sm', icon:'lock',
      body:`<form id="cpw-form" class="login-form" autocomplete="off" style="gap:14px">
        <label class="field"><span class="field-label">${t('Current password')}</span>
          <input type="password" name="current" required placeholder="••••••"/></label>
        <label class="field"><span class="field-label">${t('New password')}</span>
          <input type="password" name="next" required minlength="6" placeholder="${t('At least 6 characters')}"/></label>
        <label class="field"><span class="field-label">${t('Confirm new password')}</span>
          <input type="password" name="confirm" required minlength="6" placeholder="••••••"/></label>
        <div id="cpw-error" class="login-error" hidden></div>
      </form>`,
      footer:`<button class="btn btn-secondary" data-modal-close>${t('Cancel')}</button>
        <button class="btn btn-primary" id="cpw-save">${icon('lock')} ${t('Update Password')}</button>` });
    $('#cpw-save').onclick = async () => {
      const f=$('#cpw-form'); if(!f.reportValidity()) return;
      const d=Object.fromEntries(new FormData(f).entries());
      const err=$('#cpw-error');
      if(d.next!==d.confirm){ err.hidden=false; err.textContent=t('New passwords do not match.'); return; }
      const btn=$('#cpw-save'); btn.disabled=true; btn.textContent='…';
      try{
        await Cloud.changeMyPassword(d.current, d.next);
        closeModal(); toast(t('Password updated successfully.'),'success');
      }catch(ex){ err.hidden=false; err.textContent=friendlyAuthError(ex); btn.disabled=false; btn.innerHTML=`${icon('lock')} ${t('Update Password')}`; }
    };
  }

  /* ---------- Catalog quick-add: pick a common medicine, then fill price/stock ---------- */
  function catalogRows(q){
    const cat = state.catalog.category;
    let list = Store.CATALOG;
    if (cat!=='all') list = list.filter(x=>x.category===cat);
    if (q){ const s=q.toLowerCase(); list = list.filter(x=>x.name.toLowerCase().includes(s)||(x.genericName||'').toLowerCase().includes(s)); }
    // Mark medicines already in inventory (by name, case-insensitive) so users don't add duplicates.
    const have = new Set(Store.all('medicines').map(m=>(m.name||'').toLowerCase().trim()));
    if (!list.length) return `<div class="catalog-empty muted" style="padding:24px;text-align:center">${t('No medicines match your search.')}</div>`;
    return `<div class="catalog-list">${list.map(x=>{
      const added = have.has(x.name.toLowerCase().trim());
      return `<button class="catalog-row" data-action="catalog-pick" data-name="${esc(x.name)}" ${added?'data-added="1"':''}>
        <div class="catalog-ico">${icon('pill')}</div>
        <div class="catalog-meta"><div class="catalog-name">${esc(x.name)}</div>
          <div class="catalog-sub">${esc(x.genericName||'')} · ${esc(x.category)}</div></div>
        ${added?`<span class="catalog-tag">${t('In stock')}</span>`:`<span class="catalog-add">${icon('plus')}</span>`}
      </button>`;
    }).join('')}</div>`;
  }

  function openCatalogModal(){
    if (!state.catalog) state.catalog = { search:'', category:'all' };
    state.catalog.search=''; state.catalog.category='all';
    const cats = ['all', ...Store.CATEGORIES];
    modal({ title:'Medicine Catalog', size:'lg', icon:'package',
      body:`<p class="muted" style="margin:0 0 12px">${t('Pick a common medicine to quickly add it — then just set your price and quantity.')}</p>
        <div class="toolbar" style="margin-bottom:12px">
          <div class="search">${icon('search')}<input type="search" id="cat-search" placeholder="${t('Search medicine…')}" autocomplete="off"/></div>
          <select id="cat-filter">${cats.map(c=>`<option value="${c}">${c==='all'?t('All Categories'):c}</option>`).join('')}</select>
        </div>
        <div id="cat-results">${catalogRows('')}</div>`,
      footer:`<button class="btn btn-secondary" data-modal-close>${t('Close')}</button>` });
    const refresh = () => { $('#cat-results').innerHTML = catalogRows(state.catalog.search); };
    $('#cat-search').oninput = (e)=>{ state.catalog.search=e.target.value; refresh(); };
    $('#cat-filter').onchange = (e)=>{ state.catalog.category=e.target.value; refresh(); };
  }

  /* ============================================================ POINT OF SALE */
  function posProducts(){
    const s = state.pos;
    let meds = Store.all('medicines').filter(m=>m.quantity>0);
    if (s.search){ const q=s.search.toLowerCase(); meds=meds.filter(m=>m.name.toLowerCase().includes(q)||(m.genericName||'').toLowerCase().includes(q)||(m.barcode||'').includes(q)); }
    if (s.category!=='all') meds=meds.filter(m=>m.category===s.category);
    if (!meds.length) return emptyState('search','No products','No medicines match your search.');
    return `<div class="pos-products">${meds.map(m=>{
      const inCart = (s.cart.find(c=>c.id===m.id)||{}).qty || 0;
      const avail = m.quantity - inCart;
      return `<button class="pcard" data-action="pos-add" data-id="${m.id}" ${avail<=0?'disabled':''}>
        <div class="pcard-ico">${icon('pill')}</div>
        <div class="pcard-name">${esc(m.name)}</div>
        <div class="pcard-cat">${esc(m.category)}</div>
        <div class="pcard-bottom"><span class="pcard-price">${money(m.sellPrice)}</span>
          <span class="pcard-stock">${avail} left</span></div></button>`;
    }).join('')}</div>`;
  }

  function cartPanel(){
    const s = state.pos;
    const customers = Store.all('customers');
    const subtotal = s.cart.reduce((a,c)=>a+c.qty*c.price,0);
    const settings = Store.getSettings();
    const discount = Number(s.discount)||0;
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * (settings.taxRate/100);
    const total = taxable + tax;

    return `<div class="cart">
      <div class="cart-head">${icon('cart')}<h3>Current Sale</h3>
        ${s.cart.length?`<button class="btn btn-ghost btn-sm" data-action="clear-cart">${icon('trash')} Clear</button>`:''}</div>
      <div style="padding:14px 20px 0">
        <label class="field"><span class="field-label">Customer</span>
          <input type="text" id="pos-customer" list="pos-cust-list" autocomplete="off" placeholder="${t('Walk-in — or type any name')}" value="${esc(s.customerName||'')}"/>
          <datalist id="pos-cust-list">${customers.filter(c=>!/walk-in/i.test(c.name)).map(c=>`<option value="${esc(c.name)}">${c.phone?esc(c.phone):''}</option>`).join('')}</datalist>
          <span class="field-hint">${t('Pick a saved customer or type a new one — it will be saved automatically.')}</span></label>
      </div>
      <div class="cart-items">
        ${s.cart.length ? s.cart.map(c=>`<div class="cart-item">
          <div class="ci-main"><div class="ci-name">${esc(c.name)}</div><div class="ci-price">${money(c.price)} each</div></div>
          <div class="qty-ctrl">
            <button data-action="cart-dec" data-id="${c.id}">−</button>
            <span>${c.qty}</span>
            <button data-action="cart-inc" data-id="${c.id}">+</button></div>
          <div class="ci-total">${money(c.qty*c.price)}</div>
          <button class="ci-remove" data-action="cart-remove" data-id="${c.id}">${icon('x')}</button>
        </div>`).join('') : `<div class="cart-empty">${icon('cart')}<p>Cart is empty.<br/>Click products to add them.</p></div>`}
      </div>
      <div class="cart-foot">
        <div class="sum-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="sum-row"><span>Discount</span>
          <input type="number" id="pos-discount" min="0" step="0.01" value="${discount}" style="width:90px;padding:5px 8px;text-align:right" ${!s.cart.length?'disabled':''}/></div>
        <div class="sum-row"><span>Tax (${settings.taxRate}%)</span><span>${money(tax)}</span></div>
        <div class="sum-row total"><span>Total</span><span>${money(total)}</span></div>
        <button class="btn btn-primary btn-block btn-lg" data-action="checkout" ${!s.cart.length?'disabled':''}>
          ${icon('check')} Complete Sale · ${money(total)}</button>
      </div></div>`;
  }

  function posRefresh(){ $('#pos-products-wrap').innerHTML = posProducts(); $('#cart-wrap').innerHTML = cartPanel(); wirePosCart(); }

  function wirePosCart(){
    const cust = $('#pos-customer'); if(cust) cust.oninput = () => state.pos.customerName = cust.value;
    const disc = $('#pos-discount'); if(disc){ disc.onchange = () => { state.pos.discount = Math.max(0,Number(disc.value)||0); posRefresh(); }; }
  }

  // Find the Walk-in customer (any casing / "walkin"), or create it once. Anonymous
  // sales must always land on Walk-in — never on the first real customer in the list.
  function walkInId(){
    const wi = Store.all('customers').find(x=>/walk-?in/i.test(x.name||''));
    return wi ? wi.id : Store.insert('customers', { name:'Walk-in Customer' }).id;
  }

  function viewPOS(){
    const s = state.pos;
    // Only pre-fill an existing Walk-in here; do NOT fall back to c[0] (a real customer).
    if (!s.customerId){ const wi=Store.all('customers').find(x=>/walk-?in/i.test(x.name||'')); s.customerId = wi ? wi.id : ''; }
    const cats = ['all', ...Store.CATEGORIES];
    afterRender = () => {
      const si = $('#pos-search');
      if(si){
        si.oninput = debounce(() => { state.pos.search = si.value; $('#pos-products-wrap').innerHTML = posProducts(); }, 90);
        // Barcode / quick-add: a USB barcode scanner types the code then presses Enter.
        // On Enter, add the best match to the cart (exact barcode → exact name → first
        // visible result) and clear the box, ready for the next scan.
        si.addEventListener('keydown', (e)=>{
          if(e.key!=='Enter') return;
          e.preventDefault();
          const q = (si.value||'').trim(); if(!q) return;
          const meds = Store.all('medicines'); const ql = q.toLowerCase();
          const m = meds.find(x=>(x.barcode||'')===q)
                 || meds.find(x=>(x.name||'').toLowerCase()===ql)
                 || meds.filter(x=>x.name.toLowerCase().includes(ql)||(x.genericName||'').toLowerCase().includes(ql)||(x.barcode||'').includes(q))[0];
          if(!m){ toast('No matching product.','warn'); return; }
          const c = state.pos.cart.find(x=>x.id===m.id); const inCart = c?c.qty:0;
          if(inCart>=m.quantity){ toast(m.name+': no more stock available.','warn'); return; }
          if(c) c.qty++; else state.pos.cart.push({id:m.id,name:m.name,price:m.sellPrice,cost:m.costPrice,qty:1});
          state.pos.search=''; si.value=''; posRefresh(); si.focus();
          toast(m.name+' added.','success');
        });
      }
      wirePosCart();
    };
    return `<div class="pos-layout">
      <div>
        <div class="toolbar">
          <div class="search">${icon('search')}<input type="search" id="pos-search" placeholder="Search or scan product…" value="${esc(s.search)}"/></div>
        </div>
        <div class="chip-row" style="margin-bottom:16px">
          ${cats.map(c=>`<button class="chip ${s.category===c?'active':''}" data-action="pos-cat" data-cat="${c}">${c==='all'?'All':c}</button>`).join('')}
        </div>
        <div id="pos-products-wrap">${posProducts()}</div>
      </div>
      <div id="cart-wrap">${cartPanel()}</div>
    </div>`;
  }

  // Sequential, per-pharmacy document sequence shared by sales + refunds (replaces the
  // old random INV-#### which could collide). Derives the next number from existing
  // records so it stays monotonic even after a page reload.
  function nextSeq(){
    let max = 0;
    Store.all('sales').forEach(sl=>{ const mm=/(\d+)\s*$/.exec(String(sl.invoiceNo||'')); if(mm){ const n=parseInt(mm[1],10); if(n>max) max=n; } });
    return Math.max(max, Store.all('sales').length) + 1;
  }
  function nextInvoiceNo(){ return (Store.getSettings().invoicePrefix || 'INV') + '-' + String(nextSeq()).padStart(5,'0'); }
  function nextReturnNo(){ return 'RET-' + String(nextSeq()).padStart(5,'0'); }

  // Map of already-returned quantity per item for a given original sale.
  function alreadyReturned(saleId){
    const map = {};
    Store.all('sales').filter(s=>s.type==='return' && s.originalSaleId===saleId).forEach(r=>{
      (r.items||[]).forEach(it=>{ const k=it.medicineId||it.name; map[k]=(map[k]||0)+Math.abs(it.qty||0); });
    });
    return map;
  }

  function openRefundModal(sale){
    if(!sale){ toast('Sale not found.','error'); return; }
    if(sale.type==='return'){ toast('This is already a refund.','warn'); return; }
    const ret = alreadyReturned(sale.id);
    const rows = (sale.items||[]).map((it,i)=>{ const done=ret[it.medicineId||it.name]||0; return { it, i, done, remaining:Math.max(0,(it.qty||0)-done) }; });
    const anyRemaining = rows.some(r=>r.remaining>0);
    const isDeyn = sale.paymentMethod==='Deyn';
    // Refund figures mirror how a sale is built, using the original sale's own ratios.
    const origSub = sale.subtotal || (sale.items||[]).reduce((a,i)=>a+i.qty*i.price,0);
    const discRatio = origSub>0 ? (sale.discount||0)/origSub : 0;
    const taxRatio = (origSub-(sale.discount||0))>0 ? (sale.tax||0)/(origSub-(sale.discount||0)) : 0;
    const calc = (sub)=>{ const disc=+(sub*discRatio).toFixed(2); const taxable=sub-disc; const tax=+(taxable*taxRatio).toFixed(2); return { sub, disc, tax, total:+(taxable+tax).toFixed(2) }; };
    modal({ title:'Return / Refund — '+sale.invoiceNo, size:'md', icon:'undo',
      body: !anyRemaining
        ? `<div class="announce-banner amber">${icon('info')}<span>All items in this sale have already been returned.</span></div>`
        : `<p class="muted" style="margin-bottom:12px;font-size:13px">Set the quantity to return for each item. Stock is added back and a refund receipt is created.</p>
          <div class="refund-list">
            ${rows.map(r=>`<div class="refund-row">
              <div class="rf-main"><div class="rf-name">${esc(r.it.name)}</div>
                <div class="rf-sub muted">${money(r.it.price)} each · sold ${r.it.qty}${r.done?` · returned ${r.done}`:''}</div></div>
              <input type="number" class="rf-qty" min="0" max="${r.remaining}" value="0" ${r.remaining<=0?'disabled':''}
                data-price="${r.it.price}" data-cost="${r.it.cost||0}" data-name="${esc(r.it.name)}" data-mid="${esc(r.it.medicineId||'')}"/>
            </div>`).join('')}
          </div>
          <label class="field" style="margin-top:14px"><span class="field-label">Refund Method</span>
            <select id="rf-method">${isDeyn?'<option value="Deyn">Reduce customer debt (Deyn)</option>':''}<option>Cash</option><option>Mobile Money</option><option>Card</option></select></label>
          <label class="field" style="margin-top:10px"><span class="field-label">Reason (optional)</span><input id="rf-reason" placeholder="e.g. wrong item, expired, customer changed mind"/></label>
          <div id="rf-summary" class="refund-summary" style="margin-top:14px"></div>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button>
        ${anyRemaining?`<button class="btn btn-danger" id="rf-confirm">${icon('undo')} Process Refund</button>`:''}` });
    if(!anyRemaining) return;
    const readQtys = () => { let sub=0; const items=[];
      $$('.rf-qty').forEach(inp=>{ let q=Math.min(Math.max(0,Number(inp.value)||0), Number(inp.max)||0); if(String(q)!==inp.value) inp.value=q;
        if(q>0){ const price=Number(inp.dataset.price); sub+=q*price; items.push({ medicineId:inp.dataset.mid||'', name:inp.dataset.name, qty:-q, price, cost:Number(inp.dataset.cost)||0, total:-(+(q*price).toFixed(2)) }); } });
      return { sub, items }; };
    const recompute = () => { const { sub }=readQtys(); const f=calc(sub);
      $('#rf-summary').innerHTML = sub>0
        ? `<div class="receipt-line"><span>Refund subtotal</span><span>${money(f.sub)}</span></div>
           ${f.disc?`<div class="receipt-line"><span>Discount reversed</span><span>-${money(f.disc)}</span></div>`:''}
           <div class="receipt-line"><span>Tax reversed</span><span>${money(f.tax)}</span></div>
           <div class="receipt-line receipt-total"><span>TOTAL REFUND</span><span>${money(f.total)}</span></div>`
        : `<div class="muted" style="text-align:center">Select at least one item to refund.</div>`;
    };
    $$('.rf-qty').forEach(inp=> inp.oninput = recompute);
    recompute();
    $('#rf-confirm').onclick = () => {
      const { sub, items } = readQtys();
      if(!items.length){ toast('Select at least one item to refund.','warn'); return; }
      const f = calc(sub);
      // Restore stock for each returned line.
      items.forEach(it=>{ if(it.medicineId){ const m=Store.find('medicines',it.medicineId); if(m) Store.update('medicines',it.medicineId,{ quantity:(Number(m.quantity)||0)+Math.abs(it.qty) }); } });
      const rec = {
        invoiceNo: nextReturnNo(), type:'return', originalSaleId: sale.id, originalInvoice: sale.invoiceNo,
        items, subtotal:-f.sub, discount:-f.disc, tax:-f.tax, total:-f.total,
        customerId: sale.customerId, paymentMethod: $('#rf-method').value, reason: ($('#rf-reason').value||'').trim(),
        cashier:(Store.session()||{}).name||'Staff', date: Date.now()
      };
      const saved = Store.insert('sales', rec);
      closeModal(); render(); toast(`Refund ${rec.invoiceNo} processed (${money(f.total)}).`,'success');
      showReceipt(Store.find('sales', saved.id) || rec);
    };
  }

  function doCheckout(){
    const s = state.pos;
    if (!s.cart.length) return;
    // Final stock validation — stock may have dropped since items were added to the
    // cart (e.g. another cashier sold the same item in cloud mode). Cap each line to
    // what is currently available; if anything changed, refresh and ask to re-confirm.
    let adjusted = false;
    s.cart = s.cart.map(c=>{ const m=Store.find('medicines',c.id); const avail=m?m.quantity:0;
      if (c.qty>avail){ adjusted=true; return { ...c, qty:avail }; } return c; }).filter(c=>c.qty>0);
    if (adjusted){ posRefresh(); toast('Stock changed — quantities were adjusted to what is available. Please review and confirm.','warn'); return; }
    const settings = Store.getSettings();
    const subtotal = s.cart.reduce((a,c)=>a+c.qty*c.price,0);
    const discount = Math.min(Number(s.discount)||0, subtotal);
    const tax = +((subtotal-discount)*(settings.taxRate/100)).toFixed(2);
    const total = +(subtotal - discount + tax).toFixed(2);
    const deynOn = Store.featureEnabled('deyn');
    const mm = ['EVC Plus','Zaad','Sahal','eDahab'];
    const named = Store.all('customers').filter(c=>!/walk-?in/i.test(c.name));
    // payment method modal
    modal({ title:'Complete Payment', size:'sm', icon:'dollar',
      body:`<div style="text-align:center;margin-bottom:20px">
          <div class="muted">Amount due</div>
          <div style="font-family:var(--font-display);font-size:34px;font-weight:800;color:var(--primary-700)">${money(total)}</div></div>
        <label class="field" style="margin-bottom:14px"><span class="field-label">Payment Method</span>
          <select id="pay-method"><option>Cash</option><option>Mobile Money</option><option>Card</option>${deynOn?'<option value="Deyn">Deyn (Credit)</option>':''}</select></label>
        <label class="field" id="mm-row" style="margin-bottom:14px" hidden><span class="field-label">Mobile Money Provider</span>
          <select id="pay-provider">${mm.map(p=>`<option>${p}</option>`).join('')}</select></label>
        <label class="field" id="ref-row" style="margin-bottom:14px" hidden><span class="field-label">Reference / Txn No.</span><input type="text" id="pay-ref" placeholder="optional"/></label>
        <div class="field" id="deyn-cust-row" style="margin-bottom:14px" hidden><span class="field-label">Customer (whose debt)</span>
          <select id="deyn-customer">${named.map(c=>`<option value="${c.id}" ${c.id===s.customerId?'selected':''}>${esc(c.name)}${c.phone?' · '+esc(c.phone):''}</option>`).join('')}<option value="__new__">➕ Add new customer…</option></select>
          <div id="deyn-new" style="display:flex;gap:8px;margin-top:8px" hidden>
            <input type="text" id="deyn-new-name" placeholder="Customer name" style="flex:1"><input type="text" id="deyn-new-phone" placeholder="Phone (optional)" style="flex:1"></div></div>
        <label class="field" id="amt-row"><span class="field-label">Amount Received</span>
          <input type="number" id="pay-amount" step="0.01" value="${total.toFixed(2)}"/></label>
        <div id="change-line" style="margin-top:10px;font-weight:600;text-align:right"></div>
        <div id="deyn-note" class="announce-banner amber" style="margin:6px 0 0" hidden></div>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button>
        <button class="btn btn-primary" id="confirm-pay">${icon('check')} Confirm & Print</button>` });
    const amt = $('#pay-amount'), changeLine = $('#change-line'), methodSel = $('#pay-method');
    const upd = () => { const ch=(Number(amt.value)||0)-total; changeLine.innerHTML = ch>=0?`Change: <span style="color:var(--success)">${money(ch)}</span>`:`<span style="color:var(--danger)">Short by ${money(-ch)}</span>`; };
    const updateDeynNote = () => {
      const sel = $('#deyn-customer'); const isNew = !sel || sel.value==='__new__';
      if ($('#deyn-new')) $('#deyn-new').hidden = !isNew;
      const note = $('#deyn-note'); note.hidden=false;
      note.innerHTML = isNew
        ? `${icon('info')}<span>${money(total)} will be recorded as <strong>deyn</strong> for the new customer.</span>`
        : `${icon('info')}<span>${money(total)} will be added to <strong>${esc((Store.find('customers',sel.value)||{}).name||'')}</strong>'s debt.</span>`;
    };
    const onMethod = () => {
      const m = methodSel.value; const deyn = m==='Deyn';
      $('#mm-row').hidden = m!=='Mobile Money'; $('#ref-row').hidden = m!=='Mobile Money';
      $('#amt-row').hidden = deyn; changeLine.hidden = deyn;
      $('#deyn-cust-row').hidden = !deyn;
      if (deyn) updateDeynNote(); else $('#deyn-note').hidden = true;
    };
    methodSel.onchange = onMethod;
    if ($('#deyn-customer')) $('#deyn-customer').onchange = updateDeynNote;
    amt.oninput = upd; upd(); onMethod();
    $('#confirm-pay').onclick = () => {
      const method = methodSel.value;
      // Resolve the POS customer field (free text): use a saved customer if the name
      // matches, otherwise create a new one; empty = Walk-in.
      let custId;
      const typed = (state.pos.customerName||'').trim();
      if (typed){
        const ex = Store.all('customers').find(c => (c.name||'').trim().toLowerCase() === typed.toLowerCase());
        custId = ex ? ex.id : Store.insert('customers', { name: typed }).id;
      } else {
        custId = walkInId();   // no name typed → Walk-in (find or create), never a real customer
      }
      if (method==='Deyn'){
        const sel = $('#deyn-customer');
        if (!sel || sel.value==='__new__'){
          const nm = ($('#deyn-new-name').value||'').trim() || typed;
          if (!nm){ toast('Enter the customer name for this credit sale.','warn'); return; }
          custId = Store.insert('customers', { name:nm, phone:($('#deyn-new-phone').value||'').trim() }).id;
        } else { custId = sel.value; }
      }
      const sale = {
        invoiceNo: nextInvoiceNo(),
        items: s.cart.map(c=>{ const md=Store.find('medicines',c.id)||{}; return { medicineId:c.id, name:c.name, qty:c.qty, price:c.price, cost:c.cost, total:+(c.qty*c.price).toFixed(2), batchNo:md.batchNo||'', expiryDate:md.expiryDate||'' }; }),
        subtotal:+subtotal.toFixed(2), discount, tax, total,
        customerId: custId, paymentMethod: method, provider: method==='Mobile Money'?$('#pay-provider').value:'', ref: $('#pay-ref')?$('#pay-ref').value:'',
        cashier: (Store.session()||{}).name || 'Staff', date: Date.now()
      };
      // decrement stock
      s.cart.forEach(c=>{ const m=Store.find('medicines',c.id); if(m) Store.update('medicines',c.id,{quantity:Math.max(0,m.quantity-c.qty)}); });
      Store.insert('sales', sale);
      state.pos.cart=[]; state.pos.discount=0; state.pos.customerName='';
      closeModal(); celebrate(); toast(`Sale ${sale.invoiceNo} completed!`,'success');
      showReceipt(sale); render();
    };
  }

  /* ============================================================ RECEIPT */
  function receiptHTML(sale){
    const s = Store.getSettings(); const cust = Store.find('customers', sale.customerId);
    const isReturn = sale.type==='return' || (Number(sale.total)||0) < 0;
    const m2 = (v)=> money(Math.abs(Number(v)||0));
    return `<div class="receipt ${isReturn?'is-return':''}" id="receipt-print">
      <div class="receipt-head">
        ${s.logo?`<img class="receipt-logo" src="${s.logo}" alt=""/>`:''}
        <h3>${esc(s.pharmacyName)}</h3>
        <div class="muted" style="font-size:12px">${esc(s.address)}<br/>${esc(s.phone)} · ${esc(s.email)}</div>
        <div class="receipt-label${isReturn?' refund':''}">${isReturn?t('Refund Receipt'):t('Sales Receipt')}</div>
      </div>
      <div class="receipt-line"><span>Invoice</span><strong>${esc(sale.invoiceNo)}</strong></div>
      ${isReturn&&sale.originalInvoice?`<div class="receipt-line"><span>Ref. Invoice</span><span>${esc(sale.originalInvoice)}</span></div>`:''}
      <div class="receipt-line"><span>Date</span><span>${Store.dateTimeFmt(sale.date)}</span></div>
      <div class="receipt-line"><span>Customer</span><span>${esc(cust?cust.name:'Walk-in')}</span></div>
      <div class="receipt-line"><span>Cashier</span><span>${esc(sale.cashier)}</span></div>
      <div class="receipt-line"><span>Payment</span><span>${esc(sale.paymentMethod==='Deyn'?'DEYN (unpaid)':(sale.provider||sale.paymentMethod))}${sale.ref?` · ${esc(sale.ref)}`:''}</span></div>
      <div class="receipt-items">
        ${sale.items.map(it=>`<div class="receipt-line"><span>${esc(it.name)} ×${Math.abs(it.qty)}</span><span>${m2(it.total)}</span></div>`).join('')}
      </div>
      <div class="receipt-line"><span>Subtotal</span><span>${m2(sale.subtotal)}</span></div>
      ${sale.discount?`<div class="receipt-line"><span>Discount</span><span>-${m2(sale.discount)}</span></div>`:''}
      <div class="receipt-line"><span>Tax</span><span>${m2(sale.tax)}</span></div>
      <div class="receipt-line receipt-total"><span>${isReturn?'REFUND':'TOTAL'}</span><span>${m2(sale.total)}</span></div>
      <div class="receipt-foot">${esc(s.footerNote)}</div>
    </div>`;
  }
  function showReceipt(sale){
    modal({ title:'Receipt — '+sale.invoiceNo, size:'sm', icon:'receipt', body: receiptHTML(sale),
      footer:`<button class="btn btn-secondary" data-modal-close>Close</button>
        <button class="btn btn-primary" data-action="print-receipt" data-id="${sale.id}">${icon('print')} Print</button>` });
  }

  // Print the receipt via a dedicated hidden iframe (self-contained styles) so it
  // never depends on the modal's overflow/transform/animation — those left it blank.
  function printReceipt(sale){
    if(!sale){ toast('Receipt not found.','error'); return; }
    const w = Store.getSettings().receiptWidth || '80';
    const thermal = (w==='58' || w==='80');
    const mm = w==='58' ? 58 : 80;
    const css = thermal ? `
      @page{size:${mm}mm auto;margin:0}
      *{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{font-family:'Inter',-apple-system,'Segoe UI',Roboto,sans-serif;color:#000;padding:${w==='58'?'4mm 3mm':'5mm 4mm'};font-size:${w==='58'?'11px':'12.5px'};font-weight:600}
      .receipt{width:100%;position:relative}
      .receipt-logo{display:block;max-height:${w==='58'?'34px':'44px'};margin:0 auto 6px}
      .receipt-head{text-align:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px dashed #000}
      .receipt-head h3{font-size:${w==='58'?'15px':'17px'};font-weight:800;margin-bottom:2px}
      .receipt-label{display:inline-block;margin-top:5px;padding:1px 8px;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;border:1.5px solid #000;border-radius:3px}
      .receipt-label.refund{background:#000;color:#fff}
      .muted{color:#000;font-weight:500;font-size:10.5px}
      .receipt-line{display:flex;justify-content:space-between;gap:8px;padding:2px 0}
      .receipt-line span:first-child{font-weight:500}
      .receipt-line span:last-child,.receipt-line strong{font-weight:700}
      .receipt-items{margin:8px 0;padding:8px 0;border-top:1px dashed #000;border-bottom:1px dashed #000}
      .receipt-items .receipt-line span:first-child{font-weight:600}
      .receipt-total{margin-top:8px;padding-top:6px;border-top:2px solid #000}
      .receipt-total span{font-size:${w==='58'?'14px':'16px'};font-weight:800}
      .receipt-foot{text-align:center;margin-top:10px;padding-top:8px;border-top:1px dashed #000;font-size:10.5px;font-weight:600;font-style:italic}`
    : `
      *{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{font-family:'Inter',-apple-system,'Segoe UI',Roboto,sans-serif;color:#0f172a;padding:14px;font-size:13.5px;font-weight:500}
      .receipt{width:100%;max-width:360px;margin:0 auto;border:2px solid #0f172a;border-radius:14px;
        padding:20px 18px;position:relative}
      .receipt::before{content:"";position:absolute;left:0;right:0;top:0;height:6px;border-radius:14px 14px 0 0;background:#0d9488}
      .receipt-logo{display:block;max-height:52px;margin:2px auto 8px}
      .receipt-head{text-align:center;margin:6px 0 14px;padding-bottom:12px;border-bottom:2px dashed #cbd5e1}
      .receipt-head h3{font-size:21px;font-weight:800;letter-spacing:.5px;margin-bottom:4px}
      .receipt-label{display:inline-block;margin-top:8px;padding:3px 12px;border-radius:999px;background:#0d9488;color:#fff;
        font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}
      .receipt-label.refund{background:#e11d48}
      .muted{color:#475569;font-weight:500}
      .receipt-line{display:flex;justify-content:space-between;gap:10px;padding:4px 0;font-size:13.5px}
      .receipt-line span:first-child{color:#475569;font-weight:500}
      .receipt-line span:last-child,.receipt-line strong{font-weight:700;color:#0f172a}
      .receipt-items{margin:12px 0;padding:12px 0;border-top:2px dashed #cbd5e1;border-bottom:2px dashed #cbd5e1}
      .receipt-items .receipt-line span:first-child{color:#0f172a;font-weight:600}
      .receipt-total{margin-top:12px;padding:11px 14px;border-radius:10px;background:#f0fdfa;border:1.5px solid #0d9488}
      .receipt-total span{font-size:18px;font-weight:800;color:#0f172a}
      .receipt-total span:first-child{letter-spacing:1px}
      .receipt-foot{text-align:center;margin-top:16px;padding-top:12px;border-top:1px dashed #cbd5e1;
        font-size:12px;font-weight:600;color:#475569;font-style:italic}`;
    let f = document.getElementById('print-frame');
    if(f) f.remove();
    f = document.createElement('iframe');
    f.id = 'print-frame';
    f.setAttribute('aria-hidden','true');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(f);
    const doc = f.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(sale.invoiceNo)}</title><style>${css}</style></head><body>${receiptHTML(sale)}</body></html>`);
    doc.close();
    const go = () => {
      try { f.contentWindow.focus(); f.contentWindow.print(); }
      catch(e){ toast('Could not open print dialog.','error'); }
      setTimeout(()=>{ try{ f.remove(); }catch(_){} }, 1000);
    };
    // Give the iframe a tick to lay out before printing.
    if (f.contentWindow.document.readyState === 'complete') setTimeout(go, 60);
    else f.onload = () => setTimeout(go, 60);
  }

  // Generic print helper — own hidden iframe with self-contained styles.
  function printDocument(title, bodyHTML, css){
    let f = document.getElementById('print-frame'); if(f) f.remove();
    f = document.createElement('iframe'); f.id='print-frame'; f.setAttribute('aria-hidden','true');
    f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(f);
    const doc=f.contentWindow.document; doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style></head><body>${bodyHTML}</body></html>`);
    doc.close();
    const go=()=>{ try{ f.contentWindow.focus(); f.contentWindow.print(); }catch(e){ toast('Could not open print dialog.','error'); } setTimeout(()=>{ try{f.remove();}catch(_){}} ,1000); };
    if (f.contentWindow.document.readyState==='complete') setTimeout(go,60); else f.onload=()=>setTimeout(go,60);
  }

  // Daily / shift Z-Report — a printable end-of-period sales summary.
  function printZReport(fromTs, toTs, label){
    const s = Store.getSettings();
    const sales = Store.salesBetween(fromTs, toTs);
    const realSales = sales.filter(x=>x.type!=='return');
    const refunds = sales.filter(x=>x.type==='return');
    const gross = realSales.reduce((a,x)=>a+(x.total||0),0);
    const refundTotal = refunds.reduce((a,x)=>a+Math.abs(x.total||0),0);
    const net = +(gross-refundTotal).toFixed(2);
    const profit = sales.reduce((a,x)=>a+Store.profitOfSale(x),0);
    const orders = realSales.length;
    const itemsSold = realSales.reduce((a,x)=>a+x.items.reduce((b,i)=>b+(i.qty||0),0),0);
    const byPay={};
    realSales.forEach(x=>{ const k=x.paymentMethod||'—'; byPay[k]=(byPay[k]||0)+(x.total||0); });
    refunds.forEach(x=>{ const k=x.paymentMethod||'—'; byPay[k]=(byPay[k]||0)-Math.abs(x.total||0); });
    const byCash={};
    sales.forEach(x=>{ const k=x.cashier||'—'; if(!byCash[k]) byCash[k]={o:0,rev:0,r:0}; if(x.type==='return') byCash[k].r+=Math.abs(x.total||0); else byCash[k].o++; byCash[k].rev+=(x.total||0); });
    const cashExpected = byPay['Cash']||0;
    const row=(l,v,strong)=>`<div class="z-row"><span>${l}</span><span${strong?' class="z-strong"':''}>${v}</span></div>`;
    const body = `<div class="zdoc">
      <div class="z-head">
        ${s.logo?`<img class="z-logo" src="${s.logo}" alt=""/>`:''}
        <h1>${esc(s.pharmacyName)}</h1>
        <div class="z-sub">${esc(s.address)} · ${esc(s.phone)}</div>
        <div class="z-title">Z-REPORT · SALES SUMMARY</div>
        <div class="z-period">${esc(label)}</div>
        <div class="z-gen">Generated ${Store.dateTimeFmt(Date.now())} · ${esc((Store.session()||{}).name||'Staff')}</div>
      </div>
      <div class="z-sec"><h2>Totals</h2>
        ${row('Gross sales', money(gross))}
        ${refundTotal?row('Refunds', '-'+money(refundTotal)):''}
        ${row('Net revenue', money(net), true)}
        ${row('Gross profit', money(profit))}
        ${row('Orders', num(orders))}
        ${row('Items sold', num(itemsSold))}
        ${row('Avg. order value', money(orders?net/orders:0))}
      </div>
      <div class="z-sec"><h2>By Payment Method</h2>
        ${Object.entries(byPay).map(([k,v])=>row(k, money(v))).join('') || '<div class="z-row"><span>No sales</span><span></span></div>'}
        ${row('Cash expected in drawer', money(cashExpected), true)}
      </div>
      <div class="z-sec"><h2>By Cashier</h2>
        <table class="z-table"><thead><tr><th>Cashier</th><th>Orders</th><th>Refunds</th><th>Net</th></tr></thead>
        <tbody>${Object.entries(byCash).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v.o}</td><td>${v.r?'-'+money(v.r):'—'}</td><td>${money(v.rev)}</td></tr>`).join('')||'<tr><td colspan="4">No activity</td></tr>'}</tbody></table>
      </div>
      <div class="z-foot">
        <div class="z-sign"><span></span>Manager signature</div>
        <div class="z-sign"><span></span>Cashier signature</div>
      </div>
    </div>`;
    const css = `
      @page{size:A5;margin:12mm}
      *{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{font-family:'Inter',-apple-system,'Segoe UI',Roboto,sans-serif;color:#0f172a;font-size:12px}
      .zdoc{max-width:640px;margin:0 auto}
      .z-head{text-align:center;border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:14px}
      .z-logo{max-height:48px;margin:0 auto 6px;display:block}
      .z-head h1{font-size:20px;font-weight:800}
      .z-sub{color:#475569;font-size:11px;margin-top:2px}
      .z-title{margin-top:8px;font-weight:800;letter-spacing:2px;font-size:13px;color:#0d9488}
      .z-period{font-weight:600;margin-top:2px}
      .z-gen{font-size:10px;color:#94a3b8;margin-top:3px}
      .z-sec{margin-bottom:16px}
      .z-sec h2{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:8px}
      .z-row{display:flex;justify-content:space-between;padding:4px 0;font-size:12.5px}
      .z-row span:first-child{color:#475569}
      .z-row span:last-child{font-weight:700}
      .z-row .z-strong{font-size:14px;color:#0d9488}
      .z-table{width:100%;border-collapse:collapse;font-size:12px}
      .z-table th,.z-table td{text-align:right;padding:5px 6px;border-bottom:1px solid #eef2f7}
      .z-table th:first-child,.z-table td:first-child{text-align:left}
      .z-table th{color:#64748b;font-weight:700;font-size:10.5px;text-transform:uppercase}
      .z-foot{display:flex;gap:30px;margin-top:26px}
      .z-sign{flex:1;font-size:10.5px;color:#475569;text-align:center}
      .z-sign span{display:block;border-top:1px solid #0f172a;margin-bottom:5px;padding-top:26px}`;
    printDocument('Z-Report', body, css);
  }

  /* ============================================================ LABORATORY */
  function labStatusBadge(o){
    return o.status==='completed'
      ? `<span class="badge green">${t('Completed')}</span>`
      : `<span class="badge amber">${t('Pending')}</span>`;
  }
  function labRows(){
    const s = state.lab; const q = (s.search||'').toLowerCase();
    let list = Store.all('laborders');
    if (s.status!=='all') list = list.filter(o => s.status==='completed' ? o.status==='completed' : o.status!=='completed');
    if (q) list = list.filter(o => (o.orderNo||'').toLowerCase().includes(q) || (o.patientName||'').toLowerCase().includes(q) || (o.doctor||'').toLowerCase().includes(q));
    if (!list.length) return emptyState('flask','No lab orders','Create a lab order to register tests for a patient.',
      `<button class="btn btn-primary" data-action="new-lab-order">${icon('plus')} ${t('New Lab Order')}</button>`);
    return `<div class="table-wrap"><table class="data">
      <thead><tr><th>${t('Order')}</th><th>${t('Patient')}</th><th>${t('Doctor')}</th><th>${t('Tests')}</th><th>${t('Date')}</th><th>${t('Status')}</th><th class="t-right">${t('Total')}</th><th></th></tr></thead>
      <tbody>${list.map(o=>`<tr>
        <td><span class="cell-main">${esc(o.orderNo)}</span></td>
        <td>${esc(o.patientName||'—')}</td>
        <td><div class="cell-sub">${esc(o.doctor||'—')}</div></td>
        <td><span class="badge gray">${o.tests.length} ${t('tests')}</span></td>
        <td><div class="cell-sub">${Store.dateFmt(o.date)}</div></td>
        <td>${labStatusBadge(o)}</td>
        <td class="t-right"><strong>${money(o.total)}</strong></td>
        <td><div class="row-actions">
          ${o.status==='completed'
            ? `<button class="icon-btn sm" data-action="print-lab" data-id="${o.id}" title="${t('Print report')}">${icon('print')}</button>`
            : `<button class="icon-btn sm" data-action="lab-results" data-id="${o.id}" title="${t('Enter results')}">${icon('edit')}</button>`}
          <button class="icon-btn sm" data-action="view-lab" data-id="${o.id}" title="${t('View')}">${icon('eye')}</button>
          <button class="icon-btn sm" data-action="delete-lab-order" data-id="${o.id}" title="${t('Delete')}">${icon('trash')}</button>
        </div></td></tr>`).join('')}</tbody></table></div>`;
  }
  function viewLab(){
    const orders = Store.all('laborders');
    const today = Store.todayLabOrders();
    const pending = Store.pendingLabOrders().length;
    const st=new Date(); st.setHours(0,0,0,0);
    const revToday = Store.labRevenueBetween(st.getTime(), Date.now());
    const tests = Store.all('labtests').length;
    afterRender = () => {
      const si=$('#lab-search'); if(si) si.oninput=debounce(()=>{ state.lab.search=si.value; $('#lab-results').innerHTML=labRows(); });
      const sf=$('#lab-status'); if(sf) sf.onchange=()=>{ state.lab.status=sf.value; $('#lab-results').innerHTML=labRows(); };
    };
    return `
    <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico teal">${icon('flask')}</div></div><div class="kpi-label">${t('Orders today')}</div><div class="kpi-value">${num(today.length)}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico amber">${icon('clock')}</div></div><div class="kpi-label">${t('Pending results')}</div><div class="kpi-value">${num(pending)}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico green">${icon('dollar')}</div></div><div class="kpi-label">${t('Lab revenue (today)')}</div><div class="kpi-value">${money(revToday)}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico indigo">${icon('droplet')}</div></div><div class="kpi-label">${t('Tests offered')}</div><div class="kpi-value">${num(tests)}</div></div>
    </div>
    <div class="toolbar">
      <div class="search">${icon('search')}<input type="search" id="lab-search" placeholder="${t('Search order, patient or doctor…')}" value="${esc(state.lab.search)}"/></div>
      <select id="lab-status">
        <option value="all" ${state.lab.status==='all'?'selected':''}>${t('All Status')}</option>
        <option value="pending" ${state.lab.status==='pending'?'selected':''}>${t('Pending')}</option>
        <option value="completed" ${state.lab.status==='completed'?'selected':''}>${t('Completed')}</option>
      </select>
      <span style="flex:1"></span>
      <button class="btn btn-secondary" data-action="manage-lab-tests">${icon('droplet')} ${t('Test Catalog')}</button>
      <button class="btn btn-primary" data-action="new-lab-order">${icon('plus')} ${t('New Lab Order')}</button>
    </div>
    <div class="card"><div id="lab-results">${labRows()}</div></div>`;
  }

  /* ---------- New / edit lab order ---------- */
  function labOrderForm(o){
    const customers = Store.all('customers');
    const tests = Store.all('labtests');
    const picked = new Set((o&&o.tests||[]).map(t=>t.testId));
    const cats = [...new Set(tests.map(t=>t.category))];
    return `<form id="lab-form">
      <div class="form-grid">
        <label class="field"><span class="field-label">${t('Patient Name')} *</span><input name="patientName" required value="${esc(o&&o.patientName||'')}" placeholder="${t('Full name')}"/></label>
        <label class="field"><span class="field-label">${t('Referring Doctor')}</span><input name="doctor" value="${esc(o&&o.doctor||'')}" placeholder="Dr. …"/></label>
        <label class="field"><span class="field-label">${t('Link Customer')}</span>
          <select name="customerId"><option value="">— ${t('None')} —</option>${customers.map(c=>`<option value="${c.id}" ${o&&o.customerId===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label>
        <label class="field"><span class="field-label">${t('Payment Method')}</span>
          <select name="paymentMethod">${['Cash','Card','Mobile Money','Deyn'].map(m=>`<option ${o&&o.paymentMethod===m?'selected':''}>${m}</option>`).join('')}</select></label>
      </div>
      <div class="form-section-title" style="margin:16px 0 8px">${icon('flask')} ${t('Select Tests')} * <span id="lab-pick-count" class="muted" style="font-weight:500"></span></div>
      <div id="lab-pick-err" class="login-error" hidden style="margin-bottom:10px">${t('Please select at least one test to create the order.')}</div>
      <div class="lab-test-search"><div class="search">${icon('search')}<input type="search" id="lab-test-filter" placeholder="${t('Filter tests…')}"/></div></div>
      <div class="lab-pick-list" id="lab-pick-list">
        ${cats.map(cat=>`<div class="lab-pick-group" data-cat="${esc(cat)}"><div class="lab-pick-cat">${esc(cat)}</div>
          ${tests.filter(x=>x.category===cat).map(x=>`<label class="lab-pick-item" data-name="${esc((x.name+' '+x.code).toLowerCase())}">
            <input type="checkbox" class="lab-pick" value="${x.id}" data-price="${x.price||0}" ${picked.has(x.id)?'checked':''}/>
            <span class="lab-pick-name">${esc(x.name)} <span class="muted">${x.code?('· '+esc(x.code)):''}</span></span>
            <span class="lab-pick-price">${money(x.price||0)}</span></label>`).join('')}</div>`).join('')}
      </div>
      <div class="lab-total-bar"><span>${t('Total')}</span><strong id="lab-total">${money(0)}</strong></div>
      <input type="hidden" name="_total" id="lab-total-val" value="0"/>
    </form>`;
  }
  function bindLabOrderForm(){
    const recalc = () => {
      let total=0, n=0;
      $$('.lab-pick').forEach(c=>{ if(c.checked){ total+=Number(c.dataset.price||0); n++; } });
      $('#lab-total').textContent = money(total);
      $('#lab-total-val').value = total;
      const cc=$('#lab-pick-count'); if(cc) cc.textContent = n? '· '+n+' '+t('selected') : '';
      const err=$('#lab-pick-err'); if(err && n>0) err.hidden=true;                 // clear the error once a test is picked
      const sb=$('#lab-save'); if(sb){ sb.classList.toggle('btn-disabled', n===0); } // visual cue on the create button
    };
    $$('.lab-pick').forEach(c=> c.onchange = recalc);
    const filt=$('#lab-test-filter');
    if(filt) filt.oninput = () => { const q=filt.value.toLowerCase();
      $$('.lab-pick-item').forEach(it=>{ it.style.display = it.dataset.name.includes(q)?'':'none'; });
      $$('.lab-pick-group').forEach(g=>{ const any=[...g.querySelectorAll('.lab-pick-item')].some(i=>i.style.display!=='none'); g.style.display=any?'':'none'; });
    };
    recalc();
  }
  function openLabOrderModal(o){
    if (!Store.all('labtests').length){ toast(t('Add tests to the catalog first.'),'warn'); openLabTestsModal(); return; }
    const isEdit = !!(o && o.id);
    modal({ title: isEdit?t('Edit Lab Order'):t('New Lab Order'), size:'lg', icon:'flask', body: labOrderForm(o),
      footer:`<button class="btn btn-secondary" data-modal-close>${t('Cancel')}</button>
        <button class="btn btn-primary" id="lab-save">${icon('save')} ${isEdit?t('Save Changes'):t('Create Order')}</button>` });
    bindLabOrderForm();
    $('#lab-save').onclick = () => {
      const chosen = [...document.querySelectorAll('.lab-pick:checked')];
      if(!chosen.length){ const err=$('#lab-pick-err'); if(err){ err.hidden=false; err.scrollIntoView({block:'center',behavior:'smooth'}); }
        toast(t('Select at least one test.'),'warn'); return; }
      const f=$('#lab-form'); if(!f.reportValidity()) return;
      const d = Object.fromEntries(new FormData(f).entries());
      const tests = chosen.map(c=>{ const lt=Store.find('labtests', c.value);
        const prev = (o&&o.tests||[]).find(x=>x.testId===lt.id) || {};
        const base = { testId:lt.id, name:lt.name||'', code:lt.code||'', category:lt.category||'', sampleType:lt.sampleType||'', unit:lt.unit||'', refRange:lt.refRange||'', price:Number(lt.price||0) };
        if (lt.components && lt.components.length){
          const pc = prev.components||[];
          base.components = lt.components.map((cc,ci)=>({ name:cc.name||'', refRange:cc.refRange||'', unit:cc.unit||'',
            result:(pc[ci]&&pc[ci].result)||'', flag:(pc[ci]&&pc[ci].flag)||'' }));
        } else { base.result = prev.result||''; base.flag = prev.flag||''; }
        return base; });
      const total = +tests.reduce((a,b)=>a+Number(b.price||0),0).toFixed(2);
      if (isEdit){
        Store.update('laborders', o.id, { patientName:d.patientName, doctor:d.doctor, customerId:d.customerId, paymentMethod:d.paymentMethod, tests, total });
        toast(t('Lab order updated.'),'success');
      } else {
        const orders = Store.all('laborders');
        const maxNo = orders.reduce((m,x)=>{ const n=parseInt((x.orderNo||'').replace(/\D/g,''),10); return isNaN(n)?m:Math.max(m,n); }, 1000);
        Store.insert('laborders', { orderNo:'LAB-'+(maxNo+1), patientName:d.patientName, doctor:d.doctor, customerId:d.customerId||'',
          paymentMethod:d.paymentMethod, date:Date.now(), status:'pending', tests, total, notes:'', completedAt:null });
        toast(t('Lab order created.'),'success');
      }
      closeModal(); render();
    };
  }

  /* ---------- Enter / edit results ---------- */
  function openLabResultsModal(order){
    if(!order){ toast('Order not found.','error'); return; }
    const row = (name, ref, unit, val, sel) => `<div class="lab-res-row">
        <div class="lab-res-info"><div class="lab-res-name">${esc(name)}</div>
          <div class="lab-res-ref muted">${ref?(t('Ref')+': '+esc(ref)):''} ${unit?('· '+esc(unit)):''}</div></div>
        <input class="lab-res-input" ${sel} data-ref="${esc(ref||'')}" value="${esc(val||'')}" placeholder="${t('Result')}"/>
        <span class="lab-res-flag"></span></div>`;
    modal({ title:t('Enter Results')+' — '+order.orderNo, size:'lg', icon:'edit',
      body:`<div class="lab-pat-head">${icon('user')} <strong>${esc(order.patientName||'—')}</strong> · ${esc(order.doctor||'')} · ${Store.dateFmt(order.date)}</div>
        <form id="lab-res-form"><div class="lab-res-list">
          ${order.tests.map((tt,i)=> (tt.components&&tt.components.length)
            ? `<div class="lab-res-group"><div class="lab-res-gname">${esc(tt.name)}</div>
                ${tt.components.map((cc,ci)=>row(cc.name, cc.refRange, cc.unit, cc.result, `data-i="${i}" data-ci="${ci}"`)).join('')}</div>`
            : row(tt.name, tt.refRange, tt.unit, tt.result, `data-i="${i}"`)).join('')}
        </div></form>`,
      footer:`<button class="btn btn-secondary" data-modal-close>${t('Cancel')}</button>
        <button class="btn btn-soft" id="lab-res-save-draft">${t('Save Draft')}</button>
        <button class="btn btn-primary" id="lab-res-complete">${icon('check')} ${t('Save & Complete')}</button>` });
    const flagChip = (fl) => fl==='high'?`<span class="flag-chip high">${t('High')} ▲</span>`
      : fl==='low'?`<span class="flag-chip low">${t('Low')} ▼</span>`
      : fl==='normal'?`<span class="flag-chip normal">${t('Normal')}</span>`:'';
    const refreshFlag = (inp) => { const fl=Store.labFlag(inp.value, inp.dataset.ref);
      const span=inp.nextElementSibling; if(span&&span.classList.contains('lab-res-flag')) span.innerHTML=flagChip(fl); };
    $$('.lab-res-input').forEach(inp=>{ refreshFlag(inp); inp.oninput=()=>refreshFlag(inp); });
    const val = (i,ci) => { const q = ci==null ? `.lab-res-input[data-i="${i}"]:not([data-ci])` : `.lab-res-input[data-i="${i}"][data-ci="${ci}"]`;
      const inp=document.querySelector(q); return inp?inp.value.trim():''; };
    const collect = () => order.tests.map((tt,i)=>{
      if (tt.components && tt.components.length){
        return { ...tt, components: tt.components.map((cc,ci)=>{ const r=val(i,ci); return { ...cc, result:r, flag:Store.labFlag(r, cc.refRange) }; }) };
      }
      const r=val(i,null); return { ...tt, result:r, flag: Store.labFlag(r, tt.refRange) };
    });
    $('#lab-res-save-draft').onclick = () => { Store.update('laborders', order.id, { tests:collect() }); toast(t('Draft saved.'),'success'); closeModal(); render(); };
    $('#lab-res-complete').onclick = () => {
      Store.update('laborders', order.id, { tests:collect(), status:'completed', completedAt:Date.now() });
      toast(t('Results saved & report ready.'),'success'); closeModal(); render();
    };
  }

  /* ---------- Printable lab report ---------- */
  function labReportHTML(o){
    const s = Store.getSettings(); const cust = Store.find('customers', o.customerId);
    const flagTxt = (fl)=> fl==='high'?'HIGH':fl==='low'?'LOW':fl==='normal'?'Normal':'';
    return `<div class="lab-report">
      <div class="lab-rep-head">
        <h2>${esc(s.pharmacyName)}</h2>
        <div class="lab-rep-sub">${esc(s.address)} · ${esc(s.phone)}</div>
        <div class="lab-rep-title">LABORATORY REPORT</div>
      </div>
      <div class="lab-rep-meta">
        <div><span>Order</span><strong>${esc(o.orderNo)}</strong></div>
        <div><span>Patient</span><strong>${esc(o.patientName||(cust?cust.name:'—'))}</strong></div>
        <div><span>Doctor</span><strong>${esc(o.doctor||'—')}</strong></div>
        <div><span>Date</span><strong>${Store.dateTimeFmt(o.completedAt||o.date)}</strong></div>
      </div>
      <table class="lab-rep-table">
        <thead><tr><th>Test</th><th>Result</th><th>Flag</th><th>Reference</th><th>Unit</th></tr></thead>
        <tbody>${o.tests.map(tt=> (tt.components&&tt.components.length)
          ? `<tr class="grp"><td colspan="5">${esc(tt.name)}${tt.code?` (${esc(tt.code)})`:''}</td></tr>`+
            tt.components.map(cc=>`<tr>
              <td class="sub">${esc(cc.name)}</td>
              <td class="res ${cc.flag||''}">${esc(cc.result||'—')}</td>
              <td class="res ${cc.flag||''}">${flagTxt(cc.flag)}</td>
              <td>${esc(cc.refRange||'—')}</td>
              <td>${esc(cc.unit||'')}</td></tr>`).join('')
          : `<tr>
          <td>${esc(tt.name)}${tt.code?` <span class="code">(${esc(tt.code)})</span>`:''}</td>
          <td class="res ${tt.flag||''}">${esc(tt.result||'—')}</td>
          <td class="res ${tt.flag||''}">${flagTxt(tt.flag)}</td>
          <td>${esc(tt.refRange||'—')}</td>
          <td>${esc(tt.unit||'')}</td></tr>`).join('')}</tbody>
      </table>
      <div class="lab-rep-foot">
        <div class="lab-rep-sign"><div class="sig-line"></div>${t('Lab Technician')}</div>
        <div class="lab-rep-note">${esc(s.footerNote||'')}</div>
      </div>
    </div>`;
  }
  function printLabReport(o){
    if(!o){ toast('Report not found.','error'); return; }
    const css = `
      *{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{font-family:'Inter',-apple-system,'Segoe UI',Roboto,sans-serif;color:#0f172a;padding:24px;font-size:13px}
      .lab-rep-head{text-align:center;border-bottom:2px solid #0f766e;padding-bottom:10px;margin-bottom:14px}
      .lab-rep-head h2{font-size:20px;font-weight:800;color:#0f766e}
      .lab-rep-sub{color:#475569;font-size:12px;margin-top:2px}
      .lab-rep-title{margin-top:8px;font-weight:700;letter-spacing:2px;font-size:13px}
      .lab-rep-meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;margin-bottom:16px;font-size:13px}
      .lab-rep-meta div{display:flex;justify-content:space-between;border-bottom:1px dotted #cbd5e1;padding:3px 0}
      .lab-rep-meta span{color:#64748b}
      .lab-rep-table{width:100%;border-collapse:collapse;margin-bottom:24px}
      .lab-rep-table th{text-align:left;background:#f1f5f9;padding:8px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid #cbd5e1}
      .lab-rep-table td{padding:8px 10px;border-bottom:1px solid #e2e8f0}
      .lab-rep-table .code{color:#94a3b8;font-size:11px}
      .lab-rep-table tr.grp td{background:#f8fafc;font-weight:800;color:#0f766e;padding-top:10px}
      .lab-rep-table td.sub{padding-left:22px}
      .res.high{color:#dc2626;font-weight:700}
      .res.low{color:#2563eb;font-weight:700}
      .res.normal{color:#16a34a}
      .lab-rep-foot{display:flex;justify-content:space-between;align-items:flex-end;margin-top:40px}
      .lab-rep-sign{font-size:12px;color:#475569;text-align:center}
      .sig-line{width:160px;border-top:1px solid #475569;margin-bottom:4px}
      .lab-rep-note{font-size:11px;color:#94a3b8;max-width:240px;text-align:right}`;
    let f=document.getElementById('print-frame'); if(f) f.remove();
    f=document.createElement('iframe'); f.id='print-frame'; f.setAttribute('aria-hidden','true');
    f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(f);
    const doc=f.contentWindow.document; doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(o.orderNo)}</title><style>${css}</style></head><body>${labReportHTML(o)}</body></html>`);
    doc.close();
    const go=()=>{ try{ f.contentWindow.focus(); f.contentWindow.print(); }catch(e){ toast('Could not open print dialog.','error'); } setTimeout(()=>{ try{f.remove();}catch(_){} },1000); };
    if (f.contentWindow.document.readyState==='complete') setTimeout(go,60); else f.onload=()=>setTimeout(go,60);
  }
  function openLabView(o){
    if(!o) return;
    modal({ title:o.orderNo, size:'md', icon:'flask',
      body:`<div class="lab-pat-head">${icon('user')} <strong>${esc(o.patientName||'—')}</strong> · ${esc(o.doctor||'')} · ${Store.dateFmt(o.date)} · ${labStatusBadge(o)}</div>
        <table class="data" style="margin-top:12px"><thead><tr><th>${t('Test')}</th><th>${t('Result')}</th><th>${t('Reference')}</th></tr></thead>
        <tbody>${o.tests.map(tt=> (tt.components&&tt.components.length)
          ? `<tr><td colspan="3" style="font-weight:700;color:var(--primary-700);background:var(--surface-2)">${esc(tt.name)}</td></tr>`+
            tt.components.map(cc=>`<tr><td style="padding-left:22px">${esc(cc.name)}</td>
              <td class="${cc.flag==='high'?'flag-high':cc.flag==='low'?'flag-low':''}"><strong>${esc(cc.result||'—')}</strong> ${cc.unit?esc(cc.unit):''}</td>
              <td class="cell-sub">${esc(cc.refRange||'—')}</td></tr>`).join('')
          : `<tr><td>${esc(tt.name)}</td>
          <td class="${tt.flag==='high'?'flag-high':tt.flag==='low'?'flag-low':''}"><strong>${esc(tt.result||'—')}</strong> ${tt.unit?esc(tt.unit):''}</td>
          <td class="cell-sub">${esc(tt.refRange||'—')}</td></tr>`).join('')}</tbody></table>
        <div class="lab-total-bar" style="margin-top:12px"><span>${t('Total')}</span><strong>${money(o.total)}</strong></div>`,
      footer:`<button class="btn btn-secondary" data-modal-close>${t('Close')}</button>
        ${o.status==='completed'
          ? `<button class="btn btn-primary" data-action="print-lab" data-id="${o.id}">${icon('print')} ${t('Print report')}</button>`
          : `<button class="btn btn-primary" data-action="lab-results" data-id="${o.id}">${icon('edit')} ${t('Enter results')}</button>`}` });
  }

  /* ---------- Test catalog management ---------- */
  function labTestCatalogRows(){
    const s=state.labcat; const q=(s.search||'').toLowerCase();
    let list=Store.all('labtests');
    if(s.category!=='all') list=list.filter(x=>x.category===s.category);
    if(q) list=list.filter(x=>x.name.toLowerCase().includes(q)||(x.code||'').toLowerCase().includes(q));
    if(!list.length) return `<div class="muted" style="padding:18px;text-align:center">${t('No tests yet. Add from the catalog or create one.')}</div>`;
    return `<table class="data"><thead><tr><th>${t('Test')}</th><th>${t('Category')}</th><th>${t('Sample')}</th><th class="t-right">${t('Price')}</th><th></th></tr></thead>
      <tbody>${list.map(x=>`<tr>
        <td><span class="cell-main">${esc(x.name)}</span> ${x.code?`<span class="muted">${esc(x.code)}</span>`:''}<div class="cell-sub">${x.refRange?esc(x.refRange):''} ${x.unit?('· '+esc(x.unit)):''}</div></td>
        <td><span class="badge gray">${esc(x.category)}</span></td>
        <td><div class="cell-sub">${esc(x.sampleType||'—')}</div></td>
        <td class="t-right"><strong>${money(x.price||0)}</strong></td>
        <td><div class="row-actions">
          <button class="icon-btn sm" data-action="edit-lab-test" data-id="${x.id}" title="${t('Edit')}">${icon('edit')}</button>
          <button class="icon-btn sm" data-action="delete-lab-test" data-id="${x.id}" title="${t('Delete')}">${icon('trash')}</button>
        </div></td></tr>`).join('')}</tbody></table>`;
  }
  function openLabTestsModal(){
    state.labcat.search=''; state.labcat.category='all';
    const cats=['all', ...Store.LAB_CATEGORIES];
    modal({ title:t('Lab Test Catalog'), size:'lg', icon:'droplet',
      body:`<div class="toolbar" style="margin-bottom:12px">
          <div class="search">${icon('search')}<input type="search" id="ltc-search" placeholder="${t('Search test…')}"/></div>
          <select id="ltc-cat">${cats.map(c=>`<option value="${c}">${c==='all'?t('All Categories'):c}</option>`).join('')}</select>
          <span style="flex:1"></span>
          <button class="btn btn-secondary btn-sm" data-action="lab-test-from-catalog">${icon('package')} ${t('From Catalog')}</button>
          <button class="btn btn-primary btn-sm" data-action="add-lab-test">${icon('plus')} ${t('New Test')}</button>
        </div>
        <div id="ltc-results">${labTestCatalogRows()}</div>`,
      footer:`<button class="btn btn-secondary" data-modal-close>${t('Close')}</button>` });
    const refresh=()=>{ const r=$('#ltc-results'); if(r) r.innerHTML=labTestCatalogRows(); };
    $('#ltc-search').oninput=(e)=>{ state.labcat.search=e.target.value; refresh(); };
    $('#ltc-cat').onchange=(e)=>{ state.labcat.category=e.target.value; refresh(); };
  }
  function labTestForm(x){
    const o = x || { category:'Hematology', sampleType:'Blood' };
    const cur = Store.getSettings().currency;
    const comps = o.components && o.components.length;
    return `<form id="lt-form" autocomplete="off"><div class="form-grid">
      <label class="field full"><span class="field-label">${t('Test Name')} *</span><input name="name" required value="${esc(o.name||'')}" placeholder="e.g. Complete Blood Count"/></label>
      <label class="field"><span class="field-label">${t('Code')}</span><input name="code" value="${esc(o.code||'')}" placeholder="CBC"/></label>
      <label class="field"><span class="field-label">${t('Category')} *</span><select name="category" required>${Store.LAB_CATEGORIES.map(c=>`<option ${o.category===c?'selected':''}>${c}</option>`).join('')}</select></label>
      <label class="field"><span class="field-label">${t('Sample Type')}</span><input name="sampleType" value="${esc(o.sampleType||'')}" placeholder="Blood / Urine / Stool"/></label>
      <label class="field"><span class="field-label">${t('Price')} *</span><div class="input-affix"><span class="affix">${esc(cur)}</span><input name="price" type="number" step="0.01" min="0" required value="${o.price??''}" placeholder="0.00"/></div></label>
      ${comps?'':`<label class="field"><span class="field-label">${t('Reference Range')}</span><input name="refRange" value="${esc(o.refRange||'')}" placeholder="70–110"/></label>
      <label class="field"><span class="field-label">${t('Unit')}</span><input name="unit" value="${esc(o.unit||'')}" placeholder="mg/dL"/></label>`}
    </div>
    ${comps?`<div class="panel-box"><div class="panel-box-head">${icon('flask')} ${t('Panel')} — ${o.components.length} ${t('components')}</div>
      <div class="panel-comps">${o.components.map(cc=>`<div class="panel-comp"><span>${esc(cc.name)}</span><span class="muted">${esc(cc.refRange||'')} ${cc.unit?esc(cc.unit):''}</span></div>`).join('')}</div></div>`:''}
    </form>`;
  }
  function openLabTestModal(x){
    const isEdit=!!(x&&x.id);
    modal({ title:isEdit?t('Edit Test'):t('New Test'), size:'md', icon:'droplet', body:labTestForm(x),
      footer:`<button class="btn btn-secondary" data-modal-close>${t('Cancel')}</button>
        <button class="btn btn-primary" id="lt-save">${icon('save')} ${isEdit?t('Save Changes'):t('Add Test')}</button>` });
    $('#lt-save').onclick=()=>{ const f=$('#lt-form'); if(!f.reportValidity()) return;
      const d=Object.fromEntries(new FormData(f).entries()); d.price=Number(d.price||0);
      d.code=d.code||''; d.sampleType=d.sampleType||''; d.refRange=d.refRange||''; d.unit=d.unit||'';
      if (x && x.components && x.components.length) d.components = x.components.map(cc=>({ name:cc.name||'', refRange:cc.refRange||'', unit:cc.unit||'' }));
      if(isEdit){ Store.update('labtests', x.id, d); toast(t('Test updated.'),'success'); }
      else { Store.insert('labtests', d); toast(t('Test added.'),'success'); }
      closeModal(); openLabTestsModal();
    };
  }
  function openLabTestCatalogPicker(){
    state.labpick.search=''; state.labpick.sample='all';
    const samples=['all', ...Store.LAB_SAMPLES];
    modal({ title:t('Add from Catalog'), size:'lg', icon:'package',
      body:`<p class="muted" style="margin:0 0 12px">${t('Pick a common test — set your price after.')} <strong>${Store.LAB_CATALOG.length}</strong> ${t('tests')}.</p>
        <div class="toolbar" style="margin-bottom:12px">
          <div class="search">${icon('search')}<input type="search" id="ltp-search" placeholder="${t('Search test…')}"/></div>
          <select id="ltp-sample">${samples.map(s=>`<option value="${s}">${s==='all'?t('All Samples'):t(s)}</option>`).join('')}</select>
        </div>
        <div id="ltp-results">${labCatalogPickerRows()}</div>`,
      footer:`<button class="btn btn-secondary" data-modal-close>${t('Close')}</button>` });
    const refresh=()=>{ const r=$('#ltp-results'); if(r) r.innerHTML=labCatalogPickerRows(); };
    $('#ltp-search').oninput=(e)=>{ state.labpick.search=e.target.value; refresh(); };
    $('#ltp-sample').onchange=(e)=>{ state.labpick.sample=e.target.value; refresh(); };
  }
  function labCatalogPickerRows(){
    const have=new Set(Store.all('labtests').map(x=>(x.code||x.name||'').toLowerCase()));
    const q=(state.labpick.search||'').toLowerCase(); const smp=state.labpick.sample;
    let list=Store.LAB_CATALOG;
    if(smp!=='all') list=list.filter(x=>x.sampleType===smp);
    if(q) list=list.filter(x=>x.name.toLowerCase().includes(q)||(x.code||'').toLowerCase().includes(q));
    if(!list.length) return `<div class="muted" style="padding:18px;text-align:center">${t('No tests match your search.')}</div>`;
    return `<div class="catalog-list">${list.map(x=>{ const added=have.has((x.code||x.name).toLowerCase()); const panel=x.components&&x.components.length;
      return `<button class="catalog-row" data-action="lab-test-pick" data-code="${esc(x.code||'')}" data-name="${esc(x.name)}" ${added?'data-added="1"':''}>
        <div class="catalog-ico">${icon(panel?'flask':'droplet')}</div>
        <div class="catalog-meta"><div class="catalog-name">${esc(x.name)} ${panel?`<span class="panel-tag">${t('Panel')} · ${x.components.length}</span>`:''}</div>
          <div class="catalog-sub">${esc(x.category)} · ${esc(x.sampleType||'')} ${x.refRange?('· '+esc(x.refRange)):''}</div></div>
        ${added?`<span class="catalog-tag">${t('Added')}</span>`:`<span class="catalog-add">${icon('plus')}</span>`}</button>`;
    }).join('')}</div>`;
  }

  /* ============================================================ SALES HISTORY */
  function salesRows(){
    const q = state.sales.search.toLowerCase();
    let sales = Store.all('sales').slice().sort((a,b)=>(b.date||0)-(a.date||0));
    if (q) sales = sales.filter(s=>{ const c=Store.find('customers',s.customerId);
      return s.invoiceNo.toLowerCase().includes(q) || (c&&c.name.toLowerCase().includes(q)) || s.cashier.toLowerCase().includes(q); });
    if (!sales.length) return emptyState('receipt','No sales found','Try a different search or make a sale in POS.');
    return `<div class="table-wrap"><table class="data">
      <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Items</th><th>Cashier</th><th>Payment</th><th class="t-right">Total</th><th></th></tr></thead>
      <tbody>${sales.map(s=>{ const c=Store.find('customers',s.customerId);
        const isReturn = s.type==='return';
        return `<tr>
          <td><span class="cell-main">${esc(s.invoiceNo)}</span>${isReturn?` <span class="badge red" style="margin-left:4px">Refund</span>`:''}</td>
          <td><div class="cell-sub">${Store.dateTimeFmt(s.date)}</div></td>
          <td>${esc(c?c.name:'Walk-in')}</td>
          <td><span class="badge gray">${Math.abs(s.items.reduce((a,i)=>a+i.qty,0))} items</span></td>
          <td><div class="cell-sub">${esc(s.cashier)}</div></td>
          <td><span class="badge ${s.paymentMethod==='Cash'?'green':s.paymentMethod==='Card'?'blue':'teal'}">${esc(s.paymentMethod)}</span></td>
          <td class="t-right"><strong style="${isReturn?'color:var(--danger)':''}">${money(s.total)}</strong></td>
          <td><div class="row-actions">
            <button class="icon-btn sm" data-action="view-sale" data-id="${s.id}" title="View receipt">${icon('eye')}</button>
            ${!isReturn?`<button class="icon-btn sm" data-action="refund-sale" data-id="${s.id}" title="Return / Refund">${icon('undo')}</button>`:''}
            <button class="icon-btn sm" data-action="delete-sale" data-id="${s.id}" title="Delete">${icon('trash')}</button>
          </div></td></tr>`;
      }).join('')}</tbody></table></div>`;
  }
  function viewSales(){
    const sales = Store.all('sales');
    const totalRev = Store.revenue(sales);
    const totalProfit = sales.reduce((a,s)=>a+Store.profitOfSale(s),0);
    afterRender = () => { const si=$('#sales-search'); if(si) si.oninput=debounce(()=>{ state.sales.search=si.value; $('#sales-results').innerHTML=salesRows(); }); };
    return `
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico teal">${icon('receipt')}</div></div><div class="kpi-label">Total Transactions</div><div class="kpi-value">${num(sales.length)}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico green">${icon('dollar')}</div></div><div class="kpi-label">Total Revenue</div><div class="kpi-value">${money(totalRev)}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico indigo">${icon('trendUp')}</div></div><div class="kpi-label">Gross Profit</div><div class="kpi-value">${money(totalProfit)}</div></div>
    </div>
    <div class="toolbar"><div class="search">${icon('search')}<input type="search" id="sales-search" placeholder="Search invoice, customer or cashier…" value="${esc(state.sales.search)}"/></div></div>
    <div class="card"><div id="sales-results">${salesRows()}</div></div>`;
  }

  /* ============================================================ CUSTOMERS */
  function customerRows(){
    const q = state.cust.search.toLowerCase();
    let list = Store.all('customers');
    if (q) list = list.filter(c=>c.name.toLowerCase().includes(q)||(c.phone||'').includes(q)||(c.email||'').toLowerCase().includes(q));
    if (!list.length) return emptyState('users','No customers','Add your first customer to get started.',
      `<button class="btn btn-primary" data-action="add-customer">${icon('plus')} Add Customer</button>`);
    const sales = Store.all('sales');
    return `<div class="table-wrap"><table class="data">
      <thead><tr><th>Customer</th><th>Phone</th><th>Email</th><th>Orders</th><th class="t-right">Total Spent</th><th></th></tr></thead>
      <tbody>${list.map(c=>{
        const cs = sales.filter(s=>s.customerId===c.id);
        const spent = Store.revenue(cs);
        return `<tr>
          <td><div style="display:flex;align-items:center;gap:11px">
            <span class="avatar" style="background:${avatarColor(c.name)}">${initials(c.name)}</span>
            <div><div class="cell-main">${esc(c.name)}</div><div class="cell-sub">${esc(c.address||'')}</div></div></div></td>
          <td>${esc(c.phone||'—')}</td>
          <td><div class="cell-sub">${esc(c.email||'—')}</div></td>
          <td><span class="badge teal">${cs.length} orders</span></td>
          <td class="t-right"><strong>${money(spent)}</strong></td>
          <td><div class="row-actions">
            <button class="icon-btn sm" data-action="edit-customer" data-id="${c.id}" title="Edit">${icon('edit')}</button>
            <button class="icon-btn sm" data-action="delete-customer" data-id="${c.id}" title="Delete">${icon('trash')}</button>
          </div></td></tr>`;
      }).join('')}</tbody></table></div>`;
  }
  function viewCustomers(){
    afterRender = () => { const si=$('#cust-search'); if(si) si.oninput=debounce(()=>{ state.cust.search=si.value; $('#cust-results').innerHTML=customerRows(); }); };
    return `<div class="toolbar">
      <div class="search">${icon('search')}<input type="search" id="cust-search" placeholder="Search customers…" value="${esc(state.cust.search)}"/></div>
      <span style="flex:1"></span>
      <button class="btn btn-primary" data-action="add-customer">${icon('plus')} Add Customer</button></div>
    <div class="card"><div id="cust-results">${customerRows()}</div></div>`;
  }
  function openCustomerModal(c){
    const o=c||{};
    modal({ title:c?'Edit Customer':'Add Customer', icon:'user',
      body:`<form id="cust-form" autocomplete="off"><div class="form-grid">
        <label class="field full"><span class="field-label">Full Name *</span><input name="name" required value="${esc(o.name||'')}"/></label>
        <label class="field"><span class="field-label">Phone</span><input name="phone" value="${esc(o.phone||'')}"/></label>
        <label class="field"><span class="field-label">Email</span><input name="email" type="email" value="${esc(o.email||'')}"/></label>
        <label class="field full"><span class="field-label">Address</span><input name="address" value="${esc(o.address||'')}"/></label>
      </div></form>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary" id="save-cust">${icon('save')} Save</button>` });
    $('#save-cust').onclick=()=>{ const f=$('#cust-form'); if(!f.reportValidity())return;
      const d=Object.fromEntries(new FormData(f).entries());
      if(c){Store.update('customers',c.id,d);toast('Customer updated.','success');}else{Store.insert('customers',d);toast('Customer added.','success');}
      closeModal(); render(); };
  }

  /* ============================================================ SUPPLIERS */
  function supplierRows(){
    const q = state.supp.search.toLowerCase();
    let list = Store.all('suppliers');
    if (q) list = list.filter(s=>s.name.toLowerCase().includes(q)||(s.contact||'').toLowerCase().includes(q)||(s.phone||'').includes(q));
    if (!list.length) return emptyState('truck','No suppliers','Add suppliers to track where your stock comes from.',
      `<button class="btn btn-primary" data-action="add-supplier">${icon('plus')} Add Supplier</button>`);
    const meds = Store.all('medicines');
    return `<div class="grid-3">${list.map(s=>{
      const count = meds.filter(m=>m.supplierId===s.id).length;
      return `<div class="card"><div class="card-pad">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div class="kpi-ico teal">${icon('truck')}</div>
          <div style="flex:1;min-width:0"><div class="cell-main" style="font-size:15px">${esc(s.name)}</div>
            <div class="cell-sub">${esc(s.contact||'')}</div></div></div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
          <div style="display:flex;align-items:center;gap:9px;color:var(--text-2)">${icon('phone','width="15" height="15"')} ${esc(s.phone||'—')}</div>
          <div style="display:flex;align-items:center;gap:9px;color:var(--text-2)">${icon('mail','width="15" height="15"')} ${esc(s.email||'—')}</div>
          <div style="display:flex;align-items:center;gap:9px;color:var(--text-2)">${icon('pin','width="15" height="15"')} ${esc(s.address||'—')}</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
          <span class="badge teal">${count} products</span>
          <div class="row-actions">
            <button class="icon-btn sm" data-action="edit-supplier" data-id="${s.id}">${icon('edit')}</button>
            <button class="icon-btn sm" data-action="delete-supplier" data-id="${s.id}">${icon('trash')}</button>
          </div></div>
      </div></div>`;
    }).join('')}</div>`;
  }
  function viewSuppliers(){
    afterRender = () => { const si=$('#supp-search'); if(si) si.oninput=debounce(()=>{ state.supp.search=si.value; $('#supp-results').innerHTML=supplierRows(); }); };
    return `<div class="toolbar">
      <div class="search">${icon('search')}<input type="search" id="supp-search" placeholder="Search suppliers…" value="${esc(state.supp.search)}"/></div>
      <span style="flex:1"></span>
      <button class="btn btn-primary" data-action="add-supplier">${icon('plus')} Add Supplier</button></div>
    <div id="supp-results">${supplierRows()}</div>`;
  }
  function openSupplierModal(s){
    const o=s||{};
    modal({ title:s?'Edit Supplier':'Add Supplier', icon:'truck',
      body:`<form id="supp-form" autocomplete="off"><div class="form-grid">
        <label class="field full"><span class="field-label">Company Name *</span><input name="name" required value="${esc(o.name||'')}"/></label>
        <label class="field"><span class="field-label">Contact Person</span><input name="contact" value="${esc(o.contact||'')}"/></label>
        <label class="field"><span class="field-label">Phone</span><input name="phone" value="${esc(o.phone||'')}"/></label>
        <label class="field full"><span class="field-label">Email</span><input name="email" type="email" value="${esc(o.email||'')}"/></label>
        <label class="field full"><span class="field-label">Address</span><input name="address" value="${esc(o.address||'')}"/></label>
      </div></form>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary" id="save-supp">${icon('save')} Save</button>` });
    $('#save-supp').onclick=()=>{ const f=$('#supp-form'); if(!f.reportValidity())return;
      const d=Object.fromEntries(new FormData(f).entries());
      if(s){Store.update('suppliers',s.id,d);toast('Supplier updated.','success');}else{Store.insert('suppliers',d);toast('Supplier added.','success');}
      closeModal(); render(); };
  }

  /* ============================================================ PURCHASES */
  let purchaseDraft = [];
  function viewPurchases(){
    const list = Store.all('purchases');
    const rows = list.length ? `<div class="table-wrap"><table class="data">
      <thead><tr><th>Reference</th><th>Supplier</th><th>Items</th><th>Date</th><th>Note</th><th class="t-right">Total</th><th></th></tr></thead>
      <tbody>${list.map(p=>{ const sup=Store.find('suppliers',p.supplierId);
        return `<tr>
          <td><span class="cell-main">${esc(p.refNo)}</span></td>
          <td>${esc(sup?sup.name:'—')}</td>
          <td><span class="badge gray">${p.items.length} lines · ${p.items.reduce((a,i)=>a+Number(i.qty),0)} units</span></td>
          <td><div class="cell-sub">${Store.dateFmt(p.date)}</div></td>
          <td><div class="cell-sub">${esc(p.note||'—')}</div></td>
          <td class="t-right"><strong>${money(p.total)}</strong></td>
          <td><button class="icon-btn sm" data-action="delete-purchase" data-id="${p.id}">${icon('trash')}</button></td></tr>`;
      }).join('')}</tbody></table></div>` : emptyState('inbox','No purchases yet','Record a stock-in to update inventory and track costs.',
        `<button class="btn btn-primary" data-action="add-purchase">${icon('plus')} New Purchase</button>`);
    return `<div class="toolbar"><span style="flex:1"></span>
      <button class="btn btn-primary" data-action="add-purchase">${icon('plus')} New Purchase</button></div>
      <div class="card">${rows}</div>`;
  }
  function purchaseModalBody(){
    const sup = Store.all('suppliers'); const meds = Store.all('medicines');
    const total = purchaseDraft.reduce((a,l)=>a+l.qty*l.cost,0);
    return `<div class="form-grid" style="margin-bottom:18px">
        <label class="field"><span class="field-label">Supplier *</span><select id="pur-supplier">${sup.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
        <label class="field"><span class="field-label">Date</span><input type="date" id="pur-date" value="${new Date().toISOString().slice(0,10)}"/></label>
        <label class="field full"><span class="field-label">Note</span><input id="pur-note" placeholder="Optional note"/></label>
      </div>
      <div class="card" style="margin-bottom:14px"><div class="card-head" style="padding:12px 16px">${icon('plus')}<h3 style="font-size:14px">Add Line Item</h3></div>
        <div class="card-body" style="padding:14px 16px">
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:10px;align-items:end">
            <label class="field"><span class="field-label">Medicine</span><select id="pl-med">${meds.map(m=>`<option value="${m.id}" data-cost="${m.costPrice}">${esc(m.name)} (stock: ${m.quantity})</option>`).join('')}</select></label>
            <label class="field"><span class="field-label">Quantity</span><input type="number" id="pl-qty" min="1" value="10"/></label>
            <label class="field"><span class="field-label">Unit Cost</span><input type="number" id="pl-cost" step="0.01" min="0" value="${meds[0]?meds[0].costPrice:0}"/></label>
            <button class="btn btn-soft" data-action="pl-add" type="button">${icon('plus')} Add</button>
          </div></div></div>
      <div id="pur-lines">${purchaseLines()}</div>
      <div class="sum-row total" style="border-top:1px dashed var(--border);padding-top:12px"><span>Total Cost</span><span id="pur-total">${money(total)}</span></div>`;
  }
  function purchaseLines(){
    if (!purchaseDraft.length) return `<div class="muted" style="text-align:center;padding:16px;font-size:13px">No items added yet.</div>`;
    return `<div class="table-wrap"><table class="data"><thead><tr><th>Medicine</th><th class="t-center">Qty</th><th class="t-right">Cost</th><th class="t-right">Subtotal</th><th></th></tr></thead>
      <tbody>${purchaseDraft.map((l,i)=>`<tr><td>${esc(l.name)}</td><td class="t-center">${l.qty}</td><td class="t-right">${money(l.cost)}</td><td class="t-right">${money(l.qty*l.cost)}</td>
        <td><button class="icon-btn sm" data-action="pl-remove" data-i="${i}">${icon('x')}</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  function openPurchaseModal(prefill, supplierId){
    purchaseDraft = Array.isArray(prefill) ? prefill.map(l=>({ medicineId:l.medicineId, name:l.name, qty:Number(l.qty)||1, cost:Number(l.cost)||0 })) : [];
    modal({ title:'New Purchase / Stock-In', size:'lg', icon:'inbox', body: purchaseModalBody(),
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary" id="save-purchase">${icon('save')} Save & Update Stock</button>` });
    wirePurchaseModal();
    if (supplierId){ const ps=$('#pur-supplier'); if(ps) ps.value=supplierId; }
  }
  function wirePurchaseModal(){
    const medSel = $('#pl-med'), costInp = $('#pl-cost');
    if (medSel) medSel.onchange = () => { const opt=medSel.selectedOptions[0]; if(opt&&costInp) costInp.value = opt.dataset.cost; };
    const save = $('#save-purchase');
    if (save) save.onclick = () => {
      if (!purchaseDraft.length) return toast('Add at least one item.','warn');
      const supplierId = $('#pur-supplier').value;
      const total = purchaseDraft.reduce((a,l)=>a+l.qty*l.cost,0);
      const purchase = { refNo:'PO-'+Math.floor(2000+Math.random()*8000), supplierId, items: purchaseDraft.map(l=>({medicineId:l.medicineId,name:l.name,qty:l.qty,cost:l.cost})),
        total:+total.toFixed(2), date:new Date($('#pur-date').value).getTime()||Date.now(), note:$('#pur-note').value };
      purchaseDraft.forEach(l=>{ const m=Store.find('medicines',l.medicineId); if(m) Store.update('medicines',l.medicineId,{ quantity:m.quantity+Number(l.qty), costPrice:l.cost }); });
      Store.insert('purchases', purchase);
      closeModal(); toast(`Purchase ${purchase.refNo} saved · stock updated.`,'success'); render();
    };
  }

  /* ============================================================ DEYN (credit/debt) */
  function deynRows(){
    let list = Store.debtors();
    const q = (state.deyn.search||'').toLowerCase();
    if(q) list = list.filter(c=> c.name.toLowerCase().includes(q) || (c.phone||'').includes(q));
    if(!list.length) return emptyState('check','No outstanding debts','When you sell on credit (Deyn) in POS, customer balances appear here.');
    return `<div class="table-wrap"><table class="data"><thead><tr><th>Customer</th><th>Phone</th><th class="t-right">Owed (lagugu leeyahay)</th><th></th></tr></thead><tbody>${list.map(c=>`<tr>
      <td><div style="display:flex;align-items:center;gap:11px"><span class="avatar" style="background:${avatarColor(c.name)}">${initials(c.name)}</span><span class="cell-main">${esc(c.name)}</span></div></td>
      <td>${esc(c.phone||'—')}</td>
      <td class="t-right"><strong style="color:var(--danger)">${money(c.balance)}</strong></td>
      <td><div class="row-actions">
        <button class="icon-btn sm" data-action="view-ledger" data-id="${c.id}" title="History">${icon('eye')}</button>
        <button class="btn btn-soft btn-sm" data-action="record-payment" data-id="${c.id}">${icon('dollar')} Bixin</button></div></td></tr>`).join('')}</tbody></table></div>`;
  }
  function viewDeyn(){
    const dts = Store.debtors();
    afterRender = ()=>{ const si=$('#deyn-search'); if(si) si.oninput=debounce(()=>{ state.deyn.search=si.value; $('#deyn-results').innerHTML=deynRows(); }); };
    return `<div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico red">${icon('dollar')}</div></div><div class="kpi-label">Total Outstanding</div><div class="kpi-value">${money(Store.totalReceivables())}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico amber">${icon('users')}</div></div><div class="kpi-label">Debtors</div><div class="kpi-value">${num(dts.length)}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico teal">${icon('receipt')}</div></div><div class="kpi-label">Credit Sales</div><div class="kpi-value">${num(Store.all('sales').filter(s=>s.paymentMethod==='Deyn').length)}</div></div>
    </div>
    <div class="toolbar"><div class="search">${icon('search')}<input type="search" id="deyn-search" placeholder="Search debtor by name or phone…" value="${esc(state.deyn.search||'')}"></div></div>
    <div class="card"><div id="deyn-results">${deynRows()}</div></div>`;
  }
  function openPaymentModal(cid){
    const c = Store.find('customers', cid); if(!c) return;
    const bal = Store.debtOf(cid); const cur = Store.getSettings().currency;
    modal({ title:'Record Payment — '+c.name, icon:'dollar',
      body:`<div style="text-align:center;margin-bottom:16px"><div class="muted">Current balance (deyn)</div>
        <div style="font-family:var(--font-display);font-size:28px;font-weight:800;color:var(--danger)">${money(bal)}</div></div>
        <form id="payf"><div class="form-grid">
          <label class="field"><span class="field-label">Amount Paid *</span><div class="input-affix"><span class="affix">${esc(cur)}</span><input name="amount" type="number" step="0.01" min="0.01" value="${bal.toFixed(2)}" required></div></label>
          <label class="field"><span class="field-label">Method</span><select name="method"><option>Cash</option><option>Mobile Money</option><option>Card</option></select></label>
          <label class="field full"><span class="field-label">Note</span><input name="note" placeholder="optional"></label>
        </div></form>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary" id="save-pay">${icon('check')} Record Payment</button>` });
    $('#save-pay').onclick=()=>{ const f=$('#payf'); if(!f.reportValidity())return; const d=Object.fromEntries(new FormData(f).entries());
      const amt = Math.min(Math.max(0,+d.amount), bal);
      if(amt<=0){ toast('Enter a valid amount.','warn'); return; }
      Store.insert('payments', { customerId:cid, amount:+amt.toFixed(2), method:d.method||'Cash', note:d.note||'', date:Date.now(), by:(Store.session()||{}).name||'Staff' });
      closeModal(); toast(`Payment of ${money(amt)} recorded.`,'success'); render(); };
  }
  function openLedgerModal(cid){
    const c=Store.find('customers',cid); if(!c) return; const led=Store.customerLedger(cid); const bal=Store.debtOf(cid);
    modal({ title:'Ledger — '+c.name, icon:'receipt',
      body:`<div class="sum-row total" style="border-top:none;margin:0 0 10px"><span>Balance owed</span><span style="color:var(--danger)">${money(bal)}</span></div>
        ${led.length?`<div class="mini-list">${led.map(e=>`<div class="mini-item">
          <div class="mini-ico" style="background:var(--${e.type==='payment'?'success':'danger'}-soft);color:var(--${e.type==='payment'?'success':'danger'})">${icon(e.type==='payment'?'check':'cart')}</div>
          <div class="mini-main"><div class="mini-title">${e.type==='payment'?'Payment received':'Credit sale'}${e.ref?' · '+esc(e.ref):''}${e.note?' · '+esc(e.note):''}</div><div class="mini-sub">${Store.dateTimeFmt(e.date)}</div></div>
          <span class="mini-val" style="color:var(--${e.type==='payment'?'success':'danger'})">${e.type==='payment'?'−':'+'}${money(e.amount)}</span></div>`).join('')}</div>`:'<p class="muted" style="padding:12px 0">No history.</p>'}`,
      footer:`<button class="btn btn-secondary" data-modal-close>Close</button><button class="btn btn-primary" data-action="record-payment" data-id="${cid}" data-modal-close>${icon('dollar')} Record payment</button>` });
  }

  /* ============================================================ CASH CLOSE */
  // Shift windows for today: Day 06:00–18:00, Night 18:00–end of day, Full = whole day.
  function shiftWindow(shift){
    const d=new Date(); d.setHours(0,0,0,0); const base=d.getTime(); const H=3600000; const now=Date.now();
    if(shift==='day')   return [base+6*H, Math.min(base+18*H, now)];
    if(shift==='night') return [base+18*H, Math.max(base+18*H, now)];
    return [base, now]; // full day
  }
  function shiftWindowText(shift){
    if(shift==='day') return '06:00 – 18:00';
    if(shift==='night') return '18:00 – 00:00';
    return t('Whole day');
  }
  const SHIFTS = [['day','Day','sun'],['night','Night','moon'],['full','Full Day','calendar']];
  function viewCashClose(){
    const now=Date.now();
    // default shift from the current hour: 06:00–17:59 → day, otherwise night
    if(!state.cc.shift){ const h=new Date().getHours(); state.cc.shift = (h>=6 && h<18) ? 'day' : 'night'; }
    const shift = state.cc.shift;
    const [from,to] = shiftWindow(shift);
    const cashSales = Store.cashSalesBetween(from, to);
    const salesCash = Store.revenue(cashSales);
    const deynPays = Store.all('payments').filter(p=> (p.method||'Cash')==='Cash' && p.date>=from && p.date<=to);
    const deynCash = +deynPays.reduce((a,p)=>a+(p.amount||0),0).toFixed(2);
    const expected = +(salesCash + deynCash).toFixed(2);
    const closes = Store.all('cashcloses');
    const cur = Store.getSettings().currency;
    const shiftLabel = (SHIFTS.find(s=>s[0]===shift)||SHIFTS[2])[1];
    afterRender = ()=>{ const f=$('#close-form'); if(!f) return;
      const calc=()=>{ const opening=+($('#cc-open').value||0), counted=+($('#cc-count').value||0); const exp=+(expected+opening).toFixed(2); const diff=+(counted-exp).toFixed(2);
        $('#cc-expected').textContent = money(exp);
        const box=$('#cc-result'); const state = Math.abs(diff)<0.01?'ok':diff<0?'short':'over';
        box.className = 'cc-result '+state;
        $('#cc-diff').textContent = (diff>=0?'+':'') + money(diff);
        $('#cc-diff-label').textContent = state==='ok'? t('Balanced ✓') : state==='short'? t('Short') : t('Over'); };
      $('#cc-open').oninput=calc; $('#cc-count').oninput=calc; calc();
      f.onsubmit=(e)=>{ e.preventDefault(); if(Store.inSupport()){ toast('Read-only support view.','warn'); return; }
        const opening=+($('#cc-open').value||0), counted=+($('#cc-count').value||0); const exp=+(expected+opening).toFixed(2);
        Store.insert('cashcloses',{ date:Date.now(), shift, shiftLabel, expectedSales:+salesCash.toFixed(2), expectedDeyn:deynCash, opening:+opening.toFixed(2),
          expected:exp, counted:+counted.toFixed(2), difference:+(counted-exp).toFixed(2), salesCount:cashSales.length,
          by:(Store.session()||{}).name||'Staff', note:$('#cc-note').value||'' });
        celebrate(); toast('Cash close saved.','success'); render(); }; };
    return `
    <div class="shift-bar">
      <span class="shift-bar-label">${icon('clock')} ${t('Shift')}</span>
      <div class="shift-toggle">
        ${SHIFTS.map(([key,label,ic])=>`<button class="shift-chip ${shift===key?'active':''}" data-action="cc-shift" data-shift="${key}">${icon(ic)} ${t(label)}</button>`).join('')}
      </div>
      <span class="shift-window muted">${shiftWindowText(shift)}</span>
    </div>
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico teal">${icon('cart')}</div></div><div class="kpi-label">${t('Cash sales')} · ${t(shiftLabel)}</div><div class="kpi-value">${money(salesCash)}</div><div class="kpi-sub muted">${cashSales.length} ${t('transactions')}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico violet">${icon('dollar')}</div></div><div class="kpi-label">${t('Deyn payments')} · ${t(shiftLabel)}</div><div class="kpi-value">${money(deynCash)}</div><div class="kpi-sub muted">${deynPays.length} ${t('payments')}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico green">${icon('box')}</div></div><div class="kpi-label">${t('Expected cash')}</div><div class="kpi-value">${money(expected)}</div><div class="kpi-sub muted">${t('sales + deyn')}</div></div>
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-head pro"><div class="set-ico teal">${icon('box')}</div><div class="set-htext"><h3>${t('Close Drawer')} · ${t(shiftLabel)}</h3><p>${t('Count the cash and record any over/short')}</p></div></div>
        <div class="card-body"><form id="close-form" style="display:flex;flex-direction:column;gap:14px">
          <label class="field"><span class="field-label">${t('Opening float')} <span class="muted" style="font-weight:400">(${t('cash at start of day')})</span></span><div class="input-affix"><span class="affix">${esc(cur)}</span><input id="cc-open" type="number" step="0.01" value="0"></div></label>
          <div class="cc-expected-row"><span>${t('Expected in drawer')}</span><strong id="cc-expected">${money(expected)}</strong></div>
          <label class="field"><span class="field-label">${t('Counted cash in drawer')} *</span><div class="input-affix"><span class="affix">${esc(cur)}</span><input id="cc-count" type="number" step="0.01" value="${expected.toFixed(2)}" required></div></label>
          <div id="cc-result" class="cc-result ok">
            <div class="ccr-label" id="cc-diff-label">${t('Balanced ✓')}</div>
            <div class="ccr-value" id="cc-diff">${money(0)}</div>
          </div>
          <label class="field"><span class="field-label">${t('Note')}</span><input id="cc-note" placeholder="${t('optional')}"></label>
          <button class="btn btn-primary btn-lg" type="submit">${icon('save')} ${t('Save Cash Close')}</button>
        </form></div></div>
      <div class="card"><div class="card-head pro"><div class="set-ico indigo">${icon('clock')}</div><div class="set-htext"><h3>${t('Recent Closes')}</h3><p>${t('Your last drawer counts')}</p></div></div>
        <div class="card-body" style="padding:8px 20px">${closes.length?`<div class="mini-list">${closes.slice(0,12).map(c=>`<div class="mini-item">
          <div class="mini-ico" style="background:var(--${Math.abs(c.difference)<0.01?'success':'warning'}-soft);color:var(--${Math.abs(c.difference)<0.01?'success':'warning'})">${icon('box')}</div>
          <div class="mini-main"><div class="mini-title">${Store.dateFmt(c.date)}${c.shiftLabel?` <span class="shift-tag ${esc(c.shift||'')}">${c.shift==='day'?icon('sun'):c.shift==='night'?icon('moon'):icon('calendar')} ${t(c.shiftLabel)}</span>`:''} · ${t('counted')} ${money(c.counted)}</div><div class="mini-sub">${esc(c.by)} · ${c.salesCount} ${t('txns')}</div></div>
          <span class="badge ${Math.abs(c.difference)<0.01?'green':c.difference<0?'red':'amber'}">${c.difference>=0?'+':''}${money(c.difference)}</span></div>`).join('')}</div>`:emptyState('box','No closes yet','Count and close the drawer at day end to track over/short.')}</div></div>
    </div>`;
  }

  /* ============================================================ REPORTS */
  function reportRange(){
    const rs = state.reports;
    if (rs.from && rs.to){
      const f=new Date(rs.from); f.setHours(0,0,0,0);
      const to=new Date(rs.to); to.setHours(23,59,59,999);
      const fromTs=f.getTime(), toTs=to.getTime();
      return { custom:true, fromTs, toTs, spanDays:Math.max(1,Math.round((toTs-fromTs)/86400000)+1), label:Store.dateFmt(fromTs)+' – '+Store.dateFmt(toTs) };
    }
    const toTs=Date.now(); return { custom:false, fromTs:toTs-rs.range*86400000, toTs, spanDays:rs.range, label:'Last '+rs.range+' days' };
  }

  function viewReports(){
    const rs = state.reports;
    const rr = reportRange();
    const sales = Store.salesBetween(rr.fromTs, rr.toTs);
    const realSales = sales.filter(s=>s.type!=='return');
    const refunds = sales.filter(s=>s.type==='return');
    const refundTotal = refunds.reduce((a,s)=>a+Math.abs(s.total||0),0);
    const rev = Store.revenue(sales);               // net of refunds
    const profit = sales.reduce((a,s)=>a+Store.profitOfSale(s),0);
    const orders = realSales.length;
    const avg = orders? rev/orders : 0;
    const margin = rev>0 ? (profit/rev*100) : 0;

    // daily trend (capped buckets so a long custom range stays readable)
    const days=[];
    const dayCount = Math.min(rr.spanDays, 120);
    const endDay=new Date(rr.toTs); endDay.setHours(0,0,0,0);
    for(let i=dayCount-1;i>=0;i--){ const d=new Date(endDay); d.setDate(d.getDate()-i);
      const r=Store.revenue(Store.salesBetween(d.getTime(),d.getTime()+86399999));
      days.push({label:d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}),value:+r.toFixed(2)}); }

    // top products by revenue (net)
    const prodRev={};
    sales.forEach(s=>s.items.forEach(it=>{ prodRev[it.name]=(prodRev[it.name]||0)+it.total; }));
    const topRev=Object.entries(prodRev).map(([name,v])=>({label:name.length>14?name.slice(0,13)+'…':name,value:+v.toFixed(2)})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value).slice(0,6);

    // payment breakdown (by order count, real sales)
    const payCount={};
    realSales.forEach(s=>{ payCount[s.paymentMethod]=(payCount[s.paymentMethod]||0)+1; });
    const payData=Object.entries(payCount).map(([label,value])=>({label,value}));

    // category revenue
    const meds=Store.all('medicines');
    const catRev={};
    sales.forEach(s=>s.items.forEach(it=>{ const m=meds.find(x=>x.id===it.medicineId); const cat=m?m.category:'Other'; catRev[cat]=(catRev[cat]||0)+it.total; }));
    const catData=Object.entries(catRev).map(([label,value])=>({label,value})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);

    // per-cashier performance
    const byCashier={};
    sales.forEach(s=>{ const k=s.cashier||'—'; if(!byCashier[k]) byCashier[k]={name:k,orders:0,revenue:0,refunds:0};
      if(s.type==='return') byCashier[k].refunds+=Math.abs(s.total||0); else byCashier[k].orders++;
      byCashier[k].revenue+=(s.total||0); });
    const cashierRows=Object.values(byCashier).sort((a,b)=>b.revenue-a.revenue);

    return `
    <div class="toolbar">
      <div class="chip-row">
        ${[7,30,90].map(r=>`<button class="chip ${!rr.custom&&rs.range===r?'active':''}" data-action="rep-range" data-r="${r}">Last ${r} days</button>`).join('')}
      </div>
      <div class="rep-dates">
        <input type="date" id="rep-from" value="${rs.from||''}" aria-label="From"/>
        <span class="muted">→</span>
        <input type="date" id="rep-to" value="${rs.to||''}" aria-label="To"/>
        <button class="btn btn-secondary btn-sm" data-action="rep-apply">${t('Apply')}</button>
        ${rr.custom?`<button class="btn btn-ghost btn-sm" data-action="rep-clear">${t('Clear')}</button>`:''}
      </div>
      <span style="flex:1"></span>
      <button class="btn btn-secondary" data-action="print-zreport">${icon('print')} Z-Report</button>
      <button class="btn btn-secondary" data-action="export-sales">${icon('download')} Export CSV</button>
    </div>
    <div class="rep-period muted">${icon('calendar')} <span>${rr.label}</span></div>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico teal">${icon('dollar')}</div></div><div class="kpi-label">Net Revenue</div><div class="kpi-value">${money(rev)}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico green">${icon('trendUp')}</div></div><div class="kpi-label">Gross Profit</div><div class="kpi-value">${money(profit)}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico violet">${icon('chart')}</div></div><div class="kpi-label">Profit Margin</div><div class="kpi-value">${margin.toFixed(1)}%</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico indigo">${icon('cart')}</div></div><div class="kpi-label">Orders</div><div class="kpi-value">${num(orders)}</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-ico blue">${icon('receipt')}</div></div><div class="kpi-label">Avg. Order Value</div><div class="kpi-value">${money(avg)}</div></div>
      ${refundTotal>0?`<div class="kpi"><div class="kpi-top"><div class="kpi-ico red">${icon('undo')}</div></div><div class="kpi-label">Refunds</div><div class="kpi-value">${money(refundTotal)}</div><div class="kpi-sub muted">${refunds.length} returned</div></div>`:''}
    </div>
    <div class="card" style="margin-bottom:18px">
      <div class="card-head">${icon('chart')}<h3>Revenue Trend</h3></div>
      <div class="card-body">${Charts.line(days,{valueFmt:(v)=>Store.getSettings().currency+v})}</div>
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-head">${icon('trendUp')}<h3>Top Products by Revenue</h3></div>
        <div class="card-body">${topRev.length?Charts.bars(topRev,{valueFmt:(v)=>Store.getSettings().currency+v}):emptyState('box','No sales','No sales in this period.')}</div></div>
      <div class="card"><div class="card-head">${icon('dollar')}<h3>Payment Methods</h3></div>
        <div class="card-body">${payData.length?Charts.donut(payData):emptyState('dollar','No data','')}</div></div>
    </div>
    <div class="grid-2" style="margin-top:18px">
      <div class="card"><div class="card-head">${icon('grid')}<h3>Revenue by Category</h3></div>
        <div class="card-body" style="padding:16px 20px">${catData.length?catData.map(c=>{
          const max=Math.max(...catData.map(x=>x.value)); return `<div style="margin-bottom:13px">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px"><span style="font-weight:600">${esc(c.label)}</span><span class="muted">${money(c.value)}</span></div>
            <div class="bar-track"><div class="bar-fill" style="width:${(c.value/max*100).toFixed(0)}%"></div></div></div>`;
        }).join(''):emptyState('grid','No data','')}</div></div>
      <div class="card"><div class="card-head">${icon('alert')}<h3>Needs Attention</h3></div>
        <div class="card-body" style="padding:16px 20px">
          <div class="stat-inline" style="margin-bottom:16px">
            <div class="si"><div class="si-label">Low stock items</div><div class="si-value" style="color:var(--warning)">${Store.lowStockItems().length}</div></div>
            <div class="si"><div class="si-label">Expiring soon</div><div class="si-value" style="color:var(--danger)">${Store.expiringItems().length}</div></div>
            <div class="si"><div class="si-label">Out of stock</div><div class="si-value">${Store.all('medicines').filter(m=>m.quantity<=0).length}</div></div>
          </div>
          <a href="#/inventory" class="btn btn-secondary btn-block">${icon('pill')} Manage Inventory</a>
        </div></div>
    </div>
    <div class="card" style="margin-top:18px">
      <div class="card-head">${icon('users')}<h3>Sales by Cashier</h3><span class="spacer"></span>
        <span class="badge gray">${cashierRows.length} ${cashierRows.length===1?'person':'people'}</span></div>
      <div class="card-body" style="padding:0">
        ${cashierRows.length ? `<div class="table-wrap"><table class="data">
          <thead><tr><th>Cashier</th><th class="t-right">Orders</th><th class="t-right">Refunds</th><th class="t-right">Net Sales</th></tr></thead>
          <tbody>${cashierRows.map(c=>`<tr>
            <td><div style="display:flex;align-items:center;gap:10px"><span class="avatar" style="background:${avatarColor(c.name)}">${initials(c.name)}</span><span class="cell-main">${esc(c.name)}</span></div></td>
            <td class="t-right">${num(c.orders)}</td>
            <td class="t-right">${c.refunds?`<span style="color:var(--danger)">-${money(c.refunds)}</span>`:'—'}</td>
            <td class="t-right"><strong>${money(c.revenue)}</strong></td></tr>`).join('')}</tbody></table></div>`
        : emptyState('users','No sales','No cashier activity in this period.')}
      </div>
    </div>`;
  }

  /* ============================================================ SETTINGS */
  function viewSettings(){
    const s = Store.getSettings();
    const users = Store.getUsers();
    const usage = Store.storageUsage();
    const bill = Store.myBilling();
    const admin = isAdminRole(); // non-admin staff only see the Security (change password) card
    const p = Store.getMyPharmacy() || {};
    const sub = p.subscription || {};
    const planKey = (p.plan||'free');
    const planLabel = (Store.getConfig().plans[planKey]||{}).label || (planKey.charAt(0).toUpperCase()+planKey.slice(1));
    const fee = money(sub.amount || Store.getConfig().billing.defaultMonthlyFee);
    // consistent professional card header: colored icon tile + title + subtitle
    const head = (ic, title, sub2, accent, extra='') => `<div class="card-head pro">
        <div class="set-ico ${accent}">${icon(ic)}</div>
        <div class="set-htext"><h3>${title}</h3>${sub2?`<p>${sub2}</p>`:''}</div>
        ${extra?`<span class="spacer"></span>${extra}`:''}</div>`;
    return `<div class="settings-page">
      <!-- HERO -->
      <div class="settings-hero">
        <div class="sh-avatar">${initials(s.pharmacyName)}</div>
        <div class="sh-info">
          <h2>${esc(s.pharmacyName)}</h2>
          <div class="sh-meta">${icon('pin')}<span>${esc(s.address||'—')}</span><span class="sh-dot">·</span>${icon('phone')}<span>${esc(s.phone||'—')}</span></div>
        </div>
        <div class="sh-badges">
          <span class="plan-pill plan-${planKey}">${icon('tag')} ${esc(planLabel)} ${t('Plan')}</span>
          ${billBadge(bill)}
          <div class="sh-fee">${fee} <span>/ ${t('month')}</span></div>
        </div>
      </div>

      <div class="settings-grid">
      ${admin ? `<div class="set-card">${head('settings','Pharmacy Profile',t('Details shown on receipts'),'teal')}
        <div class="card-body"><form id="settings-form" style="display:flex;flex-direction:column;gap:14px">
          <label class="field"><span class="field-label">Pharmacy Name</span><input name="pharmacyName" value="${esc(s.pharmacyName)}"/></label>
          <label class="field"><span class="field-label">Address</span><input name="address" value="${esc(s.address)}"/></label>
          <div class="form-grid">
            <label class="field"><span class="field-label">Phone</span><input name="phone" value="${esc(s.phone)}"/></label>
            <label class="field"><span class="field-label">Email</span><input name="email" value="${esc(s.email)}"/></label>
          </div>
          <label class="field"><span class="field-label">Receipt Footer Note</span><input name="footerNote" value="${esc(s.footerNote)}"/></label>
          <button class="btn btn-primary" type="submit">${icon('save')} Save Profile</button>
        </form></div></div>

      <div class="set-card">${head('dollar','Sales Configuration',t('Currency, tax & stock alerts'),'indigo')}
        <div class="card-body"><form id="config-form" style="display:flex;flex-direction:column;gap:14px">
          <div class="form-grid">
            <label class="field"><span class="field-label">Currency Symbol</span><input name="currency" value="${esc(s.currency)}"/></label>
            <label class="field"><span class="field-label">Symbol Position</span><select name="currencyPos"><option value="before" ${s.currencyPos==='before'?'selected':''}>Before ($100)</option><option value="after" ${s.currencyPos==='after'?'selected':''}>After (100 Sh)</option></select></label>
          </div>
          <label class="field"><span class="field-label">Tax Rate (%)</span><input name="taxRate" type="number" step="0.1" min="0" value="${s.taxRate}"/></label>
          <div class="form-grid">
            <label class="field"><span class="field-label">Low Stock Threshold</span><input name="lowStockThreshold" type="number" min="0" value="${s.lowStockThreshold}"/></label>
            <label class="field"><span class="field-label">Expiry Warning (days)</span><input name="expiryWarningDays" type="number" min="0" value="${s.expiryWarningDays}"/></label>
          </div>
          <button class="btn btn-primary" type="submit">${icon('save')} Save Configuration</button>
        </form></div></div>

      <div class="set-card">${head('print','Receipt & Printing',t('Invoice format, size & logo'),'teal')}
        <div class="card-body"><form id="receipt-form" style="display:flex;flex-direction:column;gap:14px">
          <div class="form-grid">
            <label class="field"><span class="field-label">${t('Invoice Prefix')}</span><input name="invoicePrefix" value="${esc(s.invoicePrefix||'INV')}" maxlength="6" placeholder="INV"/><span class="field-hint">${t('e.g. INV → INV-00001')}</span></label>
            <label class="field"><span class="field-label">${t('Receipt Size')}</span><select name="receiptWidth">
              <option value="80" ${s.receiptWidth==='80'?'selected':''}>${t('Thermal 80mm')}</option>
              <option value="58" ${s.receiptWidth==='58'?'selected':''}>${t('Thermal 58mm')}</option>
              <option value="a5" ${s.receiptWidth==='a5'?'selected':''}>${t('A5 framed card')}</option>
            </select></label>
          </div>
          <div class="field"><span class="field-label">${t('Pharmacy Logo')}</span>
            <div class="logo-uploader">
              <div class="logo-preview">${s.logo?`<img src="${s.logo}" alt="logo"/>`:icon('image')}</div>
              <div class="logo-actions">
                <label class="btn btn-secondary btn-sm logo-pick">${icon('upload')} ${s.logo?t('Change'):t('Upload')}<input type="file" id="logo-input" accept="image/png,image/jpeg,image/webp" hidden></label>
                ${s.logo?`<button type="button" class="btn btn-ghost btn-sm" data-action="remove-logo">${icon('trash')} ${t('Remove')}</button>`:''}
                <span class="field-hint">${t('PNG/JPG shown on receipts. Keep it small (≤ 250 KB).')}</span>
              </div>
            </div>
          </div>
          <button class="btn btn-primary" type="submit">${icon('save')} ${t('Save Receipt Settings')}</button>
        </form></div></div>

      <div class="set-card">${head('users','Staff Accounts',t('People with access'),'violet',
          Store.isCloud()&&Store.featureEnabled('staff')?`<button class="btn btn-soft btn-sm" data-action="add-staff">${icon('plus')} Add Staff</button>`:'')}
        <div class="card-body" style="padding:8px 20px"><div class="mini-list">
          ${users.length ? users.map(u=>`<div class="mini-item">
            <span class="avatar" style="background:${avatarColor(u.name)}">${initials(u.name)}</span>
            <div class="mini-main"><div class="mini-title">${esc(u.name)}</div><div class="mini-sub">${esc(u.username?('@'+u.username):(u.email||''))}</div></div>
            <span class="badge ${u.role==='Administrator'?'teal':u.role==='Pharmacist'?'blue':'gray'}">${esc(u.role)}</span></div>`).join('')
          : `<p class="muted" style="padding:14px 0;font-size:13px">No staff yet.</p>`}
        </div></div></div>` : ''}

      ${Store.isCloud() ? `<div class="set-card">${head('lock','Security',t('Account password'),'amber')}
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
          <p class="muted" style="font-size:13px;margin:0">${t('Change your account password. You will need your current password.')}</p>
          <button class="btn btn-secondary" data-action="change-password">${icon('lock')} ${t('Change Password')}</button>
        </div></div>` : ''}

      ${admin ? `<div class="set-card">${head('box','Data Management',t('Backup & restore'),'green')}
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
          <div class="storage-meter"><div class="storage-label"><span>Storage used</span><span>${usage.kb} KB</span></div>
            <div class="storage-bar"><div class="storage-fill" style="width:${usage.pct}%"></div></div></div>
          <button class="btn btn-secondary" data-action="export-data">${icon('download')} Export Backup (JSON)</button>
          <button class="btn btn-secondary" data-action="import-data">${icon('upload')} Import Backup</button>
          <button class="btn btn-soft" data-action="reseed">${icon('refresh')} Reload Demo Data</button>
        </div></div>

      <div class="set-card set-card-wide">${head('dollar','Subscription Agreement',t('Your billing plan'),'teal')}
        <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
          <div class="sub-plan-banner plan-${planKey}">
            <div class="spb-left"><div class="spb-plan">${esc(planLabel)} ${t('Plan')}</div><div class="spb-status">${billBadge(bill)}</div></div>
            <div class="spb-fee">${fee}<span>/ ${t('month')}</span></div>
          </div>
          <div class="sub-stats">
            <div class="sst"><div class="sst-ico">${icon('calendar')}</div><div><div class="si-label">${t('Plan duration')}</div><div class="sst-val">${t('1 Month')}</div></div></div>
            <div class="sst"><div class="sst-ico">${icon('clock')}</div><div><div class="si-label">${t('Grace Period')}</div><div class="sst-val">${t('3 Days')}</div></div></div>
            <div class="sst"><div class="sst-ico">${icon('check')}</div><div><div class="si-label">${t('Paid until')}</div><div class="sst-val">${sub.paidUntil ? Store.dateFmt(sub.paidUntil) : '—'}</div></div></div>
          </div>
          <div class="sub-terms-block">
            <div class="stb-head">${icon('info')}<h4>${t('Agreement Terms & Conditions')}</h4></div>
            <p class="stb-intro">${LANG==='so'
                ? 'Nidaamkani wuxuu ku shaqeeyaa heshiis bille ah. Markaad bixiso lacagta, adeeggu wuxuu bilaabmayaa taariikhdaas wuxuuna soconayaa 1 bil ah. Haddii aad ku bixin weydo lacagta mudadaas, waxaad helaysaa 3 maalmood oo digniin ah (grace period) oo ka muuqanaysa dashboard-ka. Haddii aad muddadaas dhaafto, nidaamka ayaa si toos ah u istaagi doona (lock) ilaa inta aad lacagta ka bixinayso.'
                : 'This system operates on a monthly subscription agreement. Upon payment, the service commences and remains active for exactly 1 month. If payment is not received within this period, a 3-day grace/warning period is granted with dashboard alerts. Exceeding this grace period will cause the system to lock automatically until payment is recorded.'
              }</p>
            <div class="stb-keylabel">${t('Key points')}</div>
            <ul class="stb-list">
              <li><span class="stb-ico teal">${icon('calendar')}</span>
                <div><strong>${t('Monthly billing cycle')}</strong><span>${t('After each payment the service stays fully active for exactly 1 month.')}</span></div></li>
              <li><span class="stb-ico amber">${icon('clock')}</span>
                <div><strong>${t('3-day grace period')}</strong><span>${t('If a payment is late, you get 3 days of dashboard warnings before any restriction.')}</span></div></li>
              <li><span class="stb-ico rose">${icon('lock')}</span>
                <div><strong>${t('Automatic lock')}</strong><span>${t('After the grace period the system locks until the next payment is recorded.')}</span></div></li>
            </ul>
          </div>
        </div></div>

      <div class="set-card danger-zone set-card-wide">${head('alert','Danger Zone',t('Irreversible actions'),'rose')}
        <div class="card-body"><p class="muted" style="margin-bottom:14px;font-size:13px">This permanently deletes all medicines, sales, customers, suppliers and settings.</p>
          <button class="btn btn-danger" data-action="reset-all">${icon('trash')} Erase All Data</button></div></div>` : ''}
      </div>
    </div>`;
  }

  /* ---------- Backup reminder (per-browser) ---------- */
  const BACKUP_KEY = 'pharma_last_backup';
  function markBackupDone(){ try{ localStorage.setItem(BACKUP_KEY, String(Date.now())); }catch(_){} }
  function backupAgeDays(){ try{ const v=localStorage.getItem(BACKUP_KEY); if(!v) return null; return Math.floor((Date.now()-Number(v))/86400000); }catch(_){ return null; } }

  /* ============================================================ ALERTS */
  function updateAlerts(){
    const deynOn = Store.featureEnabled('deyn');
    const debt = deynOn ? Store.debtors().length : 0;
    const count = Store.lowStockItems().length + Store.expiringItems().length + debt;
    const dot = $('#notif-dot'); if(!dot) return;
    dot.hidden = count===0;
    dot.textContent = count>99 ? '99+' : (count||'');
    dot.classList.toggle('count', count>0);
  }
  function openAlerts(){
    const low = Store.lowStockItems(), exp = Store.expiringItems();
    const debtors = Store.featureEnabled('deyn') ? Store.debtors() : [];
    const body = (!low.length && !exp.length && !debtors.length) ? emptyState('check','All clear!','No alerts right now. Your inventory is healthy.') : `
      ${low.length?`<h4 style="font-size:13px;font-weight:700;color:var(--warning);margin-bottom:10px;display:flex;align-items:center;gap:8px">${icon('alert')} Low Stock (${low.length})</h4>
        <div class="mini-list" style="margin-bottom:18px">${low.slice(0,8).map(m=>`<div class="mini-item">
          <div class="mini-ico" style="background:var(--warning-soft);color:var(--warning)">${icon('pill')}</div>
          <div class="mini-main"><div class="mini-title">${esc(m.name)}</div><div class="mini-sub">${esc(m.category)}</div></div>
          <span class="badge ${Store.stockStatus(m).color}">${m.quantity} left</span></div>`).join('')}</div>`:''}
      ${exp.length?`<h4 style="font-size:13px;font-weight:700;color:var(--danger);margin-bottom:10px;display:flex;align-items:center;gap:8px">${icon('clock')} Expiring / Expired (${exp.length})</h4>
        <div class="mini-list">${exp.slice(0,8).map(m=>`<div class="mini-item">
          <div class="mini-ico" style="background:var(--danger-soft);color:var(--danger)">${icon('clock')}</div>
          <div class="mini-main"><div class="mini-title">${esc(m.name)}</div><div class="mini-sub">Exp: ${Store.dateFmt(m.expiryDate)}</div></div>
          <span class="badge ${Store.expiryStatus(m).color}">${Store.expiryStatus(m).label}</span></div>`).join('')}</div>`:''}
      ${debtors.length?`<h4 style="font-size:13px;font-weight:700;color:var(--primary-700);margin:18px 0 10px;display:flex;align-items:center;gap:8px">${icon('dollar')} Outstanding Debts (${debtors.length})</h4>
        <div class="mini-list">${debtors.slice(0,8).map(c=>`<div class="mini-item">
          <div class="mini-ico" style="background:var(--primary-50);color:var(--primary-700)">${icon('user')}</div>
          <div class="mini-main"><div class="mini-title">${esc(c.name)}</div><div class="mini-sub">${c.phone?esc(c.phone):'—'}</div></div>
          <span class="badge amber">${money(c.balance)}</span></div>`).join('')}</div>`:''}`;
    modal({ title:'Notifications & Alerts', size:'sm', icon:'alert', body,
      footer:`<button class="btn btn-secondary" data-modal-close>Close</button>${debtors.length&&!low.length&&!exp.length?`<a href="#/deyn" class="btn btn-primary" data-modal-close>${icon('dollar')} Go to Deyn</a>`:`<a href="#/inventory" class="btn btn-primary" data-modal-close>${icon('pill')} Go to Inventory</a>`}` });
  }

  /* ============================================================ CSV EXPORT */
  function downloadFile(filename, content, type='text/plain'){
    const blob = new Blob([content], {type}); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
  }
  function exportInventoryCSV(){
    const meds = Store.all('medicines');
    const head = ['Name','Generic','Category','Barcode','Batch','Quantity','Unit','CostPrice','SellPrice','Expiry','ReorderLevel','Location'];
    const rows = meds.map(m=>[m.name,m.genericName,m.category,m.barcode,m.batchNo,m.quantity,m.unit,m.costPrice,m.sellPrice,m.expiryDate,m.reorderLevel,m.location]);
    const csv = [head, ...rows].map(r=>r.map(c=>`"${String(c==null?'':c).replace(/"/g,'""')}"`).join(',')).join('\n');
    downloadFile('inventory.csv', csv, 'text/csv'); toast('Inventory exported.','success');
  }
  function exportSalesCSV(){
    const sales = Store.all('sales');
    const head = ['Invoice','Date','Customer','Items','Cashier','Payment','Subtotal','Discount','Tax','Total'];
    const rows = sales.map(s=>{ const c=Store.find('customers',s.customerId);
      return [s.invoiceNo, new Date(s.date).toISOString(), c?c.name:'Walk-in', s.items.reduce((a,i)=>a+i.qty,0), s.cashier, s.paymentMethod, s.subtotal, s.discount, s.tax, s.total]; });
    const csv = [head, ...rows].map(r=>r.map(c=>`"${String(c==null?'':c).replace(/"/g,'""')}"`).join(',')).join('\n');
    downloadFile('sales.csv', csv, 'text/csv'); toast('Sales exported.','success');
  }

  /* ============================================================ GLOBAL EVENTS */
  function updateStorageMeter(){
    const u = Store.storageUsage();
    $('#storage-pct').textContent = u.kb+' KB';
    $('#storage-fill').style.width = Math.max(3,u.pct)+'%';
  }

  function wireGlobal(){
    // theme toggle persists; close dropdowns on outside click
    document.addEventListener('click', (e) => {
      const actEl = e.target.closest('[data-action]');
      // close user dropdown if clicking outside
      if (!e.target.closest('#user-menu')) $('#user-dropdown').hidden = true;
      // modal overlay click closes
      if (e.target.hasAttribute('data-modal-overlay')) { closeModal(); return; }
      if (e.target.closest('[data-modal-close]')) { closeModal(); }

      const authLink = e.target.closest('[data-auth]');
      if (authLink){ e.preventDefault(); renderAuth(authLink.dataset.auth); return; }

      if (!actEl) return;
      const action = actEl.dataset.action;
      const id = actEl.dataset.id;
      handleAction(action, id, actEl, e);
    });
  }

  const READONLY_BLOCKED = new Set(['add-medicine','edit-medicine','delete-medicine','checkout','pos-add','cart-inc','cart-dec','cart-remove','clear-cart','add-customer','edit-customer','delete-customer','add-supplier','edit-supplier','delete-supplier','add-purchase','pl-add','delete-purchase','delete-sale','refund-sale','adjust-stock','reorder-po','add-staff','record-payment','import-data','reseed','reset-all',
    'new-lab-order','edit-lab-order','lab-results','delete-lab-order','add-lab-test','edit-lab-test','delete-lab-test','lab-test-pick']);
  function handleAction(action, id, el, e){
    if (Store.inSupport() && READONLY_BLOCKED.has(action)){ toast('Read-only support view — changes are disabled here.','warn'); return; }
    switch(action){
      case 'toggle-sidebar': $('#app-shell').classList.toggle('nav-open'); break;
      case 'toggle-theme': {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur==='dark'?'light':'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('pharma_theme', next);
        if (Store.session()) render(); // re-render charts with new colors
        break;
      }
      case 'toggle-lang': setLang(LANG==='so'?'en':'so'); break;
      case 'toggle-user-menu': { const d=$('#user-dropdown'); d.hidden=!d.hidden; e.stopPropagation(); break; }
      case 'logout': confirmDialog({ title:'Log out?', message:'You will need to sign in again.', confirmText:'Log out', danger:false,
        onConfirm: async ()=>{ if(Store.isCloud()){ try{ await Cloud.logout(); }catch(err){} } Store.logout(); renderAuth('login'); } }); break;
      case 'add-staff': { const lim=Store.planLimits().maxStaff;
        if(Store.getUsers().length>=lim){ toast(`Staff limit reached for your plan (${lim}). Upgrade to add more.`,'warn'); break; }
        openStaffModal(); break; }
      case 'open-alerts': isSuper() ? (location.hash = '#/pending') : openAlerts(); break;

      /* ---- Platform (super-admin) ---- */
      case 'approve-pharmacy': Store.platform.setStatus(id,'active'); toast('Pharmacy approved & activated.','success'); break;
      case 'activate-pharmacy': Store.platform.setStatus(id,'active'); toast('Pharmacy reactivated.','success'); break;
      case 'reject-pharmacy': confirmDialog({ title:'Reject this pharmacy?', message:'The owner will see that their registration was not approved.', confirmText:'Reject',
        onConfirm:()=>{ Store.platform.setStatus(id,'rejected'); toast('Pharmacy rejected.','success'); } }); break;
      case 'suspend-pharmacy': confirmDialog({ title:'Suspend this pharmacy?', message:'All its staff will lose access until you reactivate it.', confirmText:'Suspend',
        onConfirm:()=>{ Store.platform.setStatus(id,'suspended'); toast('Pharmacy suspended.','success'); } }); break;
      case 'set-plan-pro': Store.platform.setPlan(id,'pro'); toast('Upgraded to Pro.','success'); break;
      case 'set-plan-free': Store.platform.setPlan(id,'free'); toast('Changed to Free plan.','success'); break;
      case 'delete-pharmacy': { const p=Store.platform.pharmacies().find(x=>x.id===id);
        confirmDialog({ title:'Delete pharmacy?', message:`"${p?p.name:'This pharmacy'}" and ALL of its data (inventory, sales, staff) will be permanently removed. This cannot be undone.`, confirmText:'Delete everything',
          onConfirm: async ()=>{ try{ await Store.platform.remove(id); toast('Pharmacy deleted.','success'); if(route().startsWith('pharmacy/')) location.hash='#/pharmacies'; }catch(e){ toast(e.message||'Failed.','error'); } } }); break; }
      case 'create-pharmacy': openCreatePharmacyModal(); break;
      case 'record-subscription': openSubscriptionModal(id); break;
      case 'edit-pharmacy': openEditPharmacyModal(id); break;
      case 'message-pharmacy': openSendMessageModal(id); break;
      case 'clear-error': Store.platform.clearError(id); break;
      case 'clear-all-errors': { const errs=Store.platform.errors();
        confirmDialog({ title:'Clear all error reports?', message:`All ${errs.length} report(s) will be permanently removed.`, confirmText:'Clear All', danger:true,
          onConfirm: async ()=>{ for(const e of errs.slice()){ try{ await Store.platform.clearError(e.id); }catch(_){} } toast('Error reports cleared.','success'); render(); } }); break; }
      case 'reset-pw': { const email=el.dataset.email; if(!email){ toast('No email on file.','warn'); break; }
        if(!Store.isCloud()){ toast('Password reset works in Cloud mode.','warn'); break; }
        confirmDialog({ title:'Send password reset?', message:`A reset email will be sent to ${email}.`, confirmText:'Send reset', danger:false,
          onConfirm: async ()=>{ try{ await Store.platform.resetPassword(email); toast('Reset email sent to '+email,'success'); }catch(err){ toast(friendlyAuthError(err),'error'); } } }); break; }
      case 'impersonate': enterSupportMode(id); break;
      case 'exit-support': Store.exitSupport(); if(Store.isCloud()){ Cloud.listenPlatform((n,d)=>Store.applyPlatformData(n,d)); } location.hash='#/pharmacies'; render(); break;

      case 'add-medicine': { const lim=Store.planLimits().maxProducts;
        if(Store.all('medicines').length>=lim){ toast(`Product limit reached for your plan (${lim}). Upgrade to add more.`,'warn'); break; }
        openMedicineModal(); break; }
      case 'edit-medicine': openMedicineModal(Store.find('medicines', id)); break;
      case 'adjust-stock': openStockAdjustModal(id); break;
      case 'stock-log': openStockLogModal(); break;
      case 'reorder-list': openReorderModal(); break;
      case 'reorder-po': { const items=Store.lowStockItems().filter(m=>(m.supplierId||'')===id)
          .map(m=>({ medicineId:m.id, name:m.name, qty:suggestReorderQty(m), cost:Number(m.costPrice)||0 }));
        closeModal(); openPurchaseModal(items, id); break; }
      case 'open-catalog': { const lim=Store.planLimits().maxProducts;
        if(Store.all('medicines').length>=lim){ toast(`Product limit reached for your plan (${lim}). Upgrade to add more.`,'warn'); break; }
        openCatalogModal(); break; }
      case 'catalog-pick': { const name=el.dataset.name; const c=Store.CATALOG.find(x=>x.name===name);
        if(!c) break; closeModal();
        openMedicineModal({ name:c.name, genericName:c.genericName, category:c.category }); break; }
      case 'delete-medicine': { const m=Store.find('medicines',id);
        confirmDialog({ title:'Delete medicine?', message:`"${m.name}" will be permanently removed from inventory.`,
          onConfirm:()=>{ Store.remove('medicines',id); toast('Medicine deleted.','success'); render(); } }); break; }
      case 'export-inventory': exportInventoryCSV(); break;
      case 'print-receipt': printReceipt(Store.find('sales', id)); break;
      case 'change-password': openChangePasswordModal(); break;
      case 'cc-shift': state.cc.shift = el.dataset.shift; render(); break;

      case 'new-lab-order': { if(!Store.featureEnabled('lab')){ toast('Laboratory is not enabled for your plan.','warn'); break; } openLabOrderModal(); break; }
      case 'edit-lab-order': openLabOrderModal(Store.find('laborders', id)); break;
      case 'lab-results': openLabResultsModal(Store.find('laborders', id)); break;
      case 'print-lab': printLabReport(Store.find('laborders', id)); break;
      case 'view-lab': openLabView(Store.find('laborders', id)); break;
      case 'delete-lab-order': { const o=Store.find('laborders',id);
        confirmDialog({ title:'Delete lab order?', message:`"${o.orderNo}" will be permanently removed.`,
          onConfirm:()=>{ Store.remove('laborders',id); toast('Lab order deleted.','success'); render(); } }); break; }
      case 'manage-lab-tests': openLabTestsModal(); break;
      case 'add-lab-test': openLabTestModal(); break;
      case 'edit-lab-test': openLabTestModal(Store.find('labtests', id)); break;
      case 'delete-lab-test': { const x=Store.find('labtests',id);
        confirmDialog({ title:'Delete test?', message:`"${x.name}" will be removed from the catalog.`,
          onConfirm:()=>{ Store.remove('labtests',id); toast('Test deleted.','success'); openLabTestsModal(); } }); break; }
      case 'lab-test-from-catalog': openLabTestCatalogPicker(); break;
      case 'lab-test-pick': { const code=el.dataset.code, name=el.dataset.name;
        const c=Store.LAB_CATALOG.find(x=>(code&&x.code===code)||x.name===name); if(!c) break;
        closeModal(); openLabTestModal({ name:c.name, code:c.code, category:c.category, sampleType:c.sampleType, refRange:c.refRange, unit:c.unit,
          components: c.components ? c.components.map(cc=>({ ...cc })) : undefined }); break; }

      case 'pos-add': { const m=Store.find('medicines',id); const c=state.pos.cart.find(x=>x.id===id);
        const inCart=c?c.qty:0; if(inCart>=m.quantity){ toast('No more stock available.','warn'); break; }
        if(c) c.qty++; else state.pos.cart.push({id:m.id,name:m.name,price:m.sellPrice,cost:m.costPrice,qty:1}); posRefresh(); break; }
      case 'cart-inc': { const m=Store.find('medicines',id); const c=state.pos.cart.find(x=>x.id===id);
        if(c){ if(c.qty>=m.quantity){toast('Reached available stock.','warn');break;} c.qty++; posRefresh(); } break; }
      case 'cart-dec': { const c=state.pos.cart.find(x=>x.id===id); if(c){ c.qty--; if(c.qty<=0) state.pos.cart=state.pos.cart.filter(x=>x.id!==id); posRefresh(); } break; }
      case 'cart-remove': state.pos.cart=state.pos.cart.filter(x=>x.id!==id); posRefresh(); break;
      case 'clear-cart': state.pos.cart=[]; state.pos.discount=0; posRefresh(); break;
      case 'pos-cat': state.pos.category=el.dataset.cat; render(); break;
      case 'checkout': doCheckout(); break;

      case 'view-sale': { const s=Store.find('sales',id); showReceipt(s); break; }
      case 'refund-sale': openRefundModal(Store.find('sales', id)); break;
      case 'delete-sale': confirmDialog({ title:'Delete sale?', message:'This removes the transaction record (stock is not restored).',
        onConfirm:()=>{ Store.remove('sales',id); toast('Sale deleted.','success'); render(); } }); break;

      case 'record-payment': openPaymentModal(id); break;
      case 'view-ledger': openLedgerModal(id); break;

      case 'add-customer': openCustomerModal(); break;
      case 'edit-customer': openCustomerModal(Store.find('customers',id)); break;
      case 'delete-customer': confirmDialog({ title:'Delete customer?', message:'This customer will be removed.',
        onConfirm:()=>{ Store.remove('customers',id); toast('Customer deleted.','success'); render(); } }); break;

      case 'add-supplier': openSupplierModal(); break;
      case 'edit-supplier': openSupplierModal(Store.find('suppliers',id)); break;
      case 'delete-supplier': confirmDialog({ title:'Delete supplier?', message:'This supplier will be removed.',
        onConfirm:()=>{ Store.remove('suppliers',id); toast('Supplier deleted.','success'); render(); } }); break;

      case 'add-purchase': openPurchaseModal(); break;
      case 'pl-add': {
        const sel=$('#pl-med'); const med=Store.find('medicines',sel.value);
        const qty=Math.max(1,Number($('#pl-qty').value)||1); const cost=Math.max(0,Number($('#pl-cost').value)||0);
        purchaseDraft.push({ medicineId:med.id, name:med.name, qty, cost });
        $('#pur-lines').innerHTML=purchaseLines();
        $('#pur-total').textContent=money(purchaseDraft.reduce((a,l)=>a+l.qty*l.cost,0)); break; }
      case 'pl-remove': { purchaseDraft.splice(Number(el.dataset.i),1); $('#pur-lines').innerHTML=purchaseLines();
        $('#pur-total').textContent=money(purchaseDraft.reduce((a,l)=>a+l.qty*l.cost,0)); break; }
      case 'delete-purchase': confirmDialog({ title:'Delete purchase record?', message:'The stock that was added will NOT be reversed.',
        onConfirm:()=>{ Store.remove('purchases',id); toast('Purchase deleted.','success'); render(); } }); break;

      case 'rep-range': state.reports.range=Number(el.dataset.r); state.reports.from=''; state.reports.to=''; render(); break;
      case 'rep-apply': { const f=$('#rep-from'), tt=$('#rep-to'); const fv=f?f.value:'', tv=tt?tt.value:'';
        if(!fv||!tv){ toast('Pick both a start and end date.','warn'); break; }
        if(fv>tv){ toast('Start date must be on or before the end date.','warn'); break; }
        state.reports.from=fv; state.reports.to=tv; render(); break; }
      case 'rep-clear': state.reports.from=''; state.reports.to=''; render(); break;
      case 'print-zreport': { const rr=reportRange(); printZReport(rr.fromTs, rr.toTs, rr.label); break; }
      case 'export-sales': exportSalesCSV(); break;

      case 'remove-logo': Store.saveSettings({ logo:'' }); toast('Logo removed.','success'); render(); break;
      case 'export-data': downloadFile('pharmacare-backup-'+new Date().toISOString().slice(0,10)+'.json', Store.exportData(), 'application/json'); markBackupDone(); toast('Backup downloaded.','success'); break;
      case 'import-data': triggerImport(); break;
      case 'reseed': confirmDialog({ title:'Load demo data?',
        message: Store.isCloud()?'Adds the full demo dataset (incl. sample sales) to your pharmacy.':'This replaces all current data with fresh demo data.', confirmText:'Load Demo',
        onConfirm: async ()=>{
          try {
            if (Store.isCloud()){ await Cloud.bulkLoad(Store.buildSeed()); toast('Demo data loaded.','success'); }
            else { await Store.resetAll(); Store.seed(true); Store.reloadLocalCache(); toast('Demo data loaded.','success'); render(); }
          } catch(err){ toast(err.message||'Failed.','error'); }
        } }); break;
      case 'reset-all': confirmDialog({ title:'Erase ALL data?', message:'This cannot be undone. Every record will be deleted.', confirmText:'Erase Everything',
        onConfirm: async ()=>{
          try {
            if (Store.isCloud()){ await Cloud.wipePharmacy(); toast('All data erased.','success'); }
            else { await Store.resetAll(); Store.seed(true); Store.reloadLocalCache(); toast('All data erased & reset.','success'); location.hash='#/dashboard'; render(); }
          } catch(err){ toast(err.message||'Failed.','error'); }
        } }); break;
    }
  }

  function triggerImport(){
    const inp = document.createElement('input'); inp.type='file'; inp.accept='application/json';
    inp.onchange = () => { const file=inp.files[0]; if(!file) return; const reader=new FileReader();
      reader.onload = async () => { try { await Store.importData(reader.result); toast('Backup imported successfully.','success'); render(); }
        catch(err){ toast('Invalid backup file.','error'); } }; reader.readAsText(file); };
    inp.click();
  }

  /* ---------------- Staff (cloud) ---------------- */
  function openStaffModal(){
    if (!Store.isCloud()){ toast('Staff accounts require Cloud mode.','warn'); return; }
    modal({ title:'Add Staff Member', icon:'user',
      body:`<form id="staff-form" autocomplete="off"><div class="form-grid">
        <label class="field full"><span class="field-label">Full Name *</span><input name="name" required placeholder="e.g. Omar Hassan"/></label>
        <label class="field full"><span class="field-label">Email *</span><input name="email" type="email" required placeholder="staff@email.com"/></label>
        <label class="field"><span class="field-label">Password *</span><input name="password" type="password" minlength="6" required placeholder="At least 6 chars"/></label>
        <label class="field"><span class="field-label">Role *</span><select name="role"><option>Pharmacist</option><option>Cashier</option><option>Administrator</option></select></label>
      </div><p class="muted" style="font-size:12px;margin-top:6px">The new member can sign in immediately with these credentials.</p></form>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary" id="save-staff">${icon('plus')} Add Staff</button>` });
    $('#save-staff').onclick = async () => {
      const f=$('#staff-form'); if(!f.reportValidity()) return;
      const d=Object.fromEntries(new FormData(f).entries());
      const btn=$('#save-staff'); btn.disabled=true; btn.textContent='Adding…';
      try { await Cloud.addStaff(d); closeModal(); toast('Staff member added.','success'); }
      catch(err){ btn.disabled=false; btn.innerHTML=`${icon('plus')} Add Staff`; toast(friendlyAuthError(err),'error'); }
    };
  }

  // Settings form submit (delegated since forms are in views)
  document.addEventListener('submit', (e) => {
    if ((e.target.id==='settings-form'||e.target.id==='config-form'||e.target.id==='receipt-form') && Store.inSupport()){ e.preventDefault(); toast('Read-only support view.','warn'); return; }
    if (e.target.id==='settings-form'){ e.preventDefault();
      Store.saveSettings(Object.fromEntries(new FormData(e.target).entries())); toast('Profile saved.','success'); }
    if (e.target.id==='config-form'){ e.preventDefault();
      const d=Object.fromEntries(new FormData(e.target).entries());
      ['taxRate','lowStockThreshold','expiryWarningDays'].forEach(k=>d[k]=Number(d[k]||0));
      Store.saveSettings(d); toast('Configuration saved.','success'); render(); }
    if (e.target.id==='receipt-form'){ e.preventDefault();
      const d=Object.fromEntries(new FormData(e.target).entries());
      d.invoicePrefix = (d.invoicePrefix||'INV').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6) || 'INV';
      Store.saveSettings(d); toast('Receipt settings saved.','success'); }
  });

  // Pharmacy logo upload (read a small image to a data-URL stored in settings)
  document.addEventListener('change', (e)=>{
    if (e.target.id!=='logo-input') return;
    if (Store.inSupport()){ toast('Read-only support view.','warn'); e.target.value=''; return; }
    const file = e.target.files && e.target.files[0]; if(!file) return;
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)){ toast('Use a PNG, JPG or WebP image.','warn'); e.target.value=''; return; }
    if(file.size > 250*1024){ toast('Logo is too large (max 250 KB). Please resize it.','warn'); e.target.value=''; return; }
    const reader = new FileReader();
    reader.onload = () => { Store.saveSettings({ logo: reader.result }); toast('Logo updated.','success'); render(); };
    reader.onerror = () => toast('Could not read that image.','error');
    reader.readAsDataURL(file);
  });

  // global topbar search -> inventory
  document.addEventListener('input', (e)=>{
    if (e.target.id==='global-search'){ const v=e.target.value; if(route()!=='inventory'){ if(v){ state.inv.search=v; location.hash='#/inventory'; } }
      else { state.inv.search=v; const r=$('#inv-results'); const si=$('#inv-search'); if(si) si.value=v; if(r) r.innerHTML=inventoryRows(); } }
  });

  /* ---------------- Boot ---------------- */
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
