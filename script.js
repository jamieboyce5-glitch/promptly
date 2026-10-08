/* ── BACKGROUNDS ── */
const BGS = [
  { key:'nature-1', label:'Nature 1', cat:'nature',  url:'images/background-nature-image-1.jpg', thumb:'images/background-nature-image-1.jpg' },
  { key:'nature-2', label:'Nature 2', cat:'nature',  url:'images/background-nature-image-2.jpg', thumb:'images/background-nature-image-2.jpg' },
  { key:'nature-3', label:'Nature 3', cat:'nature',  url:'images/background-nature-image-3.jpg', thumb:'images/background-nature-image-3.jpg' },
  { key:'nature-4', label:'Nature 4', cat:'nature',  url:'images/background-nature-image-4.jpg', thumb:'images/background-nature-image-4.jpg' },
  { key:'nature-5', label:'Nature 5', cat:'nature',  url:'images/background-nature-image-5.jpg', thumb:'images/background-nature-image-5.jpg' },
  { key:'whimsy-1', label:'Whimsy 1', cat:'whimsy',  url:'images/background-whimsy-image-1.jpg', thumb:'images/background-whimsy-image-1.jpg' },
  { key:'whimsy-2', label:'Whimsy 2', cat:'whimsy',  url:'images/background-whimsy-image-2.jpg', thumb:'images/background-whimsy-image-2.jpg' },
  { key:'whimsy-3', label:'Whimsy 3', cat:'whimsy',  url:'images/background-whimsy-image-3.jpg', thumb:'images/background-whimsy-image-3.jpg' },
  { key:'whimsy-4', label:'Whimsy 4', cat:'whimsy',  url:'images/background-whimsy-image-4.jpg', thumb:'images/background-whimsy-image-4.jpg' },
  { key:'whimsy-5', label:'Whimsy 5', cat:'whimsy',  url:'images/background-whimsy-image-5.jpg', thumb:'images/background-whimsy-image-5.jpg' },
  { key:'whimsy-6', label:'Whimsy 6', cat:'whimsy',  url:'images/background-whimsy-image-6.jpg', thumb:'images/background-whimsy-image-6.jpg' },
];
let bgTab = 'nature';

/* ── CONFIG ── */
const CATS = ['Research','Design','Strategy','Delivery','Leadership','Stakeholder','Process','Other'];
const CAT_CLR = { Research:'#f97316', Design:'#8b5cf6', Strategy:'#10b981', Delivery:'#3b82f6', Leadership:'#ec4899', Stakeholder:'#f59e0b', Process:'#6b7280', Other:'#facc15' };
const CAT_LBL = { Research:'Research & discovery', Design:'Design & UX', Strategy:'Strategy & planning', Delivery:'Deliveries & shipped work', Leadership:'Leadership & people', Stakeholder:'Stakeholder engagement', Process:'Process improvements', Other:'Other contributions' };

/* ── STATE ── */
let S = { entries:[], jobs:[], settings:{ jobDescription:'', userName:'', bgKey:'nature-1', currentYear: new Date().getFullYear(), theme:'dark' }, view:'dashboard', timelineLayout:'kanban' };
let editId = null;

function load() {
  try { const d = localStorage.getItem('promptly-v3'); if(d) Object.assign(S, JSON.parse(d)); } catch(e){}
  if(!Array.isArray(S.jobs)) S.jobs = [];
  if(typeof S.settings.userName !== 'string') S.settings.userName = '';
  document.getElementById('yr').value = S.settings.currentYear;
}
function save() { localStorage.setItem('promptly-v3', JSON.stringify(S)); }

/* ── HELPERS ── */
function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2); }
function today() { return new Date().toISOString().split('T')[0]; }
function fmtS(d) { if(!d) return ''; return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'}); }
function ye() { return S.entries.filter(e=>e.date&&new Date(e.date+'T12:00:00').getFullYear()===S.settings.currentYear); }
function byCat(arr) { const m={}; CATS.forEach(c=>m[c]=[]); arr.forEach(e=>{if(m[e.category])m[e.category].push(e);}); return m; }
function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function kw(jd) {
  if(!jd) return [];
  const h=new Set();
  [/user research/gi,/user interview/gi,/usability test/gi,/product strategy/gi,/roadmap/gi,/MVP/gi,
   /stakeholder/gi,/cross.functional/gi,/agile/gi,/sprint/gi,/design system/gi,/prototyp/gi,
   /A\/B test/gi,/metrics/gi,/KPIs?/gi,/OKRs?/gi,/leadership/gi,/mentoring/gi,/coaching/gi,
   /facilitat/gi,/discovery/gi,/insights/gi,/collaboration/gi,/workshop/gi].forEach(p=>{
    (jd.match(p)||[]).forEach(w=>h.add(w.replace(/\./g,' ').trim()));
  });
  return [...h].slice(0,14);
}

/* ── THEME ── */
function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  const sun = document.getElementById('theme-icon-sun');
  const moon = document.getElementById('theme-icon-moon');
  if (sun) sun.style.display = theme === 'light' ? 'none' : 'block';
  if (moon) moon.style.display = theme === 'light' ? 'block' : 'none';
}
function toggleTheme() {
  S.settings.theme = S.settings.theme === 'light' ? 'dark' : 'light';
  applyTheme(S.settings.theme);
  save();
}

/* ── BG ── */
function applyBg(key) {
  const b = BGS.find(x=>x.key===key)||BGS[0];
  document.getElementById('bg').style.backgroundImage = `url('${b.url}')`;
}

/* ── VIEW ── */
function setView(v) {
  S.view = v;
  ['dashboard','timeline','jobs'].forEach(k=>{
    document.getElementById('ibtn-'+k)?.classList.toggle('active', v===k);
  });
  const addBtn = document.getElementById('btn-add');
  if (addBtn) {
    if (v === 'jobs') { addBtn.textContent = '+ Add Job'; addBtn.onclick = () => openAddJob(); }
    else { addBtn.textContent = '+ Add Entry'; addBtn.onclick = () => openAddEntry(); }
  }
  render();
}
function setTimelineLayout(l) {
  S.timelineLayout = l;
  render();
}
function changeYear(y) { S.settings.currentYear=parseInt(y); save(); render(); }

/* ── RENDER ── */
function render() {
  const e = ye();
  const el = document.getElementById('app');
  if(S.view==='dashboard') el.innerHTML = renderDash(e);
  else if(S.view==='jobs') el.innerHTML = renderJobs();
  else el.innerHTML = renderTimeline(e);
}

