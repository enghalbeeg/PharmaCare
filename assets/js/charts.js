/* ============================================================
   PharmaCare — Lightweight SVG Charts (offline, no deps)
   ============================================================ */
const Charts = (() => {

  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ---------- Area / Line chart ---------- */
  function line(data, { height=240, valueFmt=(v)=>v } = {}){
    if (!data.length) return '<div class="empty" style="padding:40px">No data</div>';
    const W = 720, H = height, pad = { l:48, r:16, t:16, b:30 };
    const max = Math.max(...data.map(d=>d.value), 1) * 1.15;
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const x = (i) => pad.l + (data.length===1 ? iw/2 : (i/(data.length-1))*iw);
    const y = (v) => pad.t + ih - (v/max)*ih;
    const pts = data.map((d,i)=>[x(i), y(d.value)]);
    const linePath = pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    const areaPath = linePath + ` L ${pts[pts.length-1][0].toFixed(1)} ${pad.t+ih} L ${pts[0][0].toFixed(1)} ${pad.t+ih} Z`;
    const primary = cssVar('--primary') || '#0d9488';
    const grid = cssVar('--border') || '#e2e8f0';
    const txt = cssVar('--text-3') || '#94a3b8';
    // y gridlines
    let gridlines = '';
    for (let g=0; g<=4; g++){ const gy = pad.t + (ih/4)*g; const val = max - (max/4)*g;
      gridlines += `<line x1="${pad.l}" y1="${gy}" x2="${W-pad.r}" y2="${gy}" stroke="${grid}" stroke-width="1"/>
      <text x="${pad.l-8}" y="${gy+4}" text-anchor="end" font-size="10" fill="${txt}">${valueFmt(Math.round(val))}</text>`; }
    // x labels (max ~8)
    const step = Math.ceil(data.length/8);
    let xlabels = '';
    data.forEach((d,i)=>{ if(i%step===0||i===data.length-1) xlabels += `<text x="${x(i)}" y="${H-8}" text-anchor="middle" font-size="10" fill="${txt}">${d.label}</text>`; });
    const dots = pts.map((p,i)=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="${primary}" stroke="var(--surface)" stroke-width="2"><title>${data[i].label}: ${valueFmt(data[i].value)}</title></circle>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block;overflow:visible">
      <defs><linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${primary}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${primary}" stop-opacity="0"/>
      </linearGradient></defs>
      ${gridlines}
      <path d="${areaPath}" fill="url(#areaGrad)"/>
      <path d="${linePath}" fill="none" stroke="${primary}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}${xlabels}
    </svg>`;
  }

  /* ---------- Vertical bar chart ---------- */
  function bars(data, { height=240, valueFmt=(v)=>v, color } = {}){
    if (!data.length) return '<div class="empty" style="padding:40px">No data</div>';
    const W = 720, H = height, pad = { l:48, r:16, t:16, b:34 };
    const max = Math.max(...data.map(d=>d.value), 1) * 1.15;
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const bw = Math.min(46, (iw/data.length) * 0.6);
    const gap = iw/data.length;
    const primary = color || cssVar('--primary') || '#0d9488';
    const accent = cssVar('--accent') || '#6366f1';
    const grid = cssVar('--border'); const txt = cssVar('--text-3');
    let gridlines='';
    for(let g=0;g<=4;g++){ const gy=pad.t+(ih/4)*g; const val=max-(max/4)*g;
      gridlines+=`<line x1="${pad.l}" y1="${gy}" x2="${W-pad.r}" y2="${gy}" stroke="${grid}"/>
      <text x="${pad.l-8}" y="${gy+4}" text-anchor="end" font-size="10" fill="${txt}">${valueFmt(Math.round(val))}</text>`; }
    const rects = data.map((d,i)=>{
      const bh = (d.value/max)*ih; const bx = pad.l + gap*i + (gap-bw)/2; const by = pad.t+ih-bh;
      return `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(bh,0).toFixed(1)}" rx="6" fill="url(#barGrad)"><title>${d.label}: ${valueFmt(d.value)}</title></rect>
      <text x="${(bx+bw/2).toFixed(1)}" y="${H-10}" text-anchor="middle" font-size="10" fill="${txt}">${d.label}</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block">
      <defs><linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${primary}"/><stop offset="100%" stop-color="${accent}" stop-opacity="0.75"/>
      </linearGradient></defs>
      ${gridlines}${rects}
    </svg>`;
  }

  /* ---------- Donut chart ---------- */
  function donut(data, { size=180, thickness=26 } = {}){
    const total = data.reduce((s,d)=>s+d.value,0);
    if (!total) return '<div class="empty" style="padding:30px">No data</div>';
    const palette = ['#0d9488','#6366f1','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#10b981','#ef4444','#3b82f6','#84cc16','#f97316'];
    const r = (size-thickness)/2, cx=size/2, cy=size/2, C=2*Math.PI*r;
    let offset = 0;
    const rings = data.map((d,i)=>{
      const frac = d.value/total; const len = frac*C;
      const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${palette[i%palette.length]}" stroke-width="${thickness}"
        stroke-dasharray="${len.toFixed(2)} ${(C-len).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}"
        transform="rotate(-90 ${cx} ${cy})" stroke-linecap="butt"><title>${d.label}: ${d.value} (${(frac*100).toFixed(0)}%)</title></circle>`;
      offset += len; return seg;
    }).join('');
    const legend = data.map((d,i)=>`<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;margin-bottom:7px">
      <span style="width:10px;height:10px;border-radius:3px;background:${palette[i%palette.length]};flex:none"></span>
      <span style="flex:1;color:var(--text-2)">${UI.esc(d.label)}</span>
      <strong>${d.value}</strong></div>`).join('');
    return `<div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;justify-content:center">
      <div style="position:relative;flex:none">
        <svg viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px;display:block;flex:none">${rings}</svg>
        <div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">
          <div><div style="font-family:var(--font-display);font-size:24px;font-weight:800">${total}</div>
          <div style="font-size:11px;color:var(--text-2)">Total</div></div>
        </div>
      </div>
      <div style="min-width:160px;flex:1">${legend}</div>
    </div>`;
  }

  /* ---------- Sparkline (tiny inline trend, no axes) ---------- */
  function spark(values, { h=34, color } = {}){
    if (!values || values.length < 2) return '';
    const W=120; const max=Math.max(...values), min=Math.min(...values, 0); const rng=(max-min)||1;
    const pts=values.map((v,i)=>[ (i/(values.length-1))*W, h-2-((v-min)/rng)*(h-4) ]);
    const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    const area=d+` L ${W} ${h} L 0 ${h} Z`;
    const c=color||cssVar('--primary')||'#0d9488';
    const gid='spk'+Math.random().toString(36).slice(2,7);
    return `<svg viewBox="0 0 ${W} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="display:block;margin-top:10px;overflow:visible">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".28"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs>
      <path d="${area}" fill="url(#${gid})"/><path d="${d}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  return { line, bars, donut, spark };
})();
