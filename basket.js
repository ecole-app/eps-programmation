/* basket.js : tournoi de basket (équipes équilibrées, calendrier, scores, classement) et notation par cases
   reliée au barème 5e/4e/3e (Performance, Jeu collectif, Défense, Arbitrage). Chargé après relais.js (réutilise rlEquilibrer, rlEsc…).
   Données : basket-<année>-<classe> = { nb, niveau:{nom:'A|B|C'}, equipes:{sN:{nom:i}}, scores:{sN:{'a-b':[x,y]}}, obs:{sN:{nom:{dem,pass,esp,def:[bool]}}}, arb:{sN:{nom:[bool]}} } */

let bkSt = { cl: '5e', s: 1, tab: 'equipes', g: 0 };
const BK_NSEANCES = 12;
const BK_CRIT = [
  { id: 'dem', t: 'Démarquage', max: 3, items: [['Avant la passe', 'Se démarque avant la passe'], ['Après la passe', 'Se démarque après la passe'], ['Espace libre', 'Toujours dans un espace libre']] },
  { id: 'pass', t: 'Passes', max: 3, items: [['Sans dribble inutile', 'Passe sans dribble inutile'], ['À un démarqué', 'Passe à un partenaire démarqué'], ['Peu de pertes', 'Peu de balles perdues']] },
  { id: 'esp', t: 'Espaces', max: 2, items: [['Vers le panier', 'Avance vers le panier dès la réception'], ['Largeur / profondeur', 'Joue en largeur et en profondeur']] },
  { id: 'def', t: 'Défense', max: 3, items: [['Gêne le porteur', 'Gêne le porteur de balle'], ['Se replace', 'Se replace entre son joueur et le panier'], ['Toute la durée', 'Défend pendant toute la durée']] }
];
const BK_ARB = ['Annonce le score', 'Signale le marcher', 'Annonce les sorties'];

const bkCle = (cl) => 'basket-' + currentYear + '-' + cl;
function bkLire(cl) {
  let o = {}; try { o = JSON.parse(localStorage.getItem(bkCle(cl)) || '{}'); } catch (e) { o = {}; }
  return Object.assign({ nb: 4, niveau: {}, equipes: {}, scores: {}, obs: {}, arb: {} }, o);
}
function bkSauver(cl, d) { try { localStorage.setItem(bkCle(cl), JSON.stringify(d)); } catch (e) {} if (typeof scheduleCloudSync === 'function') scheduleCloudSync(); }
const bkEleves = (cl) => (getEleves(currentYear)[cl] || []).slice();
function bkMembres(d, s, i, cl) { const g = d.equipes[s] || {}; return bkEleves(cl).filter((n) => g[n] === i); }

/* ── Calendrier (méthode du cercle) : chaque équipe rencontre toutes les autres ── */
function bkCalendrier(n) {
  const t = Array.from({ length: n }, (_, i) => i); if (n % 2) t.push(-1);
  const m = t.length, tours = [];
  for (let r = 0; r < m - 1; r++) {
    const paires = [];
    for (let i = 0; i < m / 2; i++) { const a = t[i], b = t[m - 1 - i]; if (a >= 0 && b >= 0) paires.push([Math.min(a, b), Math.max(a, b)]); }
    tours.push(paires); t.splice(1, 0, t.pop());
  }
  return tours;
}
function bkClassement(d, s, n) {
  const sc = d.scores[s] || {};
  const L = Array.from({ length: n }, (_, i) => ({ i, V: 0, N: 0, D: 0, pf: 0, pc: 0, j: 0 }));
  Object.entries(sc).forEach(([k, v]) => {
    const [a, b] = k.split('-').map(Number); const x = parseInt(v[0], 10), y = parseInt(v[1], 10);
    if (isNaN(x) || isNaN(y) || !L[a] || !L[b]) return;
    L[a].j++; L[b].j++; L[a].pf += x; L[a].pc += y; L[b].pf += y; L[b].pc += x;
    if (x > y) { L[a].V++; L[b].D++; } else if (x < y) { L[b].V++; L[a].D++; } else { L[a].N++; L[b].N++; }
  });
  L.forEach((e) => { e.pts = e.V * 3 + e.N; e.diff = e.pf - e.pc; });
  return L.slice().sort((p, q) => q.pts - p.pts || q.diff - p.diff || q.pf - p.pf || p.i - q.i);
}
// Performance /5 : tableau du barème (3 victoires = 5 … 0 victoire = 1), ramené à 3 matchs si moins/plus d'équipes
function bkPerf(e, n) {
  if (!e || e.j < n - 1) return null;
  const m = n - 1, w = Math.round(e.V * 3 / m), nul = Math.round(e.N * 3 / m);
  return w >= 3 ? 5 : w === 2 ? 4 : w === 1 ? (nul >= 1 ? 3 : 2) : 1;
}
function bkPtsCrit(c, ticks) { return (ticks || []).filter(Boolean).length; }
function bkPtsArb(t) { t = t || []; const [sc, ma, so] = [!!t[0], !!t[1], !!t[2]]; if (!sc && !ma && !so) return null; if (!sc) return 1; if (sc && ma && so) return 4; if (sc && so) return 3; if (sc && ma) return 3; return 2; }
function bkBilanEleve(d, s, nom, perf) {
  const o = ((d.obs[s] || {})[nom]) || {};
  const sc = {}; BK_CRIT.forEach((c) => { sc[c.id] = (o[c.id] || []).some(Boolean) ? bkPtsCrit(c, o[c.id]) : null; });
  const arb = bkPtsArb((d.arb[s] || {})[nom]);
  return { perf, dem: sc.dem, pass: sc.pass, esp: sc.esp, def: sc.def, arb };
}

