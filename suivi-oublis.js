/* suivi-oublis.js : fiche de suivi de la course longue, oublis séance par séance (saisie rétroactive possible).
   Touche une case : vide = fiche faite, ✗ = oubliée / non remplie, A = absent (séance non comptée).
   Points /3 du critère « Fiche de suivi » du barème : 0 oubli = 3 ; au plus 1/3 des séances oubliées = 2 ; plus = 1 ; toutes oubliées = 0.
   Données : fsuivi-<année>-<classe> = { n: nombre de séances, c: { nom: ['', 'x', 'a', …] } } */
let fsSt = { cl: '6e' };
const fsCle = (cl) => 'fsuivi-' + currentYear + '-' + cl;
function fsLire(cl) { let o = {}; try { o = JSON.parse(localStorage.getItem(fsCle(cl)) || '{}'); } catch (e) { o = {}; } return Object.assign({ n: 6, c: {} }, o); }
function fsSauver(cl, d) { try { localStorage.setItem(fsCle(cl), JSON.stringify(d)); } catch (e) {} if (typeof scheduleCloudSync === 'function') scheduleCloudSync(); }
function fsPoints(cells, n) {
  const l = (cells || []).slice(0, n); let oublis = 0, abs = 0;
  for (let i = 0; i < n; i++) { if (l[i] === 'x') oublis++; else if (l[i] === 'a') abs++; }
  const compte = n - abs; if (compte <= 0) return { pts: null, oublis, compte };
  const pts = oublis === 0 ? 3 : oublis >= compte ? 0 : oublis <= compte / 3 ? 2 : 1;
  return { pts, oublis, compte };
}
function fsHtml() { return '<div id="fsRoot"></div>'; }
function fsOuvrir(cl) { if (cl) fsSt.cl = cl; docSpecialOuvrir('suivi-oublis'); }
function fsRendre() {
  const root = document.getElementById('fsRoot'); if (!root) return;
  const cl = fsSt.cl, d = fsLire(cl), noms = (getEleves(currentYear)[cl] || []).slice(), n = d.n;
  const nom = (i) => 'font-size:0.7rem;font-weight:700;color:var(--muted)';
  const cell = (v) => v === 'x' ? ['✗', '#c8382e', '#fff'] : v === 'a' ? ['A', '#9aa5a5', '#fff'] : ['', 'transparent', 'inherit'];
  root.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
    <label style="${nom()}">Classe<select id="fsCl" style="width:100%;padding:8px;font-size:1rem">${['6e', '5e', '4e', '3e'].map((c) => `<option${c === cl ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
    <label style="${nom()}">Nombre de séances<select id="fsN" style="width:100%;padding:8px;font-size:1rem">${[3, 4, 5, 6, 7, 8, 9, 10].map((x) => `<option${x === n ? ' selected' : ''}>${x}</option>`).join('')}</select></label></div>
  <div style="font-size:0.72rem;color:var(--muted);margin-bottom:8px;line-height:1.45">Touche une case : <b>vide</b> = fiche faite, <b style="color:#c8382e">✗</b> = oubliée ou non remplie, <b>A</b> = absent (séance non comptée). Tu peux remplir les anciennes séances. Points /3 : aucun oubli = 3, au plus 1 séance sur 3 oubliée = 2, plus = 1, toutes oubliées = 0.</div>
  ${noms.length ? `<div class="card" style="padding:6px 8px;margin-bottom:8px;overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.82rem"><tr><th style="text-align:left;${nom()}">Élève</th>${Array.from({ length: n }, (_, i) => `<th style="${nom()}">S${i + 1}</th>`).join('')}<th style="${nom()}">Oublis</th><th style="${nom()}">Pts</th></tr>
    ${noms.map((x) => { const c = d.c[x] || []; const r = fsPoints(c, n); return `<tr style="border-top:1px solid var(--border)"><td style="padding:4px 4px 4px 0;white-space:nowrap">${rlEsc(x)}</td>${Array.from({ length: n }, (_, i) => { const [t, bg, fg] = cell(c[i]); return `<td style="padding:3px 2px;text-align:center"><button type="button" data-c="${rlEsc(x)}|${i}" style="width:34px;height:34px;border:1.5px solid ${bg === 'transparent' ? 'var(--border)' : bg};background:${bg};color:${fg};border-radius:8px;font:700 0.85rem inherit;font-family:inherit;cursor:pointer" aria-label="Séance ${i + 1} de ${rlEsc(x)}">${t}</button></td>`; }).join('')}<td style="text-align:center">${r.oublis}</td><td style="text-align:center"><b>${r.pts === null ? '—' : r.pts + '/3'}</b></td></tr>`; }).join('')}</table></div>
  <button type="button" class="btn btn-teal" id="fsCopie" style="width:100%">📋 Copier les points (nom : note /3)</button>` : `<div class="card" style="padding:12px;font-size:0.85rem">Aucun élève en ${cl}. Ajoute-les dans « Élèves ».</div>`}`;
  document.getElementById('fsCl').onchange = (e) => { fsSt.cl = e.target.value; fsRendre(); };
  document.getElementById('fsN').onchange = (e) => { d.n = +e.target.value; fsSauver(cl, d); fsRendre(); };
  root.onclick = (e) => {
    const b = e.target.closest('button[data-c]');
    if (b) { const [x, i] = b.dataset.c.split('|'); const c = (d.c[x] = d.c[x] || []); const nx = { undefined: 'x', '': 'x', x: 'a', a: '' }[c[+i]]; c[+i] = nx; for (let k = 0; k < n; k++) if (c[k] === undefined) c[k] = ''; fsSauver(cl, d); fsRendre(); return; }
    if (e.target.closest('#fsCopie')) {
      const txt = noms.map((x) => { const r = fsPoints(d.c[x], n); return x + ' : ' + (r.pts === null ? '—' : r.pts + '/3'); }).join('\n');
      try { navigator.clipboard.writeText(txt).then(() => showToast('Points copiés'), () => showToast('Copie impossible')); } catch (er) { showToast('Copie impossible'); }
    }
  };
}
function boutonFiche(sd, cl, col) {
  if (!sd || sd.id !== 'course-longue') return '';
  return `<button onclick="fsOuvrir('${cl}')" title="Fiches de suivi oubliées, par séance" style="background:${col};color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif">📋 Fiches de suivi</button>`;
}
