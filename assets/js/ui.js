/* ============================================================
   PharmaCare — UI Helpers (icons, toasts, modals)
   ============================================================ */
const UI = (() => {

  /* ---------- SVG icon library ---------- */
  const ICONS = {
    dashboard:'<path d="M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z"/>',
    pill:'<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
    cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    receipt:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    truck:'<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/>',
    chart:'<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
    plus:'<path d="M5 12h14M12 5v14"/>',
    edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
    trash:'<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>',
    eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    dollar:'<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    box:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
    clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    trendUp:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    trendDown:'<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    print:'<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
    download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>',
    mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    calendar:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    tag:'<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.41 8.41a2 2 0 0 0 2.83 0l7.17-7.17a2 2 0 0 0 0-2.83Z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    package:'<path d="M16.5 9.4 7.5 4.21M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/>',
    user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5"/>',
    filter:'<path d="M22 3H2l8 9.46V19l4 2v-8.54Z"/>',
    barcode:'<path d="M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14"/>',
    grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    flask:'<path d="M9 3h6M10 3v6.5L4.5 19a1 1 0 0 0 .9 1.5h13.2a1 1 0 0 0 .9-1.5L14 9.5V3"/><path d="M7.5 15h9"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    droplet:'<path d="M12 2.5 6.5 9A7 7 0 1 0 18 13.5 7 7 0 0 0 17.5 9Z"/>',
    undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5 5 5 0 0 1-5 5H8"/>',
    adjust:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    image:'<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  };
  const icon = (name, attrs='') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${attrs}>${ICONS[name]||''}</svg>`;
  const iconFill = (name, attrs='') => `<svg viewBox="0 0 24 24" fill="currentColor" ${attrs}>${ICONS[name]||''}</svg>`;

  /* ---------- Escaping ---------- */
  const esc = (s) => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------- Toasts ---------- */
  function toast(message, type='success', title){
    const root = document.getElementById('toast-root');
    const titles = { success:'Success', error:'Error', warn:'Warning', info:'Info' };
    const ic = { success:'check', error:'x', warn:'alert', info:'info' }[type] || 'info';
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.setAttribute('role', type==='error' ? 'alert' : 'status');
    el.setAttribute('aria-live', type==='error' ? 'assertive' : 'polite');
    el.innerHTML = `<div class="toast-ico">${icon(ic)}</div>
      <div class="toast-main"><div class="toast-title">${esc(title||titles[type])}</div><div class="toast-msg">${esc(message)}</div></div>`;
    root.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(()=>el.remove(), 300); }, 3200);
  }

  /* ---------- Modal ---------- */
  let onCloseCb = null;
  let closeTimer = null;
  let lastFocused = null;
  function modal({ title, body, footer, size='', onClose, icon:headIcon }){
    const root = document.getElementById('modal-root');
    if (closeTimer){ clearTimeout(closeTimer); closeTimer = null; } // cancel any pending wipe so a newly opened modal survives
    onCloseCb = onClose || null;
    lastFocused = document.activeElement; // restore focus here when the modal closes (a11y)
    root.innerHTML = `<div class="modal-overlay" data-modal-overlay>
      <div class="modal ${size}" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
        <div class="modal-head">
          ${headIcon ? `<div class="kpi-ico teal" style="width:38px;height:38px;border-radius:10px">${icon(headIcon)}</div>`:''}
          <h3 id="modal-title">${esc(title)}</h3>
          <button class="icon-btn sm" data-modal-close aria-label="Close">${icon('x')}</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-foot">${footer}</div>`:''}
      </div></div>`;
    document.addEventListener('keydown', escClose);
    document.addEventListener('keydown', trapTab);
    // Move focus into the dialog so keyboard/screen-reader users land inside it.
    const dlg = root.querySelector('.modal');
    setTimeout(()=>{ if(!dlg) return; const f = dlg.querySelector('input:not([type=hidden]),select,textarea,button:not([data-modal-close])') || dlg.querySelector('[data-modal-close]') || dlg; try{ f.focus(); }catch(_){} }, 40);
  }
  function focusables(dlg){
    return [...dlg.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null);
  }
  function trapTab(e){
    if(e.key!=='Tab') return;
    const dlg = document.querySelector('#modal-root .modal'); if(!dlg) return;
    const els = focusables(dlg); if(!els.length) return;
    const first=els[0], last=els[els.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
  function closeModal(){
    const root = document.getElementById('modal-root');
    const ov = root.querySelector('.modal-overlay');
    if (ov){ ov.style.animation='fade .15s reverse'; closeTimer = setTimeout(()=>{ root.innerHTML=''; closeTimer=null; }, 130); }
    document.removeEventListener('keydown', escClose);
    document.removeEventListener('keydown', trapTab);
    if (lastFocused && lastFocused.focus){ try{ lastFocused.focus(); }catch(_){} }
    lastFocused = null;
    if (onCloseCb) { const cb = onCloseCb; onCloseCb=null; cb(); }
  }
  function escClose(e){ if(e.key==='Escape') closeModal(); }

  /* ---------- Confirm dialog ---------- */
  function confirm({ title='Are you sure?', message='', confirmText='Confirm', danger=true, onConfirm }){
    modal({
      title, size:'sm', icon: danger?'alert':'info',
      body:`<p style="color:var(--text-2);font-size:14px;line-height:1.6">${esc(message)}</p>`,
      footer:`<button class="btn btn-secondary" data-modal-close>Cancel</button>
        <button class="btn ${danger?'btn-danger':'btn-primary'}" id="confirm-ok">${esc(confirmText)}</button>`
    });
    document.getElementById('confirm-ok').onclick = () => { closeModal(); onConfirm && onConfirm(); };
  }

  /* ---------- Misc helpers ---------- */
  const initials = (name) => (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const avatarColor = (str) => { const colors=['#0d9488','#6366f1','#db2777','#ea580c','#0891b2','#7c3aed','#059669','#d97706']; let h=0; for(const c of (str||'')) h=c.charCodeAt(0)+((h<<5)-h); return colors[Math.abs(h)%colors.length]; };

  function emptyState(iconName, title, msg, actionBtn=''){
    return `<div class="empty"><div class="empty-ico">${icon(iconName)}</div>
      <h4>${esc(title)}</h4><p>${esc(msg)}</p>${actionBtn}</div>`;
  }

  return { ICONS, icon, iconFill, esc, toast, modal, closeModal, confirm, initials, avatarColor, emptyState };
})();
