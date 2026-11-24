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
function badmintonOuvrir(cl, s, ev) {
  if (cl) bdSt.cl = cl; if (s) bdSt.s = Math.min(BD_NSEANCES, Math.max(1, +s));
  if (ev) { const d = bdLire(bdSt.cl), S = bdSeance(d, bdSt.s); if (S.eval === undefined) { S.eval = true; S.mode = 'direct'; bdSauver(bdSt.cl, d); } bdSt.tab = 'tournoi'; }
  docSpecialOuvrir('badminton');
}
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
const bdBadge = (t) => `<span style="font-size:0.7rem;font-weight:700;border-radius:99px;padding:2px 8px;color:#fff;background:${RL_COL[t % 6]}">T${t + 1}</span>`;

function bdTabTournoi() {
  const cl = bdSt.cl, s = bdSt.s, d = bdLire(cl), S = bdSeance(d, s), noms = bdEleves(cl), el = document.getElementById('bdTab');
  if (!noms.length) { el.innerHTML = `<div class="card" style="padding:12px;font-size:0.85rem">Aucun élève en ${cl}. Ajoute-les dans « Élèves ».</div>`; return; }
  const pill = (x) => { const v = d.niveau[x]; return `<button type="button" data-niv="${rlEsc(x)}" style="border:1.5px solid ${v ? RL_NIV[v] : 'var(--border)'};background:${v ? RL_NIV[v] : 'transparent'};color:${v ? '#fff' : 'var(--muted)'};border-radius:99px;width:30px;height:26px;font:700 0.72rem inherit;font-family:inherit;cursor:pointer" aria-label="Niveau de ${rlEsc(x)}">${v || '–'}</button>`; };
  const placed = S.init.flat();
  let h = `<div class="card" style="padding:10px 12px;margin-bottom:8px"><div style="display:flex;gap:8px;align-items:end"><label style="font-size:0.66rem;font-weight:700;color:var(--muted);flex:1">Nombre de terrains<select id="bdNbT" style="width:100%;padding:7px;font-size:1rem">${[2, 3, 4, 5, 6].map((x) => `<option${x === d.nbT ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
    <div style="flex:1;font-size:0.76rem;color:var(--muted)">${S.present.length} présent(s)</div></div>
    <div style="font-size:0.7rem;color:var(--muted);margin-top:6px">Coche les présents, donne un niveau (A, B, C) puis « Répartir » : les plus forts partent sur le terrain 1.</div></div>
  <div class="card" style="padding:2px 10px;margin-bottom:8px" id="bdList">${noms.map((x) => `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--border)"><label style="display:flex;align-items:center;gap:9px;flex:1;min-width:0;cursor:pointer"><input type="checkbox" data-p="${rlEsc(x)}" ${S.present.includes(x) ? 'checked' : ''} style="width:20px;height:20px"><span style="font-size:0.9rem">${rlEsc(x)}</span></label>${pill(x)}</div>`).join('')}</div>
  <button type="button" class="btn btn-teal" id="bdRep" style="width:100%;margin-bottom:8px">🏸 Répartir sur les terrains</button>
  <div class="card" style="padding:10px 12px;margin-bottom:8px"><div style="display:flex;gap:8px;flex-wrap:wrap"><label style="font-size:0.66rem;font-weight:700;color:var(--muted);flex:1;min-width:130px">Tournoi<select id="bdEval" style="width:100%;padding:7px;font-size:0.95rem"><option value="0"${S.eval ? '' : ' selected'}>Entraînement (par tours)</option><option value="1"${S.eval ? ' selected' : ''}>Évaluation</option></select></label>${S.eval ? `<label style="font-size:0.66rem;font-weight:700;color:var(--muted);flex:1;min-width:150px">Montée<select id="bdMode" style="width:100%;padding:7px;font-size:0.95rem"><option value="direct"${S.mode !== 'groupe' ? ' selected' : ''}>Après chaque match</option><option value="groupe"${S.mode === 'groupe' ? ' selected' : ''}>Après la poule</option></select></label>` : ''}</div></div>`;
  if (S.init.length) {
    h += `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Départ (tape ◀ ▶ pour déplacer un élève avant le 1er tour)</div>${S.init.map((t, i) => `<div style="margin-top:6px">${bdBadge(i)} ${t.map((n) => `<span style="display:inline-flex;align-items:center;gap:2px;margin:2px 6px 2px 0;font-size:0.82rem">${bdAResultats(S) ? '' : `<button type="button" data-mv="${rlEsc(n)}|-1" style="border:0;background:transparent;cursor:pointer;padding:0 2px">◀</button>`}${rlEsc(n)}${bdAResultats(S) ? '' : `<button type="button" data-mv="${rlEsc(n)}|1" style="border:0;background:transparent;cursor:pointer;padding:0 2px">▶</button>`}</span>`).join('') || '<i>vide</i>'}</div>`).join('')}</div>`;
    if (S.eval) h += bdHtmlEval(S);
    else { const tours = bdSimuler(S.init, S.win);
    tours.forEach((tr, r) => {
      h += `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Tour ${r + 1} · qui a gagné ?</div>${tr.matchs.map((m, i) => !m ? `<div style="padding:6px 0;border-top:1px solid var(--border);font-size:0.78rem">${bdBadge(i)} <i>pas de match</i></div>` : `<div style="padding:8px 0;border-top:1px solid var(--border)"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">${bdBadge(i)}<span style="font-size:0.7rem;color:var(--muted)">Arbitre et observe : ${tr.terrains[i].slice(2).map(rlEsc).join(', ') || 'personne'}</span></div><div style="display:flex;gap:6px">${[m.a, m.b].map((n) => `<button type="button" data-w="${r}|${i}|${rlEsc(n)}" style="flex:1;border:2px solid #0e7c7b;background:${m.w === n ? '#0e7c7b' : 'transparent'};color:${m.w === n ? '#fff' : 'inherit'};border-radius:9px;padding:10px 4px;font:700 0.86rem inherit;font-family:inherit;cursor:pointer">${m.w === n ? '🏆 ' : ''}${rlEsc(n)}</button>`).join('')}</div></div>`).join('')}</div>`;
    });
    const F = bdFinal(S.init, S.win), n = S.init.length;
    if (F.faits) h += `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Terrain atteint après ${F.faits} tour(s) · Performance /6</div>${Array.from({ length: n }, (_, i) => { const l = Object.keys(F.rang).filter((k) => F.rang[k] === i + 1); return `<div style="padding:5px 0;border-top:1px solid var(--border);font-size:0.84rem">${bdBadge(i)} <b>${bdPtsTerrain(i + 1, n)} pts</b> · ${l.map(rlEsc).join(', ') || '—'}</div>`; }).join('')}</div>`;
    }
    h += `<button type="button" class="btn btn-outline" id="bdReset" style="width:100%;margin-bottom:8px">Recommencer le tournoi</button>`;
  }
  el.innerHTML = h;
  const sauver = () => { bdSauver(cl, d); bdTabTournoi(); };
  const raz = () => { S.win = {}; S.ev = []; S.gr = []; delete S.clos; };
  document.getElementById('bdEval').onchange = (e) => { if (bdAResultats(S)) { showToast('Recommence le tournoi pour changer'); bdTabTournoi(); return; } S.eval = e.target.value === '1'; S.mode = S.mode || 'direct'; raz(); sauver(); };
  const md = document.getElementById('bdMode'); if (md) md.onchange = (e) => { if (bdAResultats(S)) { showToast('Recommence le tournoi pour changer de mode'); bdTabTournoi(); return; } S.mode = e.target.value; raz(); sauver(); };
  el.onchange = (e) => { if (S.eval && bdChangeEval(e, S, () => bdSauver(cl, d))) return; };
  document.getElementById('bdNbT').onchange = (e) => { d.nbT = +e.target.value; S.init = []; raz(); sauver(); };
  document.getElementById('bdList').onchange = (e) => { const x = e.target.dataset.p; if (x === undefined) return; S.present = e.target.checked ? S.present.concat(x) : S.present.filter((y) => y !== x); S.init = []; raz(); sauver(); };
  document.getElementById('bdList').onclick = (e) => { const b = e.target.closest('button[data-niv]'); if (!b) return; const x = b.dataset.niv; const nx = { undefined: 'A', A: 'B', B: 'C', C: undefined }[d.niveau[x]]; if (nx) d.niveau[x] = nx; else delete d.niveau[x]; sauver(); };
  document.getElementById('bdRep').onclick = () => { if (S.present.length < 2 * d.nbT && S.present.length < 4) { showToast('Il faut au moins 4 élèves présents'); return; } S.init = bdRepartir(S.present, d.niveau, d.nbT); raz(); sauver(); };
  el.onclick = (e) => {
    if (S.eval && bdClicEval(e, S, cl, s, sauver)) return;
    const w = e.target.closest('button[data-w]'), mv = e.target.closest('button[data-mv]');
    if (w) { const [r, i, n] = w.dataset.w.split('|'); const k = r + '|' + i; const nw = {}; Object.keys(S.win).forEach((x) => { if (+x.split('|')[0] < +r || x === k) nw[x] = S.win[x]; }); S.win = nw; S.win[k] = S.win[k] === n ? undefined : n; if (!S.win[k]) delete S.win[k]; sauver(); }
    else if (mv) { const [n, dir] = mv.dataset.mv.split('|'); const i = S.init.findIndex((t) => t.includes(n)), j = i + +dir; if (j < 0 || j >= S.init.length) return; S.init[i] = S.init[i].filter((x) => x !== n); S.init[j].push(n); sauver(); }
    else if (e.target.closest('#bdReset')) { raz(); sauver(); }
  };
}

function bdTabNota() {
  const cl = bdSt.cl, s = bdSt.s, d = bdLire(cl), S = bdSeance(d, s), el = document.getElementById('bdTab');
  if (!S.init.length) { el.innerHTML = `<div class="card" style="padding:12px;font-size:0.85rem">Fais d'abord le tournoi de la séance ${s} (onglet Tournoi).</div>`; return; }
  const F = bdFinal(S.init, S.win), n = S.init.length, mem = S.present;
  const chip = (on, col) => `border:2px solid ${col};background:${on ? col : 'transparent'};color:${on ? '#fff' : 'inherit'};border-radius:9px;font:700 0.72rem inherit;font-family:inherit;cursor:pointer;padding:6px 8px`;
  const pts = (v, m) => (v === null || v === undefined ? '—' : v + '/' + m);
  const perfDe = (nom) => (S.eval ? bdPerfEval(S, nom) : F.rang[nom] ? bdPtsTerrain(F.rang[nom], n) : null);
  const carte = (nom) => {
    const o = S.obs[nom] || {}, a = S.arb[nom] || [], b = bdBilan(d, s, nom, perfDe(nom));
    const ligne = (c) => `<div style="margin-top:6px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">${c.t} · ${pts(b[c.id], c.max)}</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:3px">${c.items.map(([l, full], k) => `<button type="button" title="${rlEsc(full)}" data-o="${rlEsc(nom)}|${c.id}|${k}" style="${chip((o[c.id] || [])[k], '#2a9d8f')}">${l}</button>`).join('')}</div></div>`;
    return `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><b style="font-size:0.92rem">${rlEsc(nom)}</b><span style="font-size:0.76rem;color:var(--muted)">Performance : <b>${pts(b.perf, 6)}</b>${S.eval ? (S.clos ? ' (' + (S.clos.classement.indexOf(nom) + 1) + 'e)' : '') : F.rang[nom] ? ' (terrain ' + F.rang[nom] + ')' : ''}</span></div>${BD_CRIT.map(ligne).join('')}<div style="margin-top:6px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">⚖️ Arbitrage · ${pts(b.arb, 4)} (vide s'il n'a pas arbitré)</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:3px">${BD_ARB.map((l, k) => `<button type="button" data-a="${rlEsc(nom)}|${k}" style="${chip(a[k], '#d98a00')}">${l}</button>`).join('')}</div></div></div>`;
  };
  const recap = mem.map((nom) => { const b = bdBilan(d, s, nom, perfDe(nom)); const tech = b.traj === null || b.frapp === null || b.depl === null ? null : b.traj + b.frapp + b.depl; const ok = b.perf !== null && tech !== null; const tot = ok ? b.perf + tech + (b.arb === null ? 0 : b.arb) : null; return `<tr><td>${rlEsc(nom)}</td><td>${pts(b.perf, 6)}</td><td>${pts(tech, 10)}</td><td>${pts(b.arb, 4)}</td><td><b>${tot === null ? '—' : (b.arb === null ? Math.round(tot / 16 * 20 * 2) / 2 : tot) + '/20'}</b></td></tr>`; }).join('');
  el.innerHTML = `<div style="font-size:0.72rem;color:var(--muted);margin-bottom:8px">${S.eval ? (S.clos ? 'Performance = place au classement final du tournoi.' : 'Clôture le tournoi pour obtenir la Performance (place).') : F.faits ? 'Performance calculée avec le terrain atteint après ' + F.faits + ' tour(s).' : 'Joue au moins un tour pour obtenir la Performance.'} Coche ce que tu vois : 1 case = 1 point.</div>${mem.map(carte).join('')}
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
  if (S.eval ? !S.clos : !F.faits) { showToast(S.eval ? 'Clôture d\'abord le tournoi' : 'Joue au moins un tour du tournoi'); return; }
  const manque = S.present.filter((nom) => { const b = bdBilan(d, s, nom, 1); return b.traj === null || b.frapp === null || b.depl === null; });
  if (manque.length) { showToast('Technique à cocher pour ' + manque[0] + (manque.length > 1 ? ' et ' + (manque.length - 1) + ' autre(s)' : '')); return; }
  const k = 'notes-' + currentYear; let N = {}; try { N = JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) {}
  N.badminton = N.badminton || {}; const arr = (N.badminton[cl] = N.badminton[cl] || []);
  S.present.forEach((nom) => {
    const perf = S.eval ? (bdPerfEval(S, nom) ?? 2) : bdPtsTerrain(F.rang[nom] || n, n), b = bdBilan(d, s, nom, perf);
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

function boutonBadminton(sd, cl, col, num, petit, ev) {
  if (!sd || sd.id !== 'badminton' || cl === '6e') return '';
  if (petit) return `<button onclick="badmintonOuvrir('${cl}',${num || 1},${ev ? 1 : 0})" title="Badminton : tournoi et notation" style="flex-shrink:0;background:${col};color:#fff;border:none;border-radius:7px;width:30px;height:30px;font-size:0.85rem;cursor:pointer;display:flex;align-items:center;justify-content:center">🏸</button>`;
  return `<button onclick="badmintonOuvrir('${cl}',${num || 1},${ev ? 1 : 0})" title="Tournoi montante-descendante et notation" style="background:${col};color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif">🏸 Badminton</button>`;
}

/* ═══ Tournoi d'évaluation : montée directe à la fin du match, ou à la fin du groupe (poule par terrain) ═══
   S.eval = true, S.mode = 'direct' | 'groupe'
   direct : S.ev = [{t, a, b, sa, sb}] (matchs dans l'ordre). Le gagnant monte, le perdant descend, chacun se place en fin de file.
   groupe : S.gr = [{sc:{'t|a|b':[x,y]}, ok}] (rondes). Poule sur chaque terrain ; à la validation, le 1er monte, le dernier descend.
   S.clos = { classement:[noms] } à la clôture : place 1 → 6 pts … dernière → 2 pts. */
function bdStat(st, a, b, sa, sb) {
  [a, b].forEach((n) => { st[n] = st[n] || { V: 0, D: 0, pf: 0, pc: 0, j: 0 }; });
  st[a].j++; st[b].j++; st[a].pf += sa; st[a].pc += sb; st[b].pf += sb; st[b].pc += sa;
  if (sa > sb) { st[a].V++; st[b].D++; } else { st[b].V++; st[a].D++; }
}
function bdTriTerrain(liste, st) {
  const z = { V: 0, D: 0, pf: 0, pc: 0, j: 0 };
  return liste.map((n, i) => [n, i]).sort((x, y) => { const p = st[x[0]] || z, q = st[y[0]] || z; return q.V - p.V || (q.pf - q.pc) - (p.pf - p.pc) || q.pf - p.pf || x[1] - y[1]; }).map((x) => x[0]);
}
function bdEvDirect(init, matchs) {
  const q = init.map((t) => t.slice()), st = {}, n = q.length;
  (matchs || []).forEach((m) => {
    q[m.t] = q[m.t].filter((x) => x !== m.a && x !== m.b);
    const w = m.sa > m.sb ? m.a : m.b, l = w === m.a ? m.b : m.a;
    q[Math.max(0, m.t - 1)].push(w); q[Math.min(n - 1, m.t + 1)].push(l);
    bdStat(st, m.a, m.b, m.sa, m.sb);
  });
  return { q, st };
}
function bdPaires(l) { const r = []; for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) r.push([l[i], l[j]]); return r; }
function bdEvGroupe(init, rondes) {
  let cur = init.map((t) => t.slice()); const stTout = {}; const n = cur.length; let rc = null;
  (rondes || []).forEach((r) => {
    const st = {};
    cur.forEach((l, t) => bdPaires(l).forEach(([a, b]) => { const v = r.sc[t + '|' + a + '|' + b]; if (v && v[0] !== '' && v[1] !== '' && +v[0] !== +v[1]) { bdStat(st, a, b, +v[0], +v[1]); bdStat(stTout, a, b, +v[0], +v[1]); } }));
    if (!r.ok) { rc = { terrains: cur, st, r }; return; }
    const cl = cur.map((l) => bdTriTerrain(l, st));
    // le 1er monte (sauf terrain du haut), le dernier descend (sauf terrain du bas)
    const nx = cl.map(() => []);
    cl.forEach((l, t) => {
      if (l.length < 2) { nx[t].push(...l); return; }
      const premier = l[0], dernier = l[l.length - 1], milieu = l.slice(1, -1);
      nx[t].push(...milieu);
      nx[t > 0 ? t - 1 : t].push(premier);
      nx[t < n - 1 ? t + 1 : t].push(dernier);
    });
    cur = nx;
  });
  return { terrains: rc ? rc.terrains : cur, st: rc ? rc.st : {}, stTout, ronde: rc ? rc.r : null };
}
function bdClassementEval(S) {
  if (!S.init.length) return [];
  if (S.mode === 'groupe') { const G = bdEvGroupe(S.init, S.gr); return G.terrains.flatMap((l) => bdTriTerrain(l, Object.assign({}, G.st))); }
  const D = bdEvDirect(S.init, S.ev); return D.q.flatMap((l) => bdTriTerrain(l, D.st));
}
function bdPtsPlace(k, N) { return N <= 1 ? 6 : Math.round(6 - 4 * k / (N - 1)); }
function bdPerfEval(S, nom) { if (!S.clos) return null; const k = S.clos.classement.indexOf(nom); return k < 0 ? null : bdPtsPlace(k, S.clos.classement.length); }
function bdAResultats(S) { return S.eval ? ((S.ev || []).length > 0 || (S.gr || []).some((r) => Object.keys(r.sc || {}).length)) : Object.keys(S.win || {}).length > 0; }

function bdHtmlEval(S) {
  const chip = 'width:58px;padding:8px;font-size:1.1rem;text-align:center';
  let h = '';
  if (S.clos) {
    const c = S.clos.classement;
    return `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">🏁 Tournoi clôturé · places reportées dans le barème</div>${c.map((n, k) => `<div style="display:flex;gap:8px;padding:5px 0;border-top:1px solid var(--border);font-size:0.86rem"><b style="width:24px">${k + 1}</b><span style="flex:1">${rlEsc(n)}</span><b>${bdPtsPlace(k, c.length)}/6</b></div>`).join('')}</div><button type="button" class="btn btn-outline" id="bdRouvrir" style="width:100%;margin-bottom:8px">Rouvrir le tournoi</button>`;
  }
  if (S.mode === 'groupe') {
    S.gr = S.gr && S.gr.length ? S.gr : [{ sc: {}, ok: false }];
    const G = bdEvGroupe(S.init, S.gr), num = S.gr.length;
    h += `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Ronde ${num} · poule sur chaque terrain, puis le 1er monte et le dernier descend</div>${G.terrains.map((l, t) => `<div style="padding:8px 0;border-top:1px solid var(--border)"><div style="margin-bottom:4px">${bdBadge(t)} <span style="font-size:0.72rem;color:var(--muted)">${l.map(rlEsc).join(', ') || 'vide'}</span></div>${bdPaires(l).map(([a, b]) => { const v = G.ronde.sc[t + '|' + a + '|' + b] || ['', '']; return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0"><span style="flex:1;min-width:0;text-align:right;font-size:0.84rem">${rlEsc(a)}</span><input type="number" inputmode="numeric" min="0" data-gs="${t}|${rlEsc(a)}|${rlEsc(b)}|0" value="${rlEsc(v[0])}" style="${chip}">–<input type="number" inputmode="numeric" min="0" data-gs="${t}|${rlEsc(a)}|${rlEsc(b)}|1" value="${rlEsc(v[1])}" style="${chip}"><span style="flex:1;min-width:0;font-size:0.84rem">${rlEsc(b)}</span></div>`; }).join('') || '<i style="font-size:0.78rem">pas de match</i>'}</div>`).join('')}
    <button type="button" class="btn btn-teal" id="bdRonde" style="width:100%;margin-top:6px">✅ Valider la ronde : montées et descentes</button>${num > 1 ? '<button type="button" class="btn btn-outline" id="bdRondePrec" style="width:100%;margin-top:6px">↶ Rouvrir la ronde précédente</button>' : ''}</div>`;
  } else {
    S.ev = S.ev || [];
    const D = bdEvDirect(S.init, S.ev);
    h += `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Montée directe : tape le score, le gagnant monte, le perdant descend (en fin de file)</div>${D.q.map((l, t) => `<div style="padding:8px 0;border-top:1px solid var(--border)"><div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">${bdBadge(t)}<span style="font-size:0.7rem;color:var(--muted)">${l.length >= 2 ? 'Attendent, arbitrent, observent : ' : ''}${l.length >= 2 ? (l.slice(2).map(rlEsc).join(', ') || 'personne') : ''}</span></div>${l.length >= 2 ? `<div style="display:flex;align-items:center;gap:6px"><span style="flex:1;min-width:0;text-align:right;font-weight:700;font-size:0.88rem">${rlEsc(l[0])}</span><input type="number" inputmode="numeric" min="0" id="bdSa${t}" style="${chip}">–<input type="number" inputmode="numeric" min="0" id="bdSb${t}" style="${chip}"><span style="flex:1;min-width:0;font-weight:700;font-size:0.88rem">${rlEsc(l[1])}</span></div><button type="button" data-val="${t}" style="width:100%;margin-top:6px;border:0;background:#0e7c7b;color:#fff;border-radius:9px;padding:9px;font:700 0.84rem inherit;font-family:inherit;cursor:pointer">Valider le match</button>` : `<i style="font-size:0.78rem">${l.length ? rlEsc(l[0]) + ' attend un adversaire' : 'Terrain vide'}</i>`}</div>`).join('')}</div>`;
    if (S.ev.length) h += `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Matchs joués (${S.ev.length})</div>${S.ev.slice().reverse().map((m) => { const w = m.sa > m.sb ? m.a : m.b; return `<div style="padding:4px 0;border-top:1px solid var(--border);font-size:0.8rem">${bdBadge(m.t)} ${rlEsc(m.a)} <b>${m.sa}–${m.sb}</b> ${rlEsc(m.b)} · 🏆 ${rlEsc(w)}</div>`; }).join('')}<button type="button" class="btn btn-outline" id="bdUndo" style="width:100%;margin-top:6px">↶ Annuler le dernier match</button></div>`;
  }
  const c = bdClassementEval(S);
  h += `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Classement provisoire (terrain, puis victoires et points)</div>${c.map((n, k) => `<div style="display:flex;gap:8px;padding:4px 0;border-top:1px solid var(--border);font-size:0.82rem"><b style="width:24px">${k + 1}</b><span style="flex:1">${rlEsc(n)}</span><span style="color:var(--muted)">${bdPtsPlace(k, c.length)}/6</span></div>`).join('')}</div>
  <button type="button" class="btn btn-teal" id="bdClore" style="width:100%;margin-bottom:8px">🏁 Clôturer le tournoi et reporter les places</button>`;
  return h;
}
function bdClicEval(e, S, cl, s, sauver) {
  const t = e.target;
  const val = t.closest('button[data-val]');
  if (val) {
    const k = +val.dataset.val, D = bdEvDirect(S.init, S.ev), l = D.q[k];
    const sa = document.getElementById('bdSa' + k).value, sb = document.getElementById('bdSb' + k).value;
    if (sa === '' || sb === '') { showToast('Tape les deux scores'); return true; }
    if (+sa === +sb) { showToast('Pas de match nul au badminton'); return true; }
    S.ev.push({ t: k, a: l[0], b: l[1], sa: +sa, sb: +sb }); sauver(); return true;
  }
  if (t.closest('#bdUndo')) { S.ev.pop(); sauver(); return true; }
  if (t.closest('#bdRonde')) {
    const G = bdEvGroupe(S.init, S.gr); const manque = G.terrains.reduce((a, l, k) => a + bdPaires(l).filter(([x, y]) => { const v = G.ronde.sc[k + '|' + x + '|' + y]; return !v || v[0] === '' || v[1] === '' || +v[0] === +v[1]; }).length, 0);
    if (manque) { showToast(manque + ' match(s) sans score valide'); return true; }
    S.gr[S.gr.length - 1].ok = true; S.gr.push({ sc: {}, ok: false }); sauver(); return true;
  }
  if (t.closest('#bdRondePrec')) { if (Object.keys(S.gr[S.gr.length - 1].sc).length) { showToast('Efface d\'abord les scores de cette ronde'); return true; } S.gr.pop(); S.gr[S.gr.length - 1].ok = false; sauver(); return true; }
  if (t.closest('#bdClore')) { S.clos = { classement: bdClassementEval(S) }; sauver(); bdReporterPlaces(cl, s); return true; }
  if (t.closest('#bdRouvrir')) { delete S.clos; sauver(); return true; }
  return false;
}
function bdChangeEval(e, S, sauverSans) {
  const g = e.target.dataset.gs; if (!g) return false;
  const [t, a, b, i] = g.split('|'); const r = S.gr[S.gr.length - 1]; const k = t + '|' + a + '|' + b;
  r.sc[k] = r.sc[k] || ['', '']; r.sc[k][+i] = e.target.value; if (r.sc[k][0] === '' && r.sc[k][1] === '') delete r.sc[k];
  sauverSans(); return true;
}
// À la clôture : la Performance (place) est écrite dans le barème ; les autres critères déjà notés sont gardés.
function bdReporterPlaces(cl, s) {
  const d = bdLire(cl), S = bdSeance(d, s); if (!S.clos) return;
  const k = 'notes-' + currentYear; let N = {}; try { N = JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) {}
  N.badminton = N.badminton || {}; const arr = (N.badminton[cl] = N.badminton[cl] || []);
  S.clos.classement.forEach((nom) => {
    const perf = bdPerfEval(S, nom), b = bdBilan(d, s, nom, perf);
    const i = arr.findIndex((x) => x.prenom === nom); const e = i >= 0 ? arr[i] : { prenom: nom, scores: {}, max: 20 };
    delete e.statut; e.scores.perf = perf;
    if (b.traj !== null) e.scores.tech_traj = b.traj; if (b.frapp !== null) e.scores.tech_frapp = b.frapp; if (b.depl !== null) e.scores.tech_depl = b.depl;
    if (b.arb !== null) e.scores.arb = b.arb;
    const sc = e.scores, ok = ['tech_traj', 'tech_frapp', 'tech_depl'].every((c) => typeof sc[c] === 'number');
    if (ok) { const ar = typeof sc.arb === 'number' ? sc.arb : null; let tot = perf + sc.tech_traj + sc.tech_frapp + sc.tech_depl + (ar || 0); if (ar === null) { sc.arb = 'na'; tot = Math.round(tot / 16 * 20 * 2) / 2; } e.total = tot; }
    else e.total = '—';
    if (i >= 0) arr[i] = e; else arr.push(e);
  });
  try { localStorage.setItem(k, JSON.stringify(N)); } catch (e) {}
  if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
  const f = document.getElementById('baremesFrame'); if (f && f.getAttribute('src')) f.setAttribute('src', 'baremes.html?v=' + Date.now());
  showToast('🏁 Places reportées dans le barème ' + cl + ' (Performance /6)');
}
