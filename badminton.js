/* badminton.js : tournoi montante-descendante (en simple), terrain final → note de Performance,
   notation par cases (Technique et tactique, Arbitrage) reliée au barème 5e/4e/3e. Chargé après relais.js.
   Données : bad-<année>-<classe> = { nbT, niveau:{nom:'A|B|C'}, s:{ sN:{ present:[noms], init:[[noms par terrain]], win:{'r|t':nom}, obs:{nom:{traj,frapp,depl:[bool]}}, arb:{nom:[bool]} } } }
   Règle : sur chaque terrain, les 2 premiers de la file jouent, les autres arbitrent / observent. Le gagnant monte, le perdant descend. */

let bdSt = { cl: '5e', s: 1, tab: 'tournoi' };
const BD_NSEANCES = 12;
const BD_CRIT = [
  { id: 'traj', t: 'Trajectoires', max: 4, items: [['Joue loin', 'Joue loin (fond de court)'], ['Joue court', 'Joue court (devant le filet)'], ['Gauche / droite', 'Dirige à gauche et à droite'], ['Varie', 'Varie les trajectoires']] },
  { id: 'frapp', t: 'Frappes', max: 4, items: [['Service long', 'Service long réussi'], ['Service court', 'Service court réussi'], ['Frappe efficace', 'Frappe efficace (dégagé, amorti)'], ['Met en difficulté', 'Met l\'adversaire en difficulté']] },
  { id: 'depl', t: 'Déplacements', max: 2, items: [['Va chercher le volant', 'Va chercher le volant'], ['Retour au centre', 'Retour au centre après la frappe']] }
];
const BD_ARB = ['Annonce le score', 'Applique les règles', 'Gère les litiges'];
const bdCle = (cl) => 'bad-' + currentYear + '-' + cl;
function bdLire(cl) { let o = {}; try { o = JSON.parse(localStorage.getItem(bdCle(cl)) || '{}'); } catch (e) { o = {}; } return Object.assign({ nbT: 4, niveau: {}, s: {} }, o); }
function bdSauver(cl, d) { try { localStorage.setItem(bdCle(cl), JSON.stringify(d)); } catch (e) {} if (typeof scheduleCloudSync === 'function') scheduleCloudSync(); }
const bdEleves = (cl) => (getEleves(currentYear)[cl] || []).slice();
function bdSeance(d, s) { return (d.s[s] = d.s[s] || { present: [], init: [], win: {}, obs: {}, arb: {} }); }