/* DASHBOARD */
function renderDash(entries) {
  const total=entries.length, high=entries.filter(e=>e.impact==='High').length;
  const cats=byCat(entries);
  const active=CATS.filter(c=>cats[c].length>0).sort((a,b)=>cats[b].length-cats[a].length);
  const maxC=active.length?cats[active[0]].length:1;
  const mCnt={}; entries.forEach(e=>{if(e.date){const m=new Date(e.date+'T12:00:00').getMonth();mCnt[m]=(mCnt[m]||0)+1;}});
  const top=Object.entries(mCnt).sort((a,b)=>b[1]-a[1])[0];
  const mons=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const topM=top?mons[+top[0]]:'—';
  const recent=[...entries].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,6);
  const keywords=kw(S.settings.jobDescription);

  return `<div class="dashboard">
    <div class="fu" style="margin-bottom:4px">
      <div class="dash-heading">${S.settings.currentYear} Overview</div>
      <div class="dash-sub">${total} accomplishment${total!==1?'s':''} logged</div>
    </div>
    ${!S.settings.jobDescription?`<div class="jd-bar fu"><div class="jd-bar-text"><div class="jd-bar-title">Add your job description</div><div class="jd-bar-sub">Promptly surfaces what to evidence for your review</div></div><button class="jd-cta" onclick="openSettings()">Add JD</button></div>`:''}
    <div class="stats-row">
      ${[{l:'Total entries',v:total,s:`${S.settings.currentYear}`},{l:'High impact',v:high,s:`of ${total} total`},{l:'Categories',v:active.length,s:'areas covered'},{l:'Peak month',v:topM,s:top?top[1]+' entries':'no data yet',sm:true}].map(x=>`
        <div class="gp stat-card fu"><div class="stat-lbl">${x.l}</div><div class="stat-val" style="${x.sm?'font-size:32px':''}">${x.v}</div><div class="stat-sub">${x.s}</div></div>
      `).join('')}
    </div>
    ${renderJobSummary()}
    ${total===0?`<div class="gp fu" style="width:100%"><div class="empty"><div class="empty-title">Start tracking your wins</div><div class="empty-desc">Log accomplishments throughout the year — Promptly builds your performance story automatically.</div><button class="empty-btn" onclick="openAddEntry()">+ Add your first entry</button></div></div>`:`
    <div class="two-col">
      <div class="gp panel-inner fu">
        <div class="panel-title">Year in review</div>
        ${active.map(c=>`<div class="sum-row"><span class="sum-label">${CAT_LBL[c]}</span><span class="count-badge">${cats[c].length}</span></div>`).join('')}
        ${high?`<div class="sum-row"><span class="sum-label">High-impact wins</span><span class="count-badge">${high}</span></div>`:''}
      </div>
      <div class="gp panel-inner fu">
        <div class="panel-title">By category</div>
        ${active.map(c=>`<div class="cat-bar"><div class="cat-bar-top"><span class="cat-bar-name">${c}</span><span class="cat-bar-num">${cats[c].length}</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(cats[c].length/maxC*100)}%;background:${CAT_CLR[c]}"></div></div></div>`).join('')}
      </div>
    </div>
    <div class="gp panel-inner fu" style="width:100%">
      <div class="panel-title">Recent entries</div>
      ${recent.map(e=>`<div class="recent-row" onclick="openEditEntry('${e.id}')"><span class="r-date">${fmtS(e.date)}</span><span class="tag tag-${e.impact}">${e.impact}</span><span class="r-title">${e.title}</span>${(e.labels&&e.labels.length)?`<span class="label-pill">${e.labels[0]}</span>`:''}</div>`).join('')}
    </div>
    ${keywords.length?`<div class="gp panel-inner fu" style="width:100%"><div class="panel-title">JD keywords to evidence</div><div class="chip-row">${keywords.map(k=>`<span class="chip">${k}</span>`).join('')}</div></div>`:''}`}
  </div>`;
}

/* BOARD */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function renderTimeline(entries) {
  return renderBoard(entries);
}

function renderBoard(entries) {
  return `<div class="board-wrap">${MONTHS.map((month, idx) => {
    const items = entries
      .filter(e => e.date && new Date(e.date+'T12:00:00').getMonth() === idx)
      .sort((a,b) => (a.date||'').localeCompare(b.date||''));
    const prefill = `${S.settings.currentYear}-${String(idx+1).padStart(2,'0')}-01`;
    return `<div class="board-col">
      <div class="gp col-head">
        <div class="col-head-l"><span class="col-name">${month}</span></div>
        <span class="col-cnt">${items.length}</span>
      </div>
      ${items.map(e=>`
        <div class="gp board-card fu" onclick="openEditEntry('${e.id}')">
          ${(e.images&&e.images.length)?`<img class="bc-img-hero" src="${e.images[0].src}" alt="">`:''}
          <div class="bc-title">${e.title}</div>
          ${e.notes?`<div class="bc-notes">${e.notes}</div>`:''}
          ${(e.labels&&e.labels.length)?`<div class="bc-labels">${e.labels.map(l=>`<span class="label-pill">${l}</span>`).join('')}</div>`:''}
          ${((e.links&&e.links.length)||(e.images&&e.images.length>1))?`<div class="bc-evidence">${e.links?.length?`<span class="ev-ind">${e.links.length} link${e.links.length>1?'s':''}</span>`:''}${e.images?.length>1?`<span class="ev-ind">+${e.images.length-1} more</span>`:''}</div>`:''}
          <div class="bc-foot"><span class="bc-date">${fmtS(e.date)}</span><span class="tag tag-${e.impact}">${e.impact}</span></div>
        </div>`).join('')}
      <div class="add-zone" onclick="openAddEntry(null,'${prefill}')">+ Add entry</div>
    </div>`;
  }).join('')}</div>`;
}

/* LIST */
function renderList(entries) {
  if (!entries.length) return `<div class="list-wrap"><div class="gp" style="width:100%"><div class="empty"><div class="empty-title">No entries for ${S.settings.currentYear}</div><div class="empty-desc">Start logging your accomplishments.</div><button class="empty-btn" onclick="openAddEntry()">+ Add Entry</button></div></div></div>`;

  const byMonth = {};
  entries.forEach(e => {
    if (!e.date) return;
    const m = new Date(e.date+'T12:00:00').getMonth();
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(e);
  });
  const monthIdxs = Object.keys(byMonth).map(Number).sort((a,b) => b-a);

  const header = `<div class="list-head">
    <div class="list-hcell">Date</div>
    <div class="list-hcell">Accomplishment</div>
    <div class="list-hcell">Labels</div>
    <div class="list-hcell">Impact</div>
    <div class="list-hcell">Evidence</div>
    <div></div>
  </div>`;

  const groups = monthIdxs.map(m => {
    const items = byMonth[m].sort((a,b) => (b.date||'').localeCompare(a.date||''));
    return `<div class="gp list-month-group fu">
      <div class="list-month-header">
        <span class="list-month-name">${MONTHS[m]}</span>
        <span class="list-month-count">${items.length}</span>
      </div>
      ${header}
      ${items.map(e => `
        <div class="list-row" onclick="openEditEntry('${e.id}')">
          <div class="l-date">${fmtS(e.date)}</div>
          <div>
            <div class="l-title">${e.title}</div>
            ${e.notes ? `<div class="l-note">${e.notes}</div>` : ''}
          </div>
          <div class="l-labels">
            ${(e.labels&&e.labels.length) ? e.labels.map(l=>`<span class="label-pill">${l}</span>`).join('') : '<span style="font-size:11px;color:var(--text-muted)">—</span>'}
          </div>
          <div><span class="tag tag-${e.impact}">${e.impact}</span></div>
          <div class="l-evidence">
            ${e.links?.length  ? `<span class="l-ev-ind">${e.links.length} link${e.links.length>1?'s':''}</span>` : ''}
            ${e.images?.length ? `<span class="l-ev-ind">${e.images.length} image${e.images.length>1?'s':''}</span>` : ''}
            ${!e.links?.length && !e.images?.length ? '<span style="font-size:11px;color:var(--text-muted)">—</span>' : ''}
          </div>
          <div style="display:flex;align-items:center">
            <button onclick="event.stopPropagation();openEditEntry('${e.id}')" style="width:26px;height:26px;border-radius:6px;background:rgba(255,255,255,.07);border:none;color:rgba(255,255,255,.45);font-size:14px;cursor:pointer">⋯</button>
          </div>
        </div>`).join('')}
    </div>`;
  }).join('');

  return `<div class="list-wrap">${groups}</div>`;
}