/* ── Écran ── */
function basketHtml() { return '<div id="bkRoot"></div>'; }
function basketOuvrir(cl, s) {
  if (cl) bkSt.cl = cl; if (s) bkSt.s = Math.min(BK_NSEANCES, Math.max(1, +s));
  docSpecialOuvrir('basket');
}
function basketRendre() {
  const root = document.getElementById('bkRoot'); if (!root) return;
  const T = [['equipes', '👥 Équipes'], ['tournoi', '🏆 Tournoi'], ['nota', '✅ Notation']];
  root.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
    <label style="font-size:0.66rem;font-weight:700;color:var(--muted)">Classe<select id="bkCl" style="width:100%;padding:8px;font-size:1rem">${['5e', '4e', '3e'].map((c) => `<option${c === bkSt.cl ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
    <label style="font-size:0.66rem;font-weight:700;color:var(--muted)">Séance<select id="bkS" style="width:100%;padding:8px;font-size:1rem">${Array.from({ length: BK_NSEANCES }, (_, i) => `<option value="${i + 1}"${i + 1 === bkSt.s ? ' selected' : ''}>Séance ${i + 1}</option>`).join('')}</select></label></div>
  <div style="display:flex;gap:4px;margin-bottom:10px" id="bkTabs">${T.map(([k, l]) => `<button type="button" data-tab="${k}" style="flex:1;border:0;border-radius:9px;padding:9px 2px;font:700 0.76rem inherit;font-family:inherit;cursor:pointer;background:${bkSt.tab === k ? '#0e7c7b' : '#d9efee'};color:${bkSt.tab === k ? '#fff' : '#0a5a5a'}">${l}</button>`).join('')}</div>
  <div id="bkTab"></div>`;
  document.getElementById('bkCl').onchange = (e) => { bkSt.cl = e.target.value; basketRendre(); };
  document.getElementById('bkS').onchange = (e) => { bkSt.s = +e.target.value; basketRendre(); };
  document.getElementById('bkTabs').onclick = (e) => { const b = e.target.closest('button[data-tab]'); if (b) { bkSt.tab = b.dataset.tab; basketRendre(); } };
  ({ equipes: bkTabEquipes, tournoi: bkTabTournoi, nota: bkTabNota })[bkSt.tab]();
}
const bkNomEq = (i) => 'Équipe ' + (i + 1);
const bkBadge = (i) => `<span style="font-size:0.7rem;font-weight:700;border-radius:99px;padding:2px 8px;color:#fff;background:${RL_COL[i % 6]}">É${i + 1}</span>`;

/* ── Équipes ── */
function bkTabEquipes() {
  const cl = bkSt.cl, s = bkSt.s, d = bkLire(cl), noms = bkEleves(cl), gen = (getGenres(currentYear)[cl]) || {}, el = document.getElementById('bkTab'), n = d.nb;
  if (bkSt.g >= n) bkSt.g = 0;
  if (!noms.length) { el.innerHTML = `<div class="card" style="padding:12px;font-size:0.85rem">Aucun élève en ${cl}. Ajoute-les dans « Élèves ».</div>`; return; }
  const grp = d.equipes[s] || {};
  const pill = (x) => { const v = d.niveau[x]; return `<button type="button" data-niv="${rlEsc(x)}" style="border:1.5px solid ${v ? RL_NIV[v] : 'var(--border)'};background:${v ? RL_NIV[v] : 'transparent'};color:${v ? '#fff' : 'var(--muted)'};border-radius:99px;width:30px;height:26px;font:700 0.72rem inherit;font-family:inherit;cursor:pointer" aria-label="Niveau de ${rlEsc(x)}">${v || '–'}</button>`; };
  el.innerHTML = `<div class="card" style="padding:10px 12px;margin-bottom:8px"><div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap">
    <label style="font-size:0.66rem;font-weight:700;color:var(--muted);flex:1;min-width:110px">Nombre d'équipes<select id="bkNb" style="width:100%;padding:7px;font-size:1rem">${[3, 4, 5, 6].map((x) => `<option${x === n ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
    <label style="display:flex;gap:6px;align-items:center;font-size:0.78rem;flex:1;min-width:130px"><input type="checkbox" id="bkMix" style="width:18px;height:18px"> Filles/garçons mélangés</label></div>
    <button type="button" class="btn btn-teal" id="bkEq" style="width:100%;margin-top:8px">⚖️ Équilibrer selon les niveaux A, B, C</button>
    <div style="font-size:0.7rem;color:var(--muted);margin-top:6px">Touche la pastille à droite du prénom pour donner un niveau. Ensuite tu peux changer un élève d'équipe à la main.</div></div>
  <div class="card" style="padding:10px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);margin-bottom:6px;text-transform:uppercase">Équipe active</div><div style="display:flex;gap:6px;flex-wrap:wrap" id="bkGsel">${Array.from({ length: n }, (_, i) => `<button type="button" data-g="${i}" style="border:2px solid ${RL_COL[i % 6]};background:${bkSt.g === i ? RL_COL[i % 6] : '#fff'};color:${bkSt.g === i ? '#fff' : 'inherit'};border-radius:10px;padding:6px 10px;font:700 0.8rem inherit;font-family:inherit;cursor:pointer">É${i + 1}</button>`).join('')}</div>
    <div style="font-size:0.7rem;color:var(--muted);margin-top:6px">Choisis une équipe puis coche les élèves : ils y vont.</div></div>
  <div class="card" style="padding:2px 10px;margin-bottom:8px" id="bkList">${noms.map((x) => { const g = grp[x]; return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--border)"><label style="display:flex;align-items:center;gap:9px;flex:1;min-width:0;cursor:pointer"><input type="checkbox" data-n="${rlEsc(x)}" ${g === bkSt.g ? 'checked' : ''} style="width:20px;height:20px"><span style="flex:1;min-width:0;font-size:0.9rem">${rlEsc(x)}${gen[x] ? ` <small style="color:var(--muted)">${gen[x]}</small>` : ''}</span></label>${g !== undefined ? bkBadge(g) : ''}${pill(x)}</div>`; }).join('')}</div>
  <div style="display:flex;gap:8px;margin-bottom:8px"><button type="button" class="btn btn-outline" id="bkPrev" style="flex:1">Reprendre la séance ${Math.max(1, s - 1)}</button><button type="button" class="btn btn-outline" id="bkVider">Vider</button></div>`;
  const sauver = () => { bkSauver(cl, d); bkTabEquipes(); };
  document.getElementById('bkNb').onchange = (e) => { d.nb = +e.target.value; delete d.equipes[s]; sauver(); };
  document.getElementById('bkGsel').onclick = (e) => { const b = e.target.closest('button[data-g]'); if (b) { bkSt.g = +b.dataset.g; bkTabEquipes(); } };
  document.getElementById('bkList').onchange = (e) => { const x = e.target.dataset.n; if (x === undefined) return; d.equipes[s] = d.equipes[s] || {}; if (e.target.checked) d.equipes[s][x] = bkSt.g; else delete d.equipes[s][x]; sauver(); };
  document.getElementById('bkList').onclick = (e) => { const b = e.target.closest('button[data-niv]'); if (!b) return; const x = b.dataset.niv; const nx = { undefined: 'A', A: 'B', B: 'C', C: undefined }[d.niveau[x]]; if (nx) d.niveau[x] = nx; else delete d.niveau[x]; sauver(); };
  document.getElementById('bkEq').onclick = () => { d.equipes[s] = rlEquilibrer(noms, d.niveau, n, gen, document.getElementById('bkMix').checked); sauver(); showToast('⚖️ Équipes équilibrées'); };
  document.getElementById('bkPrev').onclick = () => { if (s > 1 && d.equipes[s - 1]) { d.equipes[s] = Object.assign({}, d.equipes[s - 1]); sauver(); } else showToast('Rien à reprendre'); };
  document.getElementById('bkVider').onclick = () => { delete d.equipes[s]; sauver(); };
}

/* ── Tournoi : calendrier, scores, classement ── */
function bkTabTournoi() {
  const cl = bkSt.cl, s = bkSt.s, d = bkLire(cl), n = d.nb, el = document.getElementById('bkTab');
  const tours = bkCalendrier(n), sc = d.scores[s] || {}, cls = bkClassement(d, s, n);
  const compo = (i) => bkMembres(d, s, i, cl).map(rlEsc).join(', ') || '<i>vide</i>';
  el.innerHTML = tours.map((t, r) => `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Tour ${r + 1} · ${t.length} match${t.length > 1 ? 's' : ''} en même temps</div>${t.map(([a, b]) => { const v = sc[a + '-' + b] || ['', '']; return `<div style="display:flex;align-items:center;gap:6px;padding:8px 0;border-top:1px solid var(--border)">${bkBadge(a)}<input type="number" inputmode="numeric" min="0" data-sc="${a}-${b}|0" value="${rlEsc(v[0])}" style="width:56px;padding:8px;font-size:1.1rem;text-align:center"><span>–</span><input type="number" inputmode="numeric" min="0" data-sc="${a}-${b}|1" value="${rlEsc(v[1])}" style="width:56px;padding:8px;font-size:1.1rem;text-align:center">${bkBadge(b)}<span style="font-size:0.66rem;color:var(--muted);margin-left:4px;flex:1;min-width:0">Arbitre et observe : les 2 autres équipes</span></div>`; }).join('')}</div>`).join('')
  + `<div class="card" style="padding:8px 10px;margin-bottom:8px;overflow-x:auto"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Classement</div><table style="width:100%;border-collapse:collapse;font-size:0.8rem"><tr style="text-align:left;color:var(--muted)"><th>#</th><th>Équipe</th><th>V</th><th>N</th><th>D</th><th>+/−</th><th>Pts</th><th>Perf /5</th></tr>${cls.map((e, k) => `<tr style="border-top:1px solid var(--border)"><td>${k + 1}</td><td>${bkBadge(e.i)}</td><td>${e.V}</td><td>${e.N}</td><td>${e.D}</td><td>${e.diff > 0 ? '+' : ''}${e.diff}</td><td><b>${e.pts}</b></td><td><b>${bkPerf(e, n) ?? '—'}</b></td></tr>`).join('')}</table><div style="font-size:0.68rem;color:var(--muted);margin-top:6px">Victoire 3 pts, nul 1 pt. La note Performance suit le barème : 3 victoires = 5, 2 = 4, 1 victoire et 1 nul = 3, 1 victoire = 2, aucune = 1.</div></div>
  <div class="card" style="padding:8px 12px;font-size:0.76rem;line-height:1.5">${Array.from({ length: n }, (_, i) => `<div style="margin-bottom:3px">${bkBadge(i)} ${compo(i)}</div>`).join('')}</div>`;
  el.oninput = (e) => { const k = e.target.dataset.sc; if (!k) return; const [key, i] = k.split('|'); d.scores[s] = d.scores[s] || {}; const v = d.scores[s][key] = d.scores[s][key] || ['', '']; v[+i] = e.target.value; bkSauver(cl, d); };
  el.onchange = (e) => { if (e.target.dataset.sc) bkTabTournoi(); };
}

/* ── Notation ── */
function bkTabNota() {
  const cl = bkSt.cl, s = bkSt.s, d = bkLire(cl), n = d.nb, el = document.getElementById('bkTab');
  const act = Array.from({ length: n }, (_, i) => i).filter((i) => bkMembres(d, s, i, cl).length);
  if (!act.length) { el.innerHTML = `<div class="card" style="padding:12px;font-size:0.85rem">Forme d'abord les équipes de la séance ${s}.</div>`; return; }
  if (!act.includes(bkSt.g)) bkSt.g = act[0];
  const g = bkSt.g, cls = bkClassement(d, s, n), e = cls.find((x) => x.i === g), perf = bkPerf(e, n), mem = bkMembres(d, s, g, cl);
  const chip = (on, col) => `border:2px solid ${col};background:${on ? col : 'transparent'};color:${on ? '#fff' : 'inherit'};border-radius:9px;font:700 0.72rem inherit;font-family:inherit;cursor:pointer;padding:6px 8px`;
  const pts = (v, m) => (v === null || v === undefined ? '—' : v + '/' + m);
  const carte = (nom) => {
    const o = (d.obs[s] || {})[nom] || {}, a = (d.arb[s] || {})[nom] || [], b = bkBilanEleve(d, s, nom, perf);
    const ligne = (c) => `<div style="margin-top:6px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">${c.t} · ${pts(b[c.id], c.max)}</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:3px">${c.items.map(([l, full], k) => `<button type="button" title="${rlEsc(full)}" data-o="${rlEsc(nom)}|${c.id}|${k}" style="${chip((o[c.id] || [])[k], '#2a9d8f')}">${l}</button>`).join('')}</div></div>`;
    return `<div class="card" style="padding:8px 12px;margin-bottom:8px"><b style="font-size:0.92rem">${rlEsc(nom)}</b>${BK_CRIT.map(ligne).join('')}<div style="margin-top:6px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">⚖️ Arbitrage · ${pts(b.arb, 4)} (laisse vide s'il n'a pas arbitré)</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:3px">${BK_ARB.map((l, k) => `<button type="button" data-a="${rlEsc(nom)}|${k}" style="${chip(a[k], '#d98a00')}">${l}</button>`).join('')}</div></div></div>`;
  };
  const recap = mem.map((nom) => { const b = bkBilanEleve(d, s, nom, perf); const jeu = b.dem === null || b.pass === null || b.esp === null ? null : b.dem + b.pass + b.esp; const ok = perf !== null && jeu !== null && b.def !== null; const tot = ok ? perf + jeu + b.def + (b.arb === null ? 0 : b.arb) : null; return `<tr><td>${rlEsc(nom)}</td><td>${pts(perf, 5)}</td><td>${pts(jeu, 8)}</td><td>${pts(b.def, 3)}</td><td>${pts(b.arb, 4)}</td><td><b>${tot === null ? '—' : (b.arb === null ? Math.round(tot / 16 * 20 * 2) / 2 : tot) + '/20'}</b></td></tr>`; }).join('');
  el.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${act.map((x) => `<button type="button" data-gz="${x}" style="border:2px solid ${RL_COL[x % 6]};background:${x === g ? RL_COL[x % 6] : '#fff'};color:${x === g ? '#fff' : 'inherit'};border-radius:10px;padding:6px 10px;font:700 0.8rem inherit;font-family:inherit;cursor:pointer">É${x + 1}</button>`).join('')}</div>
  <div class="card" style="padding:10px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">⚡ Performance de l'équipe (tournoi)</div><div style="font-weight:800;font-size:1.2rem">${pts(perf, 5)}</div><div style="font-size:0.72rem;color:var(--muted)">${e.j < n - 1 ? 'Il reste ' + (n - 1 - e.j) + ' match(s) à saisir dans l\'onglet Tournoi.' : e.V + ' victoire(s), ' + e.N + ' nul(s), ' + e.D + ' défaite(s).'}</div></div>
  <div style="font-size:0.72rem;color:var(--muted);margin-bottom:8px">Coche ce que tu vois pendant les matchs : chaque case coche = 1 point sur le critère. Passe le téléphone à l'observateur de l'équipe si tu veux.</div>
  ${mem.map(carte).join('')}
  <div class="card" style="padding:8px 10px;margin-bottom:8px;overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.76rem"><tr style="text-align:left;color:var(--muted)"><th>Élève</th><th>Perf</th><th>Jeu</th><th>Défense</th><th>Arb.</th><th>Total</th></tr>${recap}</table></div>
  <button type="button" class="btn btn-teal" id="bkReport" style="width:100%">📥 Reporter les notes dans le barème (${cl})</button>
  <button type="button" class="btn btn-outline" id="bkImp" style="margin-top:8px;width:100%">🖨️ Fiche papier d'observation</button>`;
  const garde = () => d;
  el.onclick = (ev) => {
    const t = ev.target, gb = t.closest('button[data-gz]'), ob = t.closest('button[data-o]'), ab = t.closest('button[data-a]');
    if (gb) { bkSt.g = +gb.dataset.gz; bkTabNota(); return; }
    if (ob) { const [nom, c, k] = ob.dataset.o.split('|'); d.obs[s] = d.obs[s] || {}; const x = d.obs[s][nom] = d.obs[s][nom] || {}; x[c] = x[c] || []; x[c][+k] = !x[c][+k]; }
    else if (ab) { const [nom, k] = ab.dataset.a.split('|'); d.arb[s] = d.arb[s] || {}; const x = d.arb[s][nom] = d.arb[s][nom] || []; x[+k] = !x[+k]; }
    else if (t.closest('#bkReport')) { bkReporter(cl, s, g); return; }
    else if (t.closest('#bkImp')) { bkImprimer(cl, s); return; }
    else return;
    bkSauver(cl, garde()); bkTabNota();
  };
}
function bkReporter(cl, s, g) {
  const d = bkLire(cl), n = d.nb, cls = bkClassement(d, s, n), perf = bkPerf(cls.find((x) => x.i === g), n), mem = bkMembres(d, s, g, cl);
  if (perf === null) { showToast('Saisis d\'abord tous les matchs de l\'équipe'); return; }
  const manque = mem.filter((nom) => { const b = bkBilanEleve(d, s, nom, perf); return b.dem === null || b.pass === null || b.esp === null || b.def === null; });
  if (manque.length) { showToast('Observation à cocher pour ' + manque[0] + (manque.length > 1 ? ' et ' + (manque.length - 1) + ' autre(s)' : '')); return; }
  const k = 'notes-' + currentYear; let N = {}; try { N = JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) {}
  N.basket = N.basket || {}; const arr = (N.basket[cl] = N.basket[cl] || []);
  mem.forEach((nom) => {
    const b = bkBilanEleve(d, s, nom, perf); const sc = { perf, jeu_dem: b.dem, jeu_pass: b.pass, jeu_esp: b.esp, arb: b.arb === null ? 'na' : b.arb, def: b.def };
    let tot = perf + b.dem + b.pass + b.esp + b.def + (b.arb === null ? 0 : b.arb); if (b.arb === null) tot = Math.round(tot / 16 * 20 * 2) / 2;
    const e = { prenom: nom, scores: sc, total: tot, max: 20 }; const i = arr.findIndex((x) => x.prenom === nom); if (i >= 0) arr[i] = e; else arr.push(e);
  });
  try { localStorage.setItem(k, JSON.stringify(N)); } catch (e) {}
  if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
  const f = document.getElementById('baremesFrame'); if (f && f.getAttribute('src')) f.setAttribute('src', 'baremes.html?v=' + Date.now());
  showToast('📥 ' + mem.length + ' notes reportées dans le barème ' + cl);
}
function bkImprimer(cl, s) {
  const d = bkLire(cl), n = d.nb;
  const fiche = (i) => { const m = bkMembres(d, s, i, cl); const cols = BK_CRIT.flatMap((c) => c.items.map(([l]) => `${c.t.slice(0, 3)}. ${l}`)).concat(BK_ARB);
    return `<div class="f"><h2>Équipe ${i + 1}</h2><table><tr><th>Élève</th>${cols.map((c) => `<th class="v">${rlEsc(c)}</th>`).join('')}</tr>${m.map((x) => `<tr><td>${rlEsc(x)}</td>${cols.map(() => '<td>☐</td>').join('')}</tr>`).join('')}</table></div>`; };
  docImprimerHtml(`<html><head><style>@page{size:A4 landscape;margin:8mm}h1{font-size:13pt;margin:0 0 3mm}.f{margin-bottom:5mm;break-inside:avoid}h2{font-size:11pt;margin:0 0 1.5mm}table{width:100%;border-collapse:collapse;font-size:8.5pt}th,td{border:0.3mm solid #333;padding:1.5mm;text-align:center}td:first-child,th:first-child{text-align:left;width:26mm}th.v{font-size:7pt;font-weight:600}td{font-size:11pt}</style></head><body><h1>Basket · ${cl} · Séance ${s} : fiche d'observation (1 case = 1 point)</h1>${Array.from({ length: n }, (_, i) => fiche(i)).join('')}</body></html>`);
}

/* ── Accueil ── */
function boutonBasket(sd, cl, col, num, petit) {
  if (!sd || sd.id !== 'basket' || cl === '6e') return '';
  if (petit) return `<button onclick="basketOuvrir('${cl}',${num || 1})" title="Basket : équipes, tournoi, notation" style="flex-shrink:0;background:${col};color:#fff;border:none;border-radius:7px;width:30px;height:30px;font-size:0.85rem;cursor:pointer;display:flex;align-items:center;justify-content:center">🏀</button>`;
  return `<button onclick="basketOuvrir('${cl}',${num || 1})" title="Équipes, tournoi et notation du basket" style="background:${col};color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif">🏀 Basket</button>`;
}