/* ── Répartition de départ : les plus forts sur le terrain 1 ── */
function bdRepartir(noms, niveau, nbT) {
  const rang = (n) => ({ A: 0, B: 1, C: 2 })[niveau[n]] ?? 1;
  const tri = noms.slice().sort((a, b) => rang(a) - rang(b));
  const T = Array.from({ length: nbT }, () => []); const base = Math.floor(tri.length / nbT), plus = tri.length % nbT; let k = 0;
  for (let t = 0; t < nbT; t++) { const m = base + (t < plus ? 1 : 0); for (let i = 0; i < m; i++) T[t].push(tri[k++]); }
  return T;
}
/* ── Simulation : tours joués à partir de la répartition et des gagnants choisis ── */
function bdSimuler(init, win) {
  let cur = init.map((t) => t.slice()); const tours = [];
  for (let r = 0; r < 8; r++) {
    const matchs = cur.map((t, i) => (t.length >= 2 ? { t: i, a: t[0], b: t[1], w: win[r + '|' + i] || '' } : null));
    const complet = matchs.every((m) => !m || [m.a, m.b].includes(m.w));
    tours.push({ terrains: cur.map((t) => t.slice()), matchs, complet });
    if (!complet) break;
    const nxt = cur.map((t) => t.slice(2));
    matchs.forEach((m) => {
      if (!m) return; const g = m.w, p = m.w === m.a ? m.b : m.a;
      nxt[Math.max(0, m.t - 1)].push(g); nxt[Math.min(cur.length - 1, m.t + 1)].push(p);
    });
    // gagnant du terrain du haut reste en haut, perdant du bas reste en bas : les files gardent leur taille
    cur = nxt;
  }
  return tours;
}
function bdFinal(init, win) {
  const tours = bdSimuler(init, win), faits = tours.filter((t) => t.complet).length;
  if (!faits) return { rang: {}, faits: 0 };
  const rang = {}; bdApres(tours[faits - 1]).forEach((t, i) => t.forEach((n) => { rang[n] = i + 1; }));
  return { rang, faits };
}
function bdApres(tour) {
  const nxt = tour.terrains.map((t) => t.slice(2));
  tour.matchs.forEach((m) => { if (!m) return; const g = m.w, p = m.w === m.a ? m.b : m.a; nxt[Math.max(0, m.t - 1)].push(g); nxt[Math.min(tour.terrains.length - 1, m.t + 1)].push(p); });
  return nxt;
}
// Points du terrain : haut = 6, bas = 2, intermédiaires proportionnels (même règle que l'onglet Barèmes)
function bdPtsTerrain(rang, n) { return n <= 1 ? 6 : Math.round(6 - (6 - 2) * (rang - 1) / (n - 1)); }
const bdPtsCrit = (t) => (t || []).filter(Boolean).length;
function bdPtsArb(t) { t = t || []; const [sc, re, li] = [!!t[0], !!t[1], !!t[2]]; if (!sc && !re && !li) return null; if (!sc) return 1; return re && li ? 4 : re ? 3 : 2; }
function bdBilan(d, s, nom, perf) {
  const o = (bdSeance(d, s).obs[nom]) || {}; const r = { perf };
  BD_CRIT.forEach((c) => { r[c.id] = (o[c.id] || []).some(Boolean) ? bdPtsCrit(o[c.id]) : null; });
  r.arb = bdPtsArb(bdSeance(d, s).arb[nom]); return r;
}