/* ── MODAL HELPERS ── */
function openModal(html) { document.getElementById('modal').innerHTML=html; document.getElementById('overlay').classList.add('open'); }
function closeModal() { document.getElementById('overlay').classList.remove('open'); editId=null; }
function handleOverlay(e) { if(e.target===document.getElementById('overlay')) closeModal(); }

/* SETTINGS */
function openSettings() {
  const keywords=kw(S.settings.jobDescription);
  const filtered=BGS.filter(b=>b.cat===bgTab);
  openModal(`
    <div class="m-head"><span class="m-title">Settings</span><button class="m-x" onclick="closeModal()">✕</button></div>
    <div class="m-section">
      <div class="m-section-title">Background</div>
      <div style="display:flex;gap:6px;margin-bottom:14px">
        ${['nature','whimsy'].map(t=>`
          <button onclick="setBgTab('${t}')" class="bg-tab${bgTab===t?' active':''}">${t}</button>
        `).join('')}
      </div>
      <div class="bg-grid">${filtered.map(b=>`
        <div class="bg-thumb ${S.settings.bgKey===b.key?'active':''}" onclick="pickBg('${b.key}')">
          <div class="bg-thumb-img" style="background-image:url('${b.thumb}')"></div>
          ${S.settings.bgKey===b.key?`<div class="bg-check"></div>`:''}
        </div>`).join('')}
      </div>
    </div>
    <div class="m-section">
      <div class="m-section-title">Your name</div>
      <input type="text" class="fi" id="profile-name" value="${esc(S.settings.userName||'')}" placeholder="Used to sign off drafted emails" oninput="S.settings.userName=this.value;save()">
    </div>
    <div class="m-section">
      <div class="m-section-title">Job Description</div>
      <textarea class="fi fi-ta" id="jd-inp" placeholder="Paste your job description to surface key evidence areas for your review...">${esc(S.settings.jobDescription)}</textarea>
      ${keywords.length?`<div class="chip-row">${keywords.map(k=>`<span class="chip">${k}</span>`).join('')}</div>`:''}
      <button class="btn-save-jd" onclick="saveJD()">Save Job Description</button>
    </div>
    <div class="m-section">
      <div class="m-section-title">Data</div>
      <div style="display:flex;gap:8px">
        <button class="btn-action" onclick="exportData()">⤓ Export JSON</button>
        <button onclick="clearAll()" class="btn-clear-all">Clear All</button>
      </div>
      <div class="data-info">${S.entries.length} total entries · ${S.settings.currentYear} selected</div>
    </div>
  `);
}

function setBgTab(tab) { bgTab=tab; openSettings(); }
function pickBg(key) { S.settings.bgKey=key; applyBg(key); save(); openSettings(); }
function saveJD() {
  const el=document.getElementById('jd-inp');
  if(el){ S.settings.jobDescription=el.value; save(); toast('Job description saved'); openSettings(); render(); }
}

/* ENTRY MODAL — labels + evidence state */
let _labels = [];
let _links  = [];
let _images = [];
let _evTab  = 'links';

function _renderEvidence() {
  const el = document.getElementById('ev-area');
  if (!el) return;
  if (_evTab === 'links') {
    el.innerHTML = `
      ${_links.map((l,i) => `
        <div class="ev-link-row">
          <span class="ev-link-icon">↗</span>
          <div class="ev-link-text">
            <div class="ev-link-label">${esc(l.label||l.url)}</div>
            ${l.label?`<div class="ev-link-url">${esc(l.url)}</div>`:''}
          </div>
          <button class="ev-remove" onclick="removeLink(${i})">×</button>
        </div>`).join('')}
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:${_links.length?'8px':'0'}">
        <input class="fi" id="ev-link-url" placeholder="https://..." style="padding:8px 12px;font-size:13px">
        <div style="display:flex;gap:6px">
          <input class="fi" id="ev-link-label" placeholder="Label (optional)" style="padding:8px 12px;font-size:13px;flex:1">
          <button onclick="addLink()" style="padding:8px 16px;border-radius:9px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.15);color:#fff;font-family:Inter,sans-serif;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">Add link</button>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      ${_images.length ? `<div class="ev-img-grid">${_images.map((img,i)=>`
        <div class="ev-img-thumb">
          <img src="${img.src}" alt="${esc(img.name)}">
          <button class="ev-img-rm" onclick="removeImage(${i})">×</button>
        </div>`).join('')}</div>` : ''}
      <div style="display:flex;flex-direction:column;gap:6px">
        <div class="ev-upload" onclick="document.getElementById('ev-file-inp').click()">
          <div style="font-size:20px">📎</div>
          <div class="ev-upload-lbl">Click to upload an image</div>
        </div>
        <input id="ev-file-inp" type="file" accept="image/*" style="display:none" onchange="handleImageUpload(event)">
        <div style="display:flex;gap:6px;align-items:center">
          <div style="flex:1;height:1px;background:rgba(255,255,255,.08)"></div>
          <span style="font-size:11px;color:rgba(255,255,255,.3)">or paste URL</span>
          <div style="flex:1;height:1px;background:rgba(255,255,255,.08)"></div>
        </div>
        <div style="display:flex;gap:6px">
          <input class="fi" id="ev-img-url" placeholder="https://example.com/image.jpg" style="padding:8px 12px;font-size:13px;flex:1">
          <button onclick="addImageUrl()" style="padding:8px 16px;border-radius:9px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.15);color:#fff;font-family:Inter,sans-serif;font-size:12px;font-weight:700;cursor:pointer">Add</button>
        </div>
      </div>`;
  }
}

function setEvTab(t) { _evTab=t; _renderEvTabs(); _renderEvidence(); }
function _renderEvTabs() {
  const tabs = document.getElementById('ev-tabs');
  if (!tabs) return;
  tabs.innerHTML = ['links','images'].map(t=>`<button class="ev-tab${_evTab===t?' on':''}" onclick="setEvTab('${t}')">${t==='links'?'Links':'Images'}</button>`).join('');
}

function addLink() {
  const url = document.getElementById('ev-link-url')?.value.trim();
  const label = document.getElementById('ev-link-label')?.value.trim();
  if (!url) return;
  _links.push({url, label});
  _renderEvidence();
}
function removeLink(i) { _links.splice(i,1); _renderEvidence(); }

function addImageUrl() {
  const url = document.getElementById('ev-img-url')?.value.trim();
  if (!url) return;
  _images.push({name: url.split('/').pop()||'Image', src: url});
  _renderEvidence();
}
function removeImage(i) { _images.splice(i,1); _renderEvidence(); }

function handleImageUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    _images.push({name: file.name, src: ev.target.result});
    _renderEvidence();
  };
  reader.readAsDataURL(file);
}

function _renderLabels() {
  const el = document.getElementById('label-area');
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <input type="text" id="label-input" class="fi" placeholder="Type a label, press Enter to add…" style="padding:8px 12px;font-size:13px" onkeydown="handleLabelKey(event)">
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;min-height:24px">
      ${_labels.map((l,i)=>`<span class="label-pill-edit">${esc(l)}<button onclick="removeLabel(${i})">×</button></span>`).join('')}
    </div>`;
}

function addLabel(text) {
  const t = text.trim();
  if (!t || _labels.includes(t)) return;
  _labels.push(t);
  _renderLabels();
}
function removeLabel(i) { _labels.splice(i,1); _renderLabels(); }
function togglePresetLabel(c) {
  const i = _labels.indexOf(c);
  if (i>=0) _labels.splice(i,1); else _labels.push(c);
  _renderLabels();
}
function handleLabelKey(e) {
  if (e.key==='Enter'||e.key===',') {
    e.preventDefault();
    addLabel(e.target.value);
    e.target.value='';
  }
}

/* ENTRY MODAL */
function openAddEntry(cat=null, prefillDate=null) { editId=null; showEntryModal(null, cat, prefillDate); }
function openEditEntry(id) { editId=id; showEntryModal(S.entries.find(e=>e.id===id), null, null); }

function showEntryModal(e, defaultCat, prefillDate) {
  _labels = e?.labels  ? [...e.labels]  : [];
  _links  = e?.links   ? [...e.links]   : [];
  _images = e?.images  ? [...e.images]  : [];
  _evTab  = 'links';
  openModal(`
    <div class="m-head"><span class="m-title">${e?'Edit Entry':'Add Accomplishment'}</span><button class="m-x" onclick="closeModal()">✕</button></div>
    <div class="f2col">
      <div class="fg s2">
        <label class="fi-label">What did you accomplish?</label>
        <input type="text" class="fi" id="et" value="${esc(e?.title||'')}" placeholder="e.g. Conducted 5 user interviews for the onboarding flow">
      </div>
      <div class="fg s2">
        <label class="fi-label">Description <span style="font-weight:400;opacity:.45">— optional</span></label>
        <textarea class="fi fi-ta" id="en" rows="3" placeholder="Add context, outcomes, metrics...">${esc(e?.notes||'')}</textarea>
      </div>
      <div class="fg">
        <label class="fi-label">Date</label>
        <input type="date" class="fi" id="ed" value="${e?.date||prefillDate||today()}">
      </div>
      <div class="fg">
        <label class="fi-label">Impact</label>
        <select class="fi" id="ei">${['High','Medium','Low'].map(i=>`<option value="${i}" ${(e?.impact||'Medium')===i?'selected':''}>${i} Impact</option>`).join('')}</select>
      </div>
      <div class="fg s2">
        <label class="fi-label">Labels <span style="font-weight:400;opacity:.45">— optional</span></label>
        <div id="label-area"></div>
      </div>
      <div class="fg s2">
        <label class="fi-label">Supporting Evidence <span style="font-weight:400;opacity:.45">— optional</span></label>
        <div id="ev-tabs" class="ev-tabs"></div>
        <div id="ev-area"></div>
      </div>
    </div>
    <div class="m-footer">
      ${e?`<button class="btn-del" onclick="delEntry()">Delete</button>`:''}
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-save" onclick="saveEntry()">Save Entry</button>
    </div>
  `);
  _renderLabels();
  _renderEvTabs();
  _renderEvidence();
  setTimeout(()=>document.getElementById('et')?.focus(), 80);
}

function saveEntry() {
  const t=document.getElementById('et'), v=t?.value.trim();
  if(!v){ if(t){t.style.borderColor='#f87171';t.focus();} return; }
  if(t) t.style.borderColor='';
  const entry={ id:editId||uid(), title:v, date:document.getElementById('ed')?.value||today(), category:_labels[0]||'Other', labels:[..._labels], notes:document.getElementById('en')?.value.trim()||'', impact:document.getElementById('ei')?.value||'Medium', links:[..._links], images:[..._images] };
  if(editId){ const i=S.entries.findIndex(e=>e.id===editId); if(i>=0) S.entries[i]=entry; toast('Entry updated'); }
  else { S.entries.push(entry); toast('Accomplishment added'); celebrate(); }
  save(); closeModal(); render();
}

/* ══════════════════════════════════════════════════════════
   JOBS — pipeline for finding & landing the next role
   ══════════════════════════════════════════════════════════ */

const JOB_STATUSES = [
  { key:'interested',   label:'Interested',   color:'#a78bfa' },
  { key:'applied',      label:'Applied',      color:'#60a5fa' },
  { key:'interviewing', label:'Interviewing', color:'#fbbf24' },
  { key:'offer',        label:'Offer',        color:'#4ade80' },
  { key:'closed',       label:'Closed',       color:'#9ca3af' },
];
const JOB_STATUS_MAP = Object.fromEntries(JOB_STATUSES.map(s=>[s.key,s]));
const STAGE_PRESETS = ['Recruiter screen','Phone screen','Hiring manager','Technical interview','Take-home task','Panel / onsite','Final round'];

function jobById(id){ return S.jobs.find(j=>j.id===id); }
function jobFirstName(name){ return (name||'').trim().split(/\s+/)[0] || ''; }

/* Follow-up state for a job card */
function followUpBadge(job){
  const f = job.followUp;
  if(!f) return '';
  if(f.sent) return `<span class="jf-badge jf-sent">✓ Followed up</span>`;
  if(f.due){
    const overdue = f.due <= today();
    return `<span class="jf-badge ${overdue?'jf-due':'jf-soon'}">${overdue?'Follow up now':'Follow up '+fmtS(f.due)}</span>`;
  }
  return '';
}

/* ── DASHBOARD SUMMARY ── */
function renderJobSummary(){
  if(!S.jobs.length) return '';
  const c = k => S.jobs.filter(j=>j.status===k).length;
  const active = S.jobs.filter(j=>j.status!=='closed').length;
  const dueCount = S.jobs.filter(j=>j.followUp && !j.followUp.sent && j.followUp.due && j.followUp.due<=today()).length;
  const cells = [
    { l:'Open applications', v:active },
    { l:'Interviewing', v:c('interviewing') },
    { l:'Offers', v:c('offer') },
    { l:'Follow-ups due', v:dueCount, hot:dueCount>0 },
  ];
  return `<div class="gp panel-inner fu job-sum" style="width:100%">
    <div class="job-sum-head">
      <div class="panel-title" style="margin:0">Job search</div>
      <button class="job-sum-link" onclick="setView('jobs')">Open pipeline →</button>
    </div>
    <div class="job-sum-grid">
      ${cells.map(x=>`<div class="job-sum-cell"><div class="job-sum-val ${x.hot?'hot':''}">${x.v}</div><div class="job-sum-lbl">${x.l}</div></div>`).join('')}
    </div>
  </div>`;
}

/* ── PIPELINE BOARD ── */
function renderJobs(){
  if(!S.jobs.length){
    return `<div class="board-wrap" style="display:flex;align-items:flex-start;justify-content:center">
      <div class="gp fu" style="max-width:520px;width:100%">
        <div class="empty">
          <div class="empty-title">Track your next move</div>
          <div class="empty-desc">Add roles you're interested in, follow each one through applications and interviews, and let Promptly draft your follow-up emails.</div>
          <button class="empty-btn" onclick="openAddJob()">+ Add your first job</button>
        </div>
      </div>
    </div>`;
  }
  return `<div class="board-wrap">${JOB_STATUSES.map(st=>{
    const items = S.jobs
      .filter(j=>j.status===st.key)
      .sort((a,b)=>(b.dateApplied||b.dateAdded||'').localeCompare(a.dateApplied||a.dateAdded||''));
    return `<div class="board-col">
      <div class="gp col-head">
        <div class="col-head-l"><span class="col-dot" style="background:${st.color}"></span><span class="col-name">${st.label}</span></div>
        <span class="col-cnt">${items.length}</span>
      </div>
      ${items.map(j=>renderJobCard(j)).join('')}
      <div class="add-zone" onclick="openAddJob('${st.key}')">+ Add job</div>
    </div>`;
  }).join('')}</div>`;
}

function renderJobCard(j){
  const stages = j.stages||[];
  const done = stages.filter(s=>s.done).length;
  const next = stages.find(s=>!s.done);
  const emails = (j.emails||[]).length;
  return `<div class="gp board-card job-card fu" onclick="openEditJob('${j.id}')">
    <div class="jc-company">${esc(j.company||'Untitled')}</div>
    ${j.role?`<div class="jc-role">${esc(j.role)}</div>`:''}
    ${(j.location||j.salary)?`<div class="jc-meta">${[j.location,j.salary].filter(Boolean).map(esc).join(' · ')}</div>`:''}
    ${stages.length?`<div class="jc-stages"><div class="jc-stage-track"><div class="jc-stage-fill" style="width:${Math.round(done/stages.length*100)}%"></div></div><span class="jc-stage-lbl">${done}/${stages.length}${next?` · next: ${esc(next.name)}`:' · complete'}</span></div>`:''}
    <div class="jc-foot">
      ${followUpBadge(j)||'<span></span>'}
      <span class="jc-foot-right">
        ${emails?`<span class="jc-ind" title="${emails} email${emails>1?'s':''} logged">✉ ${emails}</span>`:''}
        ${(j.contacts&&j.contacts.length)?`<span class="jc-ind" title="${j.contacts.length} contact${j.contacts.length>1?'s':''}">◷ ${j.contacts.length}</span>`:''}
      </span>
    </div>
  </div>`;
}

/* ── JOB MODAL STATE ── */
let editJobId = null;
let _stages = [];
let _contacts = [];
let _jobEmails = [];
let _draft = null; // { type, to, subject, body }

function openAddJob(status=null){ editJobId=null; showJobModal(null, status); }
function openEditJob(id){ editJobId=id; showJobModal(jobById(id)); }

function showJobModal(j, defaultStatus){
  _stages   = j?.stages   ? j.stages.map(s=>({...s}))   : [];
  _contacts = j?.contacts ? j.contacts.map(c=>({...c})) : [];
  _jobEmails= j?.emails   ? j.emails.map(e=>({...e}))   : [];
  _draft = null;
  const status = j?.status || defaultStatus || 'interested';
  const f = j?.followUp || {};
  openModal(`
    <div class="m-head"><span class="m-title">${j?'Edit Job':'Add Job'}</span><button class="m-x" onclick="closeModal()">✕</button></div>
    <div class="f2col">
      <div class="fg">
        <label class="fi-label">Company</label>
        <input type="text" class="fi" id="jb-company" value="${esc(j?.company||'')}" placeholder="e.g. Linear">
      </div>
      <div class="fg">
        <label class="fi-label">Role</label>
        <input type="text" class="fi" id="jb-role" value="${esc(j?.role||'')}" placeholder="e.g. Senior Product Designer">
      </div>
      <div class="fg">
        <label class="fi-label">Status</label>
        <select class="fi" id="jb-status">${JOB_STATUSES.map(s=>`<option value="${s.key}" ${status===s.key?'selected':''}>${s.label}</option>`).join('')}</select>
      </div>
      <div class="fg">
        <label class="fi-label">Date applied <span style="font-weight:400;opacity:.45">— optional</span></label>
        <input type="date" class="fi" id="jb-applied" value="${j?.dateApplied||''}">
      </div>
      <div class="fg">
        <label class="fi-label">Location <span style="font-weight:400;opacity:.45">— optional</span></label>
        <input type="text" class="fi" id="jb-location" value="${esc(j?.location||'')}" placeholder="Remote · London">
      </div>
      <div class="fg">
        <label class="fi-label">Salary <span style="font-weight:400;opacity:.45">— optional</span></label>
        <input type="text" class="fi" id="jb-salary" value="${esc(j?.salary||'')}" placeholder="£70–85k">
      </div>
      <div class="fg s2">
        <label class="fi-label">Job posting link <span style="font-weight:400;opacity:.45">— optional</span></label>
        <input type="text" class="fi" id="jb-link" value="${esc(j?.link||'')}" placeholder="https://...">
      </div>

      <div class="fg s2">
        <label class="fi-label">Interview process</label>
        <div id="stage-area"></div>
      </div>

      <div class="fg s2">
        <label class="fi-label">Follow-up</label>
        <div class="jb-followup">
          <label class="jb-check"><input type="checkbox" id="jb-fsent" ${f.sent?'checked':''}> Follow-up sent</label>
          <div class="jb-fdate"><span class="jb-fdate-lbl">Due</span><input type="date" class="fi" id="jb-fdue" value="${f.due||''}" style="padding:7px 10px;font-size:13px"></div>
        </div>
      </div>

      <div class="fg s2">
        <label class="fi-label">Contacts <span style="font-weight:400;opacity:.45">— recruiters, hiring managers</span></label>
        <div id="contact-area"></div>
      </div>

      <div class="fg s2">
        <label class="fi-label">Notes <span style="font-weight:400;opacity:.45">— optional</span></label>
        <textarea class="fi fi-ta" id="jb-notes" rows="2" placeholder="What stood out, prep notes, comp expectations...">${esc(j?.notes||'')}</textarea>
      </div>

      <div class="fg s2">
        <label class="fi-label">Outreach <span style="font-weight:400;opacity:.45">— draft an email</span></label>
        <div class="draft-btns">
          <button type="button" class="draft-btn" onclick="draftEmail('intro')">Express interest</button>
          <button type="button" class="draft-btn" onclick="draftEmail('followup')">Follow up</button>
          <button type="button" class="draft-btn" onclick="draftEmail('thankyou')">Post-interview thanks</button>
          <button type="button" class="draft-btn" onclick="draftEmail('nudge')">Check status</button>
        </div>
        <div id="draft-area"></div>
        <div id="email-log"></div>
      </div>
    </div>
    <div class="m-footer">
      ${j?`<button class="btn-del" onclick="delJob()">Delete</button>`:''}
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-save" onclick="saveJob()">Save Job</button>
    </div>
  `);
  _renderStages();
  _renderContacts();
  _renderDraft();
  _renderEmailLog();
  setTimeout(()=>document.getElementById('jb-company')?.focus(), 80);
}

/* ── STAGES ── */
function _renderStages(){
  const el = document.getElementById('stage-area');
  if(!el) return;
  el.innerHTML = `
    ${_stages.map((s,i)=>`
      <div class="je-row">
        <input type="checkbox" class="je-check" ${s.done?'checked':''} onchange="toggleStage(${i}, this.checked)">
        <input type="text" class="fi je-input" value="${esc(s.name)}" placeholder="Stage name" oninput="_stages[${i}].name=this.value">
        <input type="date" class="fi je-date" value="${s.date||''}" oninput="_stages[${i}].date=this.value">
        <button type="button" class="je-rm" onclick="removeStage(${i})">×</button>
      </div>`).join('')}
    <div class="je-presets">
      ${STAGE_PRESETS.map(p=>`<button type="button" class="je-preset" onclick="addStage('${esc(p)}')">+ ${p}</button>`).join('')}
      <button type="button" class="je-preset je-preset-custom" onclick="addStage('')">+ Custom</button>
    </div>`;
}
function addStage(name){ _stages.push({name, date:'', done:false}); _renderStages(); }
function removeStage(i){ _stages.splice(i,1); _renderStages(); }
function toggleStage(i, val){ if(_stages[i]) _stages[i].done = val; _renderStages(); }

/* ── CONTACTS ── */
function _renderContacts(){
  const el = document.getElementById('contact-area');
  if(!el) return;
  el.innerHTML = `
    ${_contacts.map((c,i)=>`
      <div class="je-row je-row-contact">
        <input type="text" class="fi je-input" value="${esc(c.name||'')}" placeholder="Name" oninput="_contacts[${i}].name=this.value">
        <input type="text" class="fi je-input" value="${esc(c.role||'')}" placeholder="Role" oninput="_contacts[${i}].role=this.value">
        <input type="email" class="fi je-input" value="${esc(c.email||'')}" placeholder="email@company.com" oninput="_contacts[${i}].email=this.value">
        <button type="button" class="je-rm" onclick="removeContact(${i})">×</button>
      </div>`).join('')}
    <button type="button" class="je-preset" onclick="addContact()" style="margin-top:${_contacts.length?'2px':'0'}">+ Add contact</button>`;
}
function addContact(){ _contacts.push({name:'',role:'',email:''}); _renderContacts(); }
function removeContact(i){ _contacts.splice(i,1); _renderContacts(); }

/* ── SAVE / DELETE ── */
function saveJob(){
  const c = document.getElementById('jb-company');
  const company = c?.value.trim();
  if(!company){ if(c){ c.style.borderColor='#f87171'; c.focus(); } return; }
  if(c) c.style.borderColor='';
  const fsent = document.getElementById('jb-fsent')?.checked || false;
  const fdue  = document.getElementById('jb-fdue')?.value || '';
  const followUp = (fsent || fdue) ? { sent:fsent, due:fdue, sentDate: fsent ? (jobById(editJobId)?.followUp?.sentDate || today()) : '' } : null;
  const job = {
    id: editJobId || uid(),
    company,
    role: document.getElementById('jb-role')?.value.trim() || '',
    status: document.getElementById('jb-status')?.value || 'interested',
    location: document.getElementById('jb-location')?.value.trim() || '',
    salary: document.getElementById('jb-salary')?.value.trim() || '',
    link: document.getElementById('jb-link')?.value.trim() || '',
    dateApplied: document.getElementById('jb-applied')?.value || '',
    dateAdded: editJobId ? (jobById(editJobId)?.dateAdded || today()) : today(),
    stages: _stages.filter(s=>s.name.trim()).map(s=>({name:s.name.trim(), date:s.date||'', done:!!s.done})),
    contacts: _contacts.filter(c=>(c.name||c.email||c.role||'').trim()),
    followUp,
    notes: document.getElementById('jb-notes')?.value.trim() || '',
    emails: _jobEmails,
  };
  if(editJobId){ const i=S.jobs.findIndex(x=>x.id===editJobId); if(i>=0) S.jobs[i]=job; toast('Job updated'); }
  else { S.jobs.push(job); toast('Job added'); if(job.status==='offer') celebrate(); }
  save(); closeModal(); render();
}
function delJob(){
  if(!editJobId || !confirm('Delete this job?')) return;
  S.jobs = S.jobs.filter(j=>j.id!==editJobId);
  save(); closeModal(); render(); toast('Job deleted');
}

/* ══════════════════════════════════════════════════════════
   EMAIL DRAFTING
   Smart templates today. To upgrade to AI-generated drafts,
   replace the body of generateEmailDraft() with a call to your
   model endpoint (e.g. the Claude API) — the rest of the UI
   (recipient, subject, edit, mailto, copy, log) stays the same.
   ══════════════════════════════════════════════════════════ */

const EMAIL_LABELS = { intro:'Express interest', followup:'Follow up', thankyou:'Post-interview thanks', nudge:'Check status' };

function _jobFromForm(){
  // Read current form values so drafts reflect unsaved edits too.
  return {
    company: document.getElementById('jb-company')?.value.trim() || 'the company',
    role: document.getElementById('jb-role')?.value.trim() || 'the role',
    dateApplied: document.getElementById('jb-applied')?.value || '',
    stages: _stages,
  };
}

function generateEmailDraft(type, job, contact){
  const me = S.settings.userName?.trim() || '[Your name]';
  const hi = contact && contact.name ? `Hi ${jobFirstName(contact.name)},` : 'Hi,';
  const role = job.role || 'the role';
  const company = job.company || 'your team';
  const lastStage = (job.stages||[]).filter(s=>s.done).slice(-1)[0];
  const sign = `\n\nBest regards,\n${me}`;
  switch(type){
    case 'intro':
      return {
        subject: `Interest in the ${role} role at ${company}`,
        body: `${hi}\n\nI came across the ${role} opening at ${company} and wanted to introduce myself — it lines up closely with what I'm looking for and where I think I can add value.\n\nI'd love to learn more about the team and share how my background fits. Would you be open to a quick conversation?${sign}`,
      };
    case 'followup':
      return {
        subject: `Following up — ${role} application`,
        body: `${hi}\n\nI wanted to follow up on my application for the ${role} role${job.dateApplied?` submitted on ${fmtS(job.dateApplied)}`:''}. I'm very enthusiastic about the opportunity at ${company} and would welcome the chance to discuss how I could contribute.\n\nIs there any update on the process, or anything further you need from me?${sign}`,
      };
    case 'thankyou':
      return {
        subject: `Thank you — ${role} interview`,
        body: `${hi}\n\nThank you for taking the time to speak with me${lastStage?` during the ${lastStage.name.toLowerCase()}`:''}. I really enjoyed the conversation and it reinforced how excited I am about the ${role} role at ${company}.\n\nPlease don't hesitate to reach out if there's anything else I can provide. I look forward to the next steps.${sign}`,
      };
    case 'nudge':
      return {
        subject: `Checking in — ${role} at ${company}`,
        body: `${hi}\n\nI hope you're well. I wanted to check in on where things stand with the ${role} process. I remain genuinely excited about the opportunity and am happy to provide anything that would be helpful.\n\nThank you for the update whenever you have a moment.${sign}`,
      };
    default:
      return { subject:'', body:'' };
  }
}