/* ── Écran ── */
function badmintonHtml() { return '<div id="bdRoot"></div>'; }
function badmintonOuvrir(cl, s) { if (cl) bdSt.cl = cl; if (s) bdSt.s = Math.min(BD_NSEANCES, Math.max(1, +s)); docSpecialOuvrir('badminton'); }
function badmintonRendre() {
  const root = document.getElementById('bdRoot'); if (!root) return;
  const T = [['tournoi', '🏸 Tournoi'], ['nota', '✅ Notation']];
  root.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
    <label style="font-size:0.66rem;font-weight:700;color:var(--muted)">Classe<select id="bdCl" style="width:100%;padding:8px;font-size:1rem">${['5e', '4e', '3e'].map((c) => `<option${c === bdSt.cl ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
    <label style="font-size:0.66rem;font-weight:700;color:var(--muted)">Séance<select id="bdS" style="width:100%;padding:8px;font-size:1rem">${Array.from({ length: BD_NSEANCES }, (_, i) => `<option value="${i + 1}"${i + 1 === bdSt.s ? ' selected' : ''}>Séance ${i + 1}</option>`).join('')}</select></label></div>
  <div style="display:flex;gap:4px;margin-bottom:10px" id="bdTabs">${T.map(([k, l]) => `<button type="button" data-tab="${k}" style="flex:1;border:0;border-radius:9px;padding:9px 2px;font:700 0.76rem inherit;font-family:inherit;cursor:pointer;background:${bdSt.tab === k ? '#0e7c7b' : '#d9efee'};color:${bdSt.tab === k ? '#fff' : '#0a5a5a'}">${l}</button>`).join('')}</div><div id="bdTab"></div>`;
  document.getElementById('bdCl').onchange = (e) => { bdSt.cl = e.target.value; badmintonRendre(); };
  document.getElementById('bdS').onchange = (e) => { bdSt.s = +e.target.value; badmintonRendre(); };
  document.getElementById('bdTabs').onclick = (e) => { const b = e.target.closest('button[data-tab]'); if (b) { bdSt.tab = b.dataset.tab; badmintonRendre(); } };
  (bdSt.tab === 'nota' ? bdTabNota : bdTabTournoi)();
}
// Nom d'un terrain : 1 2 3 4 ou A B C D (au choix, réglé dans l'écran du tournoi). Le premier (1 ou A) est le terrain du haut.
const bdNomT = (i) => (bdLire(bdSt.cl).nomT === 'let' ? 'ABCDEF'[i] : String(i + 1));
const bdBadge = (t) => `<span style="font-size:0.7rem;font-weight:700;border-radius:99px;padding:2px 8px;color:#fff;background:${RL_COL[t % 6]};white-space:nowrap">Terrain ${bdNomT(t)}</span>`;

function bdTabTournoi() {
  const cl = bdSt.cl, s = bdSt.s, d = bdLire(cl), S = bdSeance(d, s), noms = bdEleves(cl), el = document.getElementById('bdTab');
  if (!noms.length) { el.innerHTML = `<div class="card" style="padding:12px;font-size:0.85rem">Aucun élève en ${cl}. Ajoute-les dans « Élèves ».</div>`; return; }
  const pill = (x) => { const v = d.niveau[x]; return `<button type="button" data-niv="${rlEsc(x)}" style="border:1.5px solid ${v ? RL_NIV[v] : 'var(--border)'};background:${v ? RL_NIV[v] : 'transparent'};color:${v ? '#fff' : 'var(--muted)'};border-radius:99px;width:30px;height:26px;font:700 0.72rem inherit;font-family:inherit;cursor:pointer" aria-label="Niveau de ${rlEsc(x)}">${v || '–'}</button>`; };
  const placed = S.init.flat();
  let h = `<div class="card" style="padding:10px 12px;margin-bottom:8px"><div style="display:flex;gap:8px;align-items:end"><label style="font-size:0.66rem;font-weight:700;color:var(--muted);flex:1">Nombre de terrains<select id="bdNbT" style="width:100%;padding:7px;font-size:1rem">${[2, 3, 4, 5, 6].map((x) => `<option${x === d.nbT ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
    <label style="font-size:0.66rem;font-weight:700;color:var(--muted);flex:1">Noms des terrains<select id="bdNomT" style="width:100%;padding:7px;font-size:1rem"><option value="num"${d.nomT !== 'let' ? ' selected' : ''}>1 2 3 4</option><option value="let"${d.nomT === 'let' ? ' selected' : ''}>A B C D</option></select></label></div><div style="font-size:0.76rem;color:var(--muted);margin-top:6px">${S.present.length} présent(s) · le terrain ${bdNomT(0)} est celui du haut (le meilleur)</div>
    <div style="font-size:0.7rem;color:var(--muted);margin-top:6px">Coche les présents, donne un niveau (A, B, C) puis « Répartir » : les plus forts partent sur le terrain 1.</div></div>
  <div class="card" style="padding:2px 10px;margin-bottom:8px" id="bdList">${noms.map((x) => `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--border)"><label style="display:flex;align-items:center;gap:9px;flex:1;min-width:0;cursor:pointer"><input type="checkbox" data-p="${rlEsc(x)}" ${S.present.includes(x) ? 'checked' : ''} style="width:20px;height:20px"><span style="font-size:0.9rem">${rlEsc(x)}</span></label>${pill(x)}</div>`).join('')}</div>
  <button type="button" class="btn btn-teal" id="bdRep" style="width:100%;margin-bottom:8px">🏸 Répartir sur les terrains</button>`;
  if (S.init.length) {
    h += `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Départ (tape ◀ ▶ pour déplacer un élève avant le 1er tour)</div>${S.init.map((t, i) => `<div style="margin-top:6px">${bdBadge(i)} ${t.map((n) => `<span style="display:inline-flex;align-items:center;gap:2px;margin:2px 6px 2px 0;font-size:0.82rem">${S.win && Object.keys(S.win).length ? '' : `<button type="button" data-mv="${rlEsc(n)}|-1" style="border:0;background:transparent;cursor:pointer;padding:0 2px">◀</button>`}${rlEsc(n)}${S.win && Object.keys(S.win).length ? '' : `<button type="button" data-mv="${rlEsc(n)}|1" style="border:0;background:transparent;cursor:pointer;padding:0 2px">▶</button>`}</span>`).join('') || '<i>vide</i>'}</div>`).join('')}</div>`;
    const tours = bdSimuler(S.init, S.win);
    tours.forEach((tr, r) => {
      h += `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Tour ${r + 1} · qui a gagné ?</div>${tr.matchs.map((m, i) => !m ? `<div style="padding:6px 0;border-top:1px solid var(--border);font-size:0.78rem">${bdBadge(i)} <i>pas de match</i></div>` : `<div style="padding:8px 0;border-top:1px solid var(--border)"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">${bdBadge(i)}<span style="font-size:0.7rem;color:var(--muted)">Arbitre et observe : ${tr.terrains[i].slice(2).map(rlEsc).join(', ') || 'personne'}</span></div><div style="display:flex;gap:6px">${[m.a, m.b].map((n) => `<button type="button" data-w="${r}|${i}|${rlEsc(n)}" style="flex:1;border:2px solid #0e7c7b;background:${m.w === n ? '#0e7c7b' : 'transparent'};color:${m.w === n ? '#fff' : 'inherit'};border-radius:9px;padding:10px 4px;font:700 0.86rem inherit;font-family:inherit;cursor:pointer">${m.w === n ? '🏆 ' : ''}${rlEsc(n)}</button>`).join('')}</div></div>`).join('')}</div>`;
    });
    const F = bdFinal(S.init, S.win), n = S.init.length;
    if (F.faits) h += `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Terrain atteint après ${F.faits} tour(s) · Performance /6</div>${Array.from({ length: n }, (_, i) => { const l = Object.keys(F.rang).filter((k) => F.rang[k] === i + 1); return `<div style="padding:5px 0;border-top:1px solid var(--border);font-size:0.84rem">${bdBadge(i)} <b>${bdPtsTerrain(i + 1, n)} pts</b> · ${l.map(rlEsc).join(', ') || '—'}</div>`; }).join('')}</div>`;
    h += `<button type="button" class="btn btn-outline" id="bdReset" style="width:100%;margin-bottom:8px">Recommencer le tournoi</button>`;
  }
  el.innerHTML = h;
  const sauver = () => { bdSauver(cl, d); bdTabTournoi(); };
  document.getElementById('bdNomT').onchange = (e) => { d.nomT = e.target.value; sauver(); };
  document.getElementById('bdNbT').onchange = (e) => { d.nbT = +e.target.value; S.init = []; S.win = {}; sauver(); };
  document.getElementById('bdList').onchange = (e) => { const x = e.target.dataset.p; if (x === undefined) return; S.present = e.target.checked ? S.present.concat(x) : S.present.filter((y) => y !== x); S.init = []; S.win = {}; sauver(); };
  document.getElementById('bdList').onclick = (e) => { const b = e.target.closest('button[data-niv]'); if (!b) return; const x = b.dataset.niv; const nx = { undefined: 'A', A: 'B', B: 'C', C: undefined }[d.niveau[x]]; if (nx) d.niveau[x] = nx; else delete d.niveau[x]; sauver(); };
  document.getElementById('bdRep').onclick = () => { if (S.present.length < 2 * d.nbT && S.present.length < 4) { showToast('Il faut au moins 4 élèves présents'); return; } S.init = bdRepartir(S.present, d.niveau, d.nbT); S.win = {}; sauver(); };
  el.onclick = (e) => {
    const w = e.target.closest('button[data-w]'), mv = e.target.closest('button[data-mv]');
    if (w) { const [r, i, n] = w.dataset.w.split('|'); const k = r + '|' + i; const nw = {}; Object.keys(S.win).forEach((x) => { if (+x.split('|')[0] < +r || x === k) nw[x] = S.win[x]; }); S.win = nw; S.win[k] = S.win[k] === n ? undefined : n; if (!S.win[k]) delete S.win[k]; sauver(); }
    else if (mv) { const [n, dir] = mv.dataset.mv.split('|'); const i = S.init.findIndex((t) => t.includes(n)), j = i + +dir; if (j < 0 || j >= S.init.length) return; S.init[i] = S.init[i].filter((x) => x !== n); S.init[j].push(n); sauver(); }
    else if (e.target.closest('#bdReset')) { S.win = {}; sauver(); }
  };
}

function bdTabNota() {
  const cl = bdSt.cl, s = bdSt.s, d = bdLire(cl), S = bdSeance(d, s), el = document.getElementById('bdTab');
  if (!S.init.length) { el.innerHTML = `<div class="card" style="padding:12px;font-size:0.85rem">Fais d'abord le tournoi de la séance ${s} (onglet Tournoi).</div>`; return; }
  const F = bdFinal(S.init, S.win), n = S.init.length, mem = S.present;
  const chip = (on, col) => `border:2px solid ${col};background:${on ? col : 'transparent'};color:${on ? '#fff' : 'inherit'};border-radius:9px;font:700 0.72rem inherit;font-family:inherit;cursor:pointer;padding:6px 8px`;
  const pts = (v, m) => (v === null || v === undefined ? '—' : v + '/' + m);
  const perfDe = (nom) => (F.rang[nom] ? bdPtsTerrain(F.rang[nom], n) : null);
  const carte = (nom) => {
    const o = S.obs[nom] || {}, a = S.arb[nom] || [], b = bdBilan(d, s, nom, perfDe(nom));
    const ligne = (c) => `<div style="margin-top:6px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">${c.t} · ${pts(b[c.id], c.max)}</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:3px">${c.items.map(([l, full], k) => `<button type="button" title="${rlEsc(full)}" data-o="${rlEsc(nom)}|${c.id}|${k}" style="${chip((o[c.id] || [])[k], '#2a9d8f')}">${l}</button>`).join('')}</div></div>`;
    return `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><b style="font-size:0.92rem">${rlEsc(nom)}</b><span style="font-size:0.76rem;color:var(--muted)">Performance : <b>${pts(b.perf, 6)}</b>${F.rang[nom] ? ' (terrain ' + bdNomT(F.rang[nom] - 1) + ')' : ''}</span></div>${BD_CRIT.map(ligne).join('')}<div style="margin-top:6px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">⚖️ Arbitrage · ${pts(b.arb, 4)} (vide s'il n'a pas arbitré)</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:3px">${BD_ARB.map((l, k) => `<button type="button" data-a="${rlEsc(nom)}|${k}" style="${chip(a[k], '#d98a00')}">${l}</button>`).join('')}</div></div></div>`;
  };
  const recap = mem.map((nom) => { const b = bdBilan(d, s, nom, perfDe(nom)); const tech = b.traj === null || b.frapp === null || b.depl === null ? null : b.traj + b.frapp + b.depl; const ok = b.perf !== null && tech !== null; const tot = ok ? b.perf + tech + (b.arb === null ? 0 : b.arb) : null; return `<tr><td>${rlEsc(nom)}</td><td>${pts(b.perf, 6)}</td><td>${pts(tech, 10)}</td><td>${pts(b.arb, 4)}</td><td><b>${tot === null ? '—' : (b.arb === null ? Math.round(tot / 16 * 20 * 2) / 2 : tot) + '/20'}</b></td></tr>`; }).join('');
  el.innerHTML = `<div style="font-size:0.72rem;color:var(--muted);margin-bottom:8px">${F.faits ? 'Performance calculée avec le terrain atteint après ' + F.faits + ' tour(s).' : 'Joue au moins un tour pour obtenir la Performance.'} Coche ce que tu vois : 1 case = 1 point.</div>${mem.map(carte).join('')}
  <div class="card" style="padding:8px 10px;margin-bottom:8px;overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.76rem"><tr style="text-align:left;color:var(--muted)"><th>Élève</th><th>Perf</th><th>Technique</th><th>Arb.</th><th>Total</th></tr>${recap}</table></div>
  <button type="button" class="btn btn-teal" id="bdReport" style="width:100%">📥 Reporter les notes dans le barème (${cl})</button>
  <button type="button" class="btn btn-outline" id="bdImp" style="margin-top:8px;width:100%">🖨️ Fiche papier d'observation</button>`;
  el.onclick = (ev) => {
    const t = ev.target, ob = t.closest('button[data-o]'), ab = t.closest('button[data-a]');
    if (ob) { const [nom, c, k] = ob.dataset.o.split('|'); const x = S.obs[nom] = S.obs[nom] || {}; x[c] = x[c] || []; x[c][+k] = !x[c][+k]; }
    else if (ab) { const [nom, k] = ab.dataset.a.split('|'); const x = S.arb[nom] = S.arb[nom] || []; x[+k] = !x[+k]; }
    else if (t.closest('#bdReport')) { bdReporter(cl, s); return; }
    else if (t.closest('#bdImp')) { bdImprimer(cl, s); return; }
    else return;
    bdSauver(cl, d); bdTabNota();
  };
}
function bdReporter(cl, s) {
  const d = bdLire(cl), S = bdSeance(d, s), F = bdFinal(S.init, S.win), n = S.init.length;
  if (!F.faits) { showToast('Joue au moins un tour du tournoi'); return; }
  const manque = S.present.filter((nom) => { const b = bdBilan(d, s, nom, 1); return b.traj === null || b.frapp === null || b.depl === null; });
  if (manque.length) { showToast('Technique à cocher pour ' + manque[0] + (manque.length > 1 ? ' et ' + (manque.length - 1) + ' autre(s)' : '')); return; }
  const k = 'notes-' + currentYear; let N = {}; try { N = JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) {}
  N.badminton = N.badminton || {}; const arr = (N.badminton[cl] = N.badminton[cl] || []);
  S.present.forEach((nom) => {
    const perf = bdPtsTerrain(F.rang[nom] || n, n), b = bdBilan(d, s, nom, perf);
    const sc = { perf, tech_traj: b.traj, tech_frapp: b.frapp, tech_depl: b.depl, arb: b.arb === null ? 'na' : b.arb };
    let tot = perf + b.traj + b.frapp + b.depl + (b.arb === null ? 0 : b.arb); if (b.arb === null) tot = Math.round(tot / 16 * 20 * 2) / 2;
    const e = { prenom: nom, scores: sc, total: tot, max: 20 }; const i = arr.findIndex((x) => x.prenom === nom); if (i >= 0) arr[i] = e; else arr.push(e);
  });
  try { localStorage.setItem(k, JSON.stringify(N)); } catch (e) {}
  if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
  const f = document.getElementById('baremesFrame'); if (f && f.getAttribute('src')) f.setAttribute('src', 'baremes.html?v=' + Date.now());
  showToast('📥 ' + S.present.length + ' notes reportées dans le barème ' + cl);
}
function bdImprimer(cl, s) {
  const d = bdLire(cl), S = bdSeance(d, s); const cols = BD_CRIT.flatMap((c) => c.items.map(([l]) => `${c.t.slice(0, 4)}. ${l}`)).concat(BD_ARB);
  docImprimerHtml(`<html><head><style>@page{size:A4 landscape;margin:8mm}h1{font-size:13pt;margin:0 0 3mm}table{width:100%;border-collapse:collapse;font-size:8.5pt}th,td{border:0.3mm solid #333;padding:1.5mm;text-align:center}td:first-child,th:first-child{text-align:left;width:26mm}th.v{font-size:7pt;font-weight:600}td{font-size:11pt}</style></head><body><h1>Badminton · ${cl} · Séance ${s} : fiche d'observation (1 case = 1 point)</h1><table><tr><th>Élève</th>${cols.map((c) => `<th class="v">${rlEsc(c)}</th>`).join('')}</tr>${S.present.map((x) => `<tr><td>${rlEsc(x)}</td>${cols.map(() => '<td>☐</td>').join('')}</tr>`).join('')}</table></body></html>`);
}

function boutonBadminton(sd, cl, col, num, petit) {
  if (!sd || sd.id !== 'badminton' || cl === '6e') return '';
  if (petit) return `<button onclick="badmintonOuvrir('${cl}',${num || 1})" title="Badminton : tournoi et notation" style="flex-shrink:0;background:${col};color:#fff;border:none;border-radius:7px;width:30px;height:30px;font-size:0.85rem;cursor:pointer;display:flex;align-items:center;justify-content:center">🏸</button>`;
  return `<button onclick="badmintonOuvrir('${cl}',${num || 1})" title="Tournoi montante-descendante et notation" style="background:${col};color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif">🏸 Badminton</button>`;
}