function draftEmail(type){
  const job = _jobFromForm();
  const contact = (_contacts.find(c=>c.email) || _contacts[0] || null);
  const d = generateEmailDraft(type, job, contact);
  _draft = { type, to: contact?.email || '', subject: d.subject, body: d.body };
  _renderDraft();
  document.getElementById('draft-area')?.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function _renderDraft(){
  const el = document.getElementById('draft-area');
  if(!el) return;
  if(!_draft){ el.innerHTML=''; return; }
  el.innerHTML = `
    <div class="draft-card">
      <div class="draft-card-head"><span class="draft-tag">${EMAIL_LABELS[_draft.type]||'Draft'}</span><button type="button" class="draft-close" onclick="discardDraft()">×</button></div>
      <input type="email" class="fi draft-field" id="draft-to" value="${esc(_draft.to)}" placeholder="recipient@company.com" oninput="_draft.to=this.value" style="padding:8px 11px;font-size:13px">
      <input type="text" class="fi draft-field" id="draft-subject" value="${esc(_draft.subject)}" placeholder="Subject" oninput="_draft.subject=this.value" style="padding:8px 11px;font-size:13px">
      <textarea class="fi draft-field" id="draft-body" rows="9" oninput="_draft.body=this.value" style="font-size:13px;line-height:1.6;min-height:160px">${esc(_draft.body)}</textarea>
      <div class="draft-actions">
        <button type="button" class="btn-action" onclick="copyDraft()">⧉ Copy</button>
        <button type="button" class="btn-action" onclick="openDraftMail()">✉ Open in mail app</button>
        <button type="button" class="draft-log" onclick="logDraftSent()">Mark as sent</button>
      </div>
    </div>`;
}
function discardDraft(){ _draft=null; _renderDraft(); }

function openDraftMail(){
  if(!_draft) return;
  const url = `mailto:${(_draft.to||'').trim()}?subject=${encodeURIComponent(_draft.subject||'')}&body=${encodeURIComponent(_draft.body||'')}`;
  window.location.href = url;
}
function copyDraft(){
  if(!_draft) return;
  const text = `${_draft.subject}\n\n${_draft.body}`;
  if(navigator.clipboard?.writeText){ navigator.clipboard.writeText(text).then(()=>toast('Draft copied')); }
  else { const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');toast('Draft copied');}catch(e){} ta.remove(); }
}
function logDraftSent(){
  if(!_draft) return;
  _jobEmails.unshift({ type:_draft.type, to:_draft.to, subject:_draft.subject, body:_draft.body, date:today() });
  if(_draft.type==='followup'){ const cb=document.getElementById('jb-fsent'); if(cb) cb.checked=true; }
  _draft=null;
  _renderDraft();
  _renderEmailLog();
  toast('Logged — remember to save the job');
}

function _renderEmailLog(){
  const el = document.getElementById('email-log');
  if(!el) return;
  if(!_jobEmails.length){ el.innerHTML=''; return; }
  el.innerHTML = `<div class="email-log-title">Sent log</div>${_jobEmails.map((e,i)=>`
    <div class="email-log-row">
      <span class="email-log-type">${EMAIL_LABELS[e.type]||'Email'}</span>
      <span class="email-log-subj">${esc(e.subject)}</span>
      <span class="email-log-date">${fmtS(e.date)}</span>
      <button type="button" class="je-rm" onclick="removeLoggedEmail(${i})">×</button>
    </div>`).join('')}`;
}
function removeLoggedEmail(i){ _jobEmails.splice(i,1); _renderEmailLog(); }

/* ── CELEBRATION ── */
const CRITTERS = [
  /* violet blob */
  `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M42 8 C60 4 76 16 76 36 C76 56 62 74 42 74 C22 74 6 58 6 38 C6 18 24 12 42 8 Z" fill="#9081f1"/>
    <path d="M42 10 C58 6 72 18 72 36 C72 54 60 70 42 70 C24 70 10 56 10 38 C10 20 26 14 42 10 Z" fill="#c3baff"/>
    <circle cx="30" cy="36" r="6" fill="white"/><circle cx="50" cy="36" r="6" fill="white"/>
    <circle cx="32" cy="37" r="3.2" fill="#22000d"/><circle cx="52" cy="37" r="3.2" fill="#22000d"/>
    <circle cx="33" cy="35" r="1.2" fill="white"/><circle cx="53" cy="35" r="1.2" fill="white"/>
    <path d="M30 50 Q40 58 50 50" stroke="#9081f1" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <ellipse cx="42" cy="18" rx="5" ry="8" fill="#9081f1" transform="rotate(-10 42 18)"/>
  </svg>`,
  /* lemon blob */
  `<svg width="90" height="80" viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 10 C68 6 84 20 82 42 C80 64 62 78 40 76 C18 74 6 58 8 36 C10 14 22 14 45 10 Z" fill="#ffff8c"/>
    <path d="M45 13 C66 9 80 22 78 42 C76 62 60 74 40 72 C20 70 10 56 12 38 C14 20 24 17 45 13 Z" fill="#ffff65"/>
    <circle cx="34" cy="38" r="6.5" fill="white"/><circle cx="56" cy="38" r="6.5" fill="white"/>
    <circle cx="35" cy="39" r="3.5" fill="#22000d"/><circle cx="57" cy="39" r="3.5" fill="#22000d"/>
    <circle cx="36" cy="37" r="1.3" fill="white"/><circle cx="58" cy="37" r="1.3" fill="white"/>
    <path d="M33 52 Q45 61 57 52" stroke="#c8a800" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <ellipse cx="28" cy="68" rx="5" ry="8" fill="#ffff8c" transform="rotate(10 28 68)"/>
    <ellipse cx="62" cy="68" rx="5" ry="8" fill="#ffff8c" transform="rotate(-10 62 68)"/>
  </svg>`,
  /* aubergine blob */
  `<svg width="76" height="88" viewBox="0 0 76 88" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 12 C58 8 72 22 70 44 C68 66 54 82 36 82 C18 82 6 66 6 46 C6 26 18 16 38 12 Z" fill="#642940"/>
    <path d="M38 15 C56 11 68 24 66 44 C64 64 52 78 36 78 C20 78 10 64 10 46 C10 28 20 19 38 15 Z" fill="#350316"/>
    <circle cx="28" cy="44" r="6" fill="white"/><circle cx="48" cy="44" r="6" fill="white"/>
    <circle cx="29" cy="45" r="3.2" fill="#22000d"/><circle cx="49" cy="45" r="3.2" fill="#22000d"/>
    <circle cx="30" cy="43" r="1.2" fill="white"/><circle cx="50" cy="43" r="1.2" fill="white"/>
    <path d="M28 58 Q38 66 48 58" stroke="#c3baff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <line x1="28" y1="16" x2="22" y2="4" stroke="#c3baff" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="48" y1="16" x2="54" y2="4" stroke="#c3baff" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="21" cy="3" r="3.5" fill="#9081f1"/><circle cx="55" cy="3" r="3.5" fill="#9081f1"/>
  </svg>`,
];

const CONF_COLORS = ['#c3baff','#ffff8c','#9081f1','#642940','#ffff65','#ffffff','#350316','#f5a623'];

function celebrate() {
  const stage = document.createElement('div');
  stage.className = 'celebrate-stage';
  document.body.appendChild(stage);

  const blobs = [
    { tx:'calc(50% - 130px)', ty:'34%', sx:'-28vw', delay:'0s'    },
    { tx:'calc(50% - 40px)',  ty:'38%', sx:'4vw',   delay:'0.1s'  },
    { tx:'calc(50% + 55px)',  ty:'32%', sx:'24vw',  delay:'0.05s' },
  ];
  blobs.forEach((b, i) => {
    const el = document.createElement('div');
    el.className = 'blob-item';
    el.style.cssText = `--tx:${b.tx};--ty:${b.ty};--sx:${b.sx};animation-delay:${b.delay}`;
    el.innerHTML = CRITTERS[i];
    stage.appendChild(el);
  });

  setTimeout(() => {
    stage.querySelectorAll('.blob-item').forEach(el => el.remove());

    for (let i = 0; i < 75; i++) {
      const angle = (i / 75) * 360 + Math.random() * 8;
      const dist = 18 + Math.random() * 34;
      const dx = (Math.cos(angle * Math.PI / 180) * dist).toFixed(1) + 'vw';
      const dy = (Math.sin(angle * Math.PI / 180) * dist * 0.7 - 8).toFixed(1) + 'vh';
      const rot = (Math.random() * 720 - 360).toFixed(0) + 'deg';
      const clr = CONF_COLORS[i % CONF_COLORS.length];
      const size = (5 + Math.random() * 9).toFixed(1) + 'px';
      const radius = Math.random() > 0.5 ? '50%' : '3px';
      const p = document.createElement('div');
      p.className = 'conf-particle';
      p.style.cssText = `--dx:${dx};--dy:${dy};--rot:${rot};width:${size};height:${size};background:${clr};border-radius:${radius};animation-delay:${(Math.random()*0.14).toFixed(2)}s`;
      stage.appendChild(p);
    }

    const popup = document.createElement('div');
    popup.className = 'congrats-popup';
    popup.innerHTML = `<div class="congrats-title">Congrats on your progress</div><div class="congrats-sub">Keep going — you're building something great.</div>`;
    stage.appendChild(popup);
  }, 3870);

  setTimeout(() => stage.remove(), 9200);
}

function delEntry() {
  if(!editId||!confirm('Delete this entry?')) return;
  S.entries=S.entries.filter(e=>e.id!==editId);
  save(); closeModal(); render(); toast('Entry deleted');
}

/* ── DATA ── */
function exportData() {
  const b=new Blob([JSON.stringify(S.entries,null,2)],{type:'application/json'});
  const u=URL.createObjectURL(b), a=document.createElement('a');
  a.href=u; a.download=`promptly-${S.settings.currentYear}.json`; a.click(); URL.revokeObjectURL(u);
  toast('Exported');
}
function clearAll() {
  if(!confirm('Delete ALL entries? Cannot be undone.')) return;
  S.entries=[]; save(); render(); closeModal(); toast('Data cleared');
}

/* ── TOAST ── */
function toast(msg) {
  const el=document.getElementById('toast');
  el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 2400);
}

/* ── KEYBOARD ── */
document.addEventListener('keydown', e=>{
  if(e.key==='Escape') closeModal();
  if((e.metaKey||e.ctrlKey)&&e.key==='k'){ e.preventDefault(); openAddEntry(); }
  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){ if(document.getElementById('overlay').classList.contains('open')){ if(document.getElementById('jb-company')) saveJob(); else if(document.getElementById('et')) saveEntry(); } }
});

/* ── INIT ── */
load();
const _initBg = BGS.find(b=>b.key===(S.settings.bgKey||'nature-1'));
if(_initBg) bgTab = _initBg.cat;
applyBg(S.settings.bgKey||'nature-1');
applyTheme(S.settings.theme||'dark');
document.getElementById('yr').value=S.settings.currentYear;

if(S.entries.length===0){
  S.entries=[
    {id:uid(),title:'Conducted 5 user interviews for the onboarding redesign',date:'2026-01-14',category:'Research',labels:['Research','User Interviews'],notes:'Uncovered 3 major pain points in the signup flow. Findings shared with the full team.',impact:'High'},
    {id:uid(),title:'Facilitated Q1 product strategy workshop with leadership',date:'2026-01-28',category:'Strategy',labels:['Strategy','Workshop'],notes:'2-day offsite with 12 stakeholders. Defined 3 strategic bets and gained exec alignment.',impact:'High'},
    {id:uid(),title:'Launched redesigned onboarding flow to 100% of users',date:'2026-02-03',category:'Delivery',labels:['Delivery'],notes:'18% improvement in activation rate within the first week post-launch.',impact:'High'},
    {id:uid(),title:'Mentored 2 junior designers through their Q1 reviews',date:'2026-02-18',category:'Leadership',labels:['Leadership','Mentoring'],notes:'Helped both identify growth areas and set meaningful development goals.',impact:'Medium'},
    {id:uid(),title:'Shipped v2 of the design system with full dark mode',date:'2026-03-05',category:'Design',labels:['Design'],notes:'Reduced handoff time by ~30%. Adopted across 4 product squads.',impact:'High'},
    {id:uid(),title:'Presented product roadmap to C-suite',date:'2026-03-19',category:'Stakeholder',labels:['Stakeholder','Presentation'],notes:'Secured exec alignment on H1 priorities and sign-off on the new initiative.',impact:'High'},
    {id:uid(),title:'Ran usability testing on checkout flow prior to launch',date:'2026-04-02',category:'Research',labels:['Research','Usability'],notes:'Tested with 8 participants. Found and fixed 5 critical issues before release.',impact:'High'},
    {id:uid(),title:'Introduced async standup format for the product team',date:'2026-04-10',category:'Process',labels:['Process'],notes:'Replaced daily syncs — saved ~3 hours/week with no loss of visibility.',impact:'Medium'},
  ];
  save();
}

setView(S.view||'dashboard');
