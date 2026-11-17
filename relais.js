/* relais.js : outils du relais (groupes par séance, niveaux A/B/C, équilibrage, ordre de passage,
   terrain, fiche d'observation de zone, base d'exercices animés). Chargé par index.html.
   Données (toutes synchronisées avec les autres données EPS) :
   - relais-<année>-<classe> : niveaux, groupes par séance, ordre de passage, zones observées, tour intérieur
   - relais-exos             : base d'exercices (reste d'une année à l'autre) */

const RL_COL = ['#0e7c7b', '#d98a00', '#7b4fc8', '#c8382e', '#2f6fd6', '#2a9d8f'];
const RL_NIV = { A: '#0e7c7b', B: '#d98a00', C: '#7b4fc8' };
const RL_NSEANCES = 6;
let rlSt = { cl: '6e', s: 1, tab: 'groupes', g: 0, ex: null, ed: null };

const rlEsc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
function rlNorm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/* ───────────── Données de la classe ───────────── */
const rlCle = (cl) => 'relais-' + currentYear + '-' + cl;
function rlLire(cl) {
  let o = {};
  try { o = JSON.parse(localStorage.getItem(rlCle(cl)) || '{}'); } catch (e) { o = {}; }
  return Object.assign({ nbEq: 4, niveau: {}, groupes: {}, ordre: {}, zone: {}, tour: '', zoneLong: 20 }, o);
}
function rlSauver(cl, d) {
  try { localStorage.setItem(rlCle(cl), JSON.stringify(d)); } catch (e) {}
  if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
}
function rlEleves(cl) { return (getEleves(currentYear)[cl] || []).slice(); }
function rlNbGroupes(d, cl) { return Math.max(1, Math.ceil(rlEleves(cl).length / (d.nbEq || 4))) ; }

/* ───────────── Équilibrer et ordre de passage ───────────── */
// Serpentin : A, B, C répartis entre les groupes ; option filles/garçons alternés dans chaque niveau.
function rlEquilibrer(noms, niveau, nbGroupes, genres, mixer) {
  const rang = (n) => ({ A: 0, B: 1, C: 2 })[niveau[n]] ?? 1.5;
  const seed = (s) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 9973; return h; };
  const tri = noms.slice().sort((a, b) => rang(a) - rang(b) || seed(a) - seed(b));
  let liste = tri;
  if (mixer && genres) {
    const out = [];
    const niveaux = [...new Set(tri.map(rang))];
    niveaux.forEach((r) => {
      const bloc = tri.filter((n) => rang(n) === r);
      const f = bloc.filter((n) => genres[n] === 'F'), g = bloc.filter((n) => genres[n] !== 'F');
      const m = [];
      while (f.length || g.length) { if (f.length) m.push(f.shift()); if (g.length) m.push(g.shift()); }
      out.push(...m);
    });
    liste = out;
  }
  const res = {};
  liste.forEach((n, i) => {
    const tour = Math.floor(i / nbGroupes), pos = i % nbGroupes;
    res[n] = tour % 2 ? nbGroupes - 1 - pos : pos;
  });
  return res;
}
// Ordre de passage proposé : les moins rapides d'abord, le plus rapide en dernier.
function rlOrdrePropose(membres, niveau) {
  const rang = (n) => ({ A: 0, B: 1, C: 2 })[niveau[n]] ?? 1.5;
  return membres.slice().sort((a, b) => rang(b) - rang(a));
}
function rlMembres(d, s, g, cl) {
  const grp = d.groupes[s] || {};
  return rlEleves(cl).filter((n) => grp[n] === g);
}
function rlOrdreEffectif(d, s, g, cl) {
  const m = rlMembres(d, s, g, cl);
  const saved = ((d.ordre[s] || {})[g] || []).filter((n) => m.includes(n));
  return saved.concat(m.filter((n) => !saved.includes(n)));
}

/* ───────────── Terrain : tour intérieur, départ au milieu du côté droit ───────────── */
function rlTerrain(ctx, W, H, fond) {
  if (fond === 'vide') { ctx.fillStyle = '#e8eeee'; ctx.fillRect(0, 0, W, H); return; }
  for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? '#469854' : '#3f8f4f'; ctx.fillRect(i * W / 10, 0, W / 10, H); }
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2;
  const m = 18; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
  ctx.beginPath(); ctx.moveTo(W / 2, m); ctx.lineTo(W / 2, H - m); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, H * .14, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeRect(m, H * .28, W * .13, H * .44); ctx.strokeRect(W - m - W * .13, H * .28, W * .13, H * .44);
}
const RL_CIRC = { x0: .2, x1: .8, y0: .2, y1: .8 };
function rlPointCircuit(u) { // u de 0 à 1 depuis le départ (milieu droit), sens inverse des aiguilles
  const c = RL_CIRC, w = c.x1 - c.x0, h = c.y1 - c.y0, P = 2 * (w + h);
  let d = (((u % 1) + 1) % 1) * P;
  const seg = [[h / 2, (t) => [c.x1, c.y0 + h / 2 - t]], [w, (t) => [c.x1 - t, c.y0]], [h, (t) => [c.x0, c.y0 + t]], [w, (t) => [c.x0 + t, c.y1]], [h / 2, (t) => [c.x1, c.y1 - t]]];
  for (const [L, f] of seg) { if (d <= L) return f(d); d -= L; }
  return [c.x1, c.y0 + h / 2];
}
function rlTrajetCircuit(u0, u1) {
  const pts = [], n = Math.max(2, Math.round((u1 - u0) / 0.02));
  for (let i = 0; i <= n; i++) pts.push(rlPointCircuit(u0 + (u1 - u0) * i / n));
  return pts;
}

/* ───────────── Animations : un seul moteur pour la bibliothèque, le schéma généré et le dessin ─────────────
   spec = { fond:'foot'|'vide', objets:[{k:'plot',x,y} | {k:'zone',x,y,w,h} | {k:'txt',x,y,t} | {k:'circuit',n}],
            acteurs:[{lbl,c,t0,t1,pts:[[x,y],…],tem:0|1|2, bat:true?}], legende, dur } ; x,y entre 0 et 1. */
function rlPosition(pts, p) {
  if (pts.length === 1) return pts[0];
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let d = Math.max(0, Math.min(1, p)) * tot;
  for (let i = 0; i < L.length; i++) {
    if (d <= L[i] || i === L.length - 1) { const f = L[i] ? Math.min(1, d / L[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; }
    d -= L[i];
  }
  return pts[pts.length - 1];
}
function rlDessiner(ctx, W, H, spec, t) {
  rlTerrain(ctx, W, H, spec.fond);
  (spec.objets || []).forEach((o) => {
    if (o.k === 'circuit') {
      const c = RL_CIRC; ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 3;
      ctx.strokeRect(c.x0 * W, c.y0 * H, (c.x1 - c.x0) * W, (c.y1 - c.y0) * H); ctx.restore();
      for (let k = 0; k < (o.n || 4); k++) {
        const [x, y] = rlPointCircuit(k / o.n); ctx.fillStyle = k ? '#ffd34d' : '#ff5a4f'; ctx.beginPath(); ctx.arc(x * W, y * H, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(k ? 'Zone ' + k : 'DÉPART', x * W + (x > .7 ? -46 : x < .3 ? 44 : 0), y * H + (y < .3 ? -14 : y > .7 ? 26 : 5));
      }
    } else if (o.k === 'zone') {
      ctx.fillStyle = 'rgba(255,211,77,.35)'; ctx.fillRect(o.x * W, o.y * H, o.w * W, o.h * H);
      ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 2; ctx.strokeRect(o.x * W, o.y * H, o.w * W, o.h * H);
      if (o.l) { ctx.fillStyle = '#fff'; ctx.font = '600 13px system-ui'; ctx.textAlign = 'center'; ctx.fillText(o.l, (o.x + o.w / 2) * W, (o.y) * H - 5); }
    } else if (o.k === 'plot') {
      const x = o.x * W, y = o.y * H; ctx.fillStyle = o.c || '#ff8a00'; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x - 8, y + 7); ctx.lineTo(x + 8, y + 7); ctx.fill();
    } else if (o.k === 'txt') {
      ctx.fillStyle = '#fff'; ctx.font = '600 13px system-ui'; ctx.textAlign = 'center'; ctx.fillText(o.t, o.x * W, o.y * H);
    }
  });
  (spec.acteurs || []).forEach((a) => {
    const t0 = a.t0 == null ? 0 : a.t0, t1 = a.t1 == null ? 1 : a.t1;
    const p = t1 > t0 ? (t - t0) / (t1 - t0) : (t >= t0 ? 1 : 0);
    const [px, py] = rlPosition(a.pts, p); const x = px * W, y = py * H;
    if (a.bat) { ctx.fillStyle = '#ffd34d'; ctx.save(); ctx.translate(x, y); ctx.rotate(-.6); ctx.fillRect(-3, -9, 6, 18); ctx.restore(); return; }
    const court = t > t0 && t < t1;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x + 2, y + 11, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = a.c || '#0e7c7b'; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a.lbl || '', x, y + 1); ctx.textBaseline = 'alphabetic';
    if (a.tem === 2 || (a.tem === 1 && court)) { ctx.fillStyle = '#ffd34d'; ctx.save(); ctx.translate(x + 12, y - 8); ctx.rotate(-.6); ctx.fillRect(-3, -9, 6, 18); ctx.restore(); }
  });
  if (spec.legende) { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, H - 32, W, 32); ctx.fillStyle = '#fff'; ctx.font = '600 14px system-ui'; ctx.textAlign = 'center'; ctx.fillText(spec.legende, W / 2, H - 11); }
}

/* Bibliothèque : animations dessinées pour le relais */
const RL_COULEURS = ['#c8382e', '#2f6fd6', '#7b4fc8', '#0e7c7b', '#d98a00', '#2a9d8f'];
function rlSpecColonne(n, arret) {
  const acteurs = [];
  for (let i = 0; i < n; i++) acteurs.push({ lbl: String(i + 1), c: RL_COULEURS[i % 6], t0: 0, t1: 1, pts: [[.22 + i * .09, .5]], tem: 0 });
  const bx = (i) => .22 + i * .09;
  acteurs.push({ bat: true, t0: 0, t1: 1, pts: Array.from({ length: n }, (_, i) => [bx(n - 1 - i) , .5 - .04]) });
  return { fond: 'foot', objets: [], acteurs, dur: 5000, legende: arret ? 'Le témoin remonte la colonne, à l\'arrêt' : 'Le témoin passe de main en main' };
}
function rlSpecMarque() {
  return { fond: 'foot', dur: 5000, legende: 'Le donneur passe le plot : le receveur part',
    objets: [{ k: 'plot', x: .52, y: .58 }, { k: 'txt', x: .52, y: .72, t: 'plot' }],
    acteurs: [{ lbl: 'D', c: '#2f6fd6', t0: 0, t1: .6, pts: [[.1, .5], [.62, .5]], tem: 1 }, { lbl: 'R', c: '#c8382e', t0: .45, t1: 1, pts: [[.66, .5], [.92, .5]], tem: 0 }] };
}
function rlSpecNavette(n) {
  n = Math.max(2, Math.min(6, n || 4)); const acteurs = [];
  for (let i = 0; i < n; i++) {
    const gauche = i % 2 === 0; const a = gauche ? [.15, .5] : [.85, .5], b = gauche ? [.85, .5] : [.15, .5];
    acteurs.push({ lbl: String(i + 1), c: RL_COULEURS[i % 6], t0: i / n, t1: (i + 1) / n, pts: [a, b], tem: 1 });
  }
  return { fond: 'foot', dur: 7000, legende: 'Navette : on donne le témoin à celui d\'en face', objets: [{ k: 'plot', x: .15, y: .62 }, { k: 'plot', x: .85, y: .62 }], acteurs };
}
function rlSpecZone(longueur) {
  return { fond: 'foot', dur: 5500, legende: 'Le témoin change de main DANS la zone',
    objets: [{ k: 'zone', x: .45, y: .4, w: .24, h: .2, l: (longueur || 20) + ' m' }],
    acteurs: [{ lbl: '1', c: '#2f6fd6', t0: 0, t1: .7, pts: [[.1, .5], [.62, .5]], tem: 1 }, { lbl: '2', c: '#c8382e', t0: .25, t1: 1, pts: [[.43, .5], [.92, .5]], tem: 1 }] };
}
function rlSpecTour(n) {
  n = Math.max(2, Math.min(6, n || 4)); const acteurs = [];
  for (let i = 0; i < n; i++) acteurs.push({ lbl: String(i + 1), c: RL_COULEURS[i % 6], t0: i / n, t1: (i + 1) / n, pts: rlTrajetCircuit(i / n, (i + 1) / n), tem: 1 });
  return { fond: 'foot', dur: 9000, legende: 'Relais sur le tour intérieur', objets: [{ k: 'circuit', n }], acteurs };
}
function rlSpecLigne(n, longueur) {
  n = Math.max(2, Math.min(6, n || 4)); const acteurs = [], objets = [], pas = .8 / n;
  for (let i = 0; i < n; i++) {
    const x0 = .1 + i * pas, x1 = .1 + (i + 1) * pas;
    acteurs.push({ lbl: String(i + 1), c: RL_COULEURS[i % 6], t0: i / n, t1: (i + 1) / n, pts: [[x0, .5], [x1, .5]], tem: 1 });
    if (i < n - 1) objets.push({ k: 'zone', x: x1 - .04, y: .42, w: .08, h: .16 });
  }
  return { fond: 'foot', dur: 8000, legende: 'Relais en ligne droite', objets, acteurs };
}
const RL_BIBLIO = [
  { id: 'colonne', n: 'Colonne et témoin', spec: () => rlSpecColonne(4, false) },
  { id: 'arret', n: 'Transmission à l\'arrêt', spec: () => rlSpecColonne(4, true) },
  { id: 'marque', n: 'Prise de marque', spec: () => rlSpecMarque() },
  { id: 'navette', n: 'Relais navette', spec: () => rlSpecNavette(4) },
  { id: 'zone', n: 'Zone de transmission', spec: () => rlSpecZone(20) },
  { id: 'ligne', n: 'Relais en ligne droite', spec: () => rlSpecLigne(4) },
  { id: 'tour', n: 'Relais sur le tour intérieur', spec: () => rlSpecTour(4) }
];

/* Schéma généré : lit le titre et la consigne, choisit le motif et compte les relayeurs */
function rlGenerer(titre, org, consigne) {
  const txt = rlNorm([titre, org, consigne].join(' '));
  const mN = txt.match(/(?:equipes?|colonnes?|groupes?)\s+de\s+(\d)/) || txt.match(/(\d)\s*(?:coureurs|eleves|relayeurs|joueurs)/) || txt.match(/\b(\d)\s*x\s*\d/);
  const n = mN ? Math.max(2, Math.min(6, +mN[1])) : 4;
  const mL = txt.match(/(\d+)\s*m\b/); const lg = mL ? +mL[1] : 20;
  let spec, motif;
  if (/tour|circuit|interieur/.test(txt)) { motif = 'tour'; spec = rlSpecTour(n); }
  else if (/navette|aller.?retour|en face/.test(txt)) { motif = 'navette'; spec = rlSpecNavette(n); }
  else if (/marque|pieds/.test(txt)) { motif = 'marque'; spec = rlSpecMarque(); }
  else if (/zone|synchronisation|mouvement/.test(txt)) { motif = 'zone'; spec = rlSpecZone(lg); }
  else if (/colonne|arret|remonte/.test(txt)) { motif = 'colonne'; spec = rlSpecColonne(n, /arret/.test(txt)); }
  else { motif = 'ligne'; spec = rlSpecLigne(n, lg); }
  spec.motif = motif; spec.generee = true;
  return spec;
}
function rlSpecDe(ex) {
  const a = ex.anim || { mode: 'none' };
  if (a.mode === 'lib') { const b = RL_BIBLIO.find((x) => x.id === a.id); return b ? b.spec() : null; }
  if (a.mode === 'gen') return rlGenerer(ex.titre, ex.org, ex.consigne);
  if (a.mode === 'custom') return a.spec || null;
  return null;
}

/* Lecteur d'animation sur un canvas */
const rlPlayers = {};
function rlLecteur(id, specFn) {
  const cv = document.getElementById('rlcv-' + id); if (!cv) return;
  const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  const spec = specFn(); if (!spec) return;
  const P = rlPlayers[id] = { run: false, t: 0, st: null, raf: 0 };
  rlDessiner(ctx, W, H, spec, 0);
  const vit = () => parseFloat((document.getElementById('rlsp-' + id) || { value: 1 }).value) || 1;
  const loop = (ts) => {
    if (!P.run) return; if (P.st === null) P.st = ts - P.t * (spec.dur || 6000) / vit();
    P.t = Math.min(1, (ts - P.st) * vit() / (spec.dur || 6000)); rlDessiner(ctx, W, H, spec, P.t);
    if (P.t < 1) P.raf = requestAnimationFrame(loop); else { P.run = false; const b = document.getElementById('rlpl-' + id); if (b) b.textContent = '▶ Rejouer'; }
  };
  const pl = document.getElementById('rlpl-' + id), rs = document.getElementById('rlrs-' + id);
  if (pl) pl.onclick = () => {
    const b = pl; if (P.run) { P.run = false; cancelAnimationFrame(P.raf); b.textContent = '▶ Reprendre'; return; }
    if (P.t >= 1) P.t = 0; P.st = null; P.run = true; b.textContent = '⏸ Pause'; P.raf = requestAnimationFrame(loop);
  };
  if (rs) rs.onclick = () => { P.run = false; cancelAnimationFrame(P.raf); P.t = 0; rlDessiner(ctx, W, H, spec, 0); if (pl) pl.textContent = '▶ Lancer'; };
}
function rlHtmlLecteur(id) {
  return `<canvas id="rlcv-${id}" width="600" height="330" style="width:100%;height:auto;display:block;border-radius:10px;background:#3f8f4f" aria-label="Animation de l'exercice"></canvas>
  <div style="display:flex;gap:6px;align-items:center;margin-top:6px"><button type="button" class="btn btn-teal" id="rlpl-${id}" style="padding:7px 12px">▶ Lancer</button><button type="button" class="btn btn-outline" id="rlrs-${id}" style="padding:7px 12px" aria-label="Recommencer">↺</button><span style="font-size:0.7rem;color:var(--muted)">Vitesse</span><input type="range" id="rlsp-${id}" min="0.5" max="2" step="0.25" value="1" style="width:80px" aria-label="Vitesse"></div>`;
}

/* ───────────── Base d'exercices ───────────── */
const RL_SEED = [
  { id: 's1', titre: 'Relais navette avec témoin', org: '4 équipes de 4, couloirs de 30 m balisés, 2 coureurs à chaque bout.', consigne: 'Courir jusqu\'au partenaire en face et lui donner le témoin dans la main.', seances: [1], anim: { mode: 'lib', id: 'navette' } },
  { id: 's2', titre: 'Course en colonne avec témoin', org: 'Colonnes de 4, footing lent. Le dernier remonte la colonne.', consigne: 'Le témoin passe de la main droite à la main gauche, sans se retourner.', seances: [1, 2], anim: { mode: 'lib', id: 'colonne' } },
  { id: 's3', titre: 'Transmission à l\'arrêt en colonne', org: 'Colonnes de 4 élèves, 1,5 m entre chacun.', consigne: 'Au « hop » du donneur, le receveur tend la main. On enchaîne sans arrêter la colonne.', seances: [2], anim: { mode: 'lib', id: 'arret' } },
  { id: 's4', titre: 'Prise de marque au sol', org: 'Binômes sur 30 m. Le receveur pose un plot à 5 pieds devant lui.', consigne: 'Le receveur part à fond quand le donneur passe le plot. Il tend la main au « hop ».', seances: [3], anim: { mode: 'lib', id: 'marque' } },
  { id: 's5', titre: 'Zone de transmission de 20 m', org: 'Zone balisée en couleur au milieu du terrain, 1 observateur par zone.', consigne: 'Transmettre le témoin à l\'intérieur de la zone, sans ralentir.', seances: [4], anim: { mode: 'lib', id: 'zone' } },
  { id: 's6', titre: 'Relais 4 coureurs sur le tour intérieur', org: 'Départ au milieu du côté droit. 4 zones de passage. 1 observateur par zone.', consigne: '2 essais, meilleur temps retenu. Le témoin doit changer de main dans la zone.', seances: [5, 6], anim: { mode: 'lib', id: 'tour' } }
];
function rlExos() {
  try { const v = JSON.parse(localStorage.getItem('relais-exos') || 'null'); if (Array.isArray(v)) return v; } catch (e) {}
  return JSON.parse(JSON.stringify(RL_SEED));
}
function rlExosSauver(l) { try { localStorage.setItem('relais-exos', JSON.stringify(l)); } catch (e) {} if (typeof scheduleCloudSync === 'function') scheduleCloudSync(); }

/* ───────────── Écran principal ───────────── */
function relaisHtml() {
  return `<div id="rlRoot"></div>`;
}
function relaisOuvrir(cl, s) {
  if (cl) rlSt.cl = cl; if (s) rlSt.s = Math.min(RL_NSEANCES, Math.max(1, +s));
  docSpecialOuvrir('relais');
}
function relaisRendre() {
  const root = document.getElementById('rlRoot'); if (!root) return;
  const onglets = [['groupes', '👥 Groupes'], ['terrain', '🏟️ Terrain'], ['zone', '✅ Notation'], ['exos', '🎬 Exercices']];
  root.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
    <label style="font-size:0.66rem;font-weight:700;color:var(--muted)">Classe<select id="rlCl" style="width:100%;padding:8px;font-size:1rem">${['6e', '5e', '4e', '3e'].map((c) => `<option${c === rlSt.cl ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
    <label style="font-size:0.66rem;font-weight:700;color:var(--muted)">Séance<select id="rlS" style="width:100%;padding:8px;font-size:1rem">${Array.from({ length: RL_NSEANCES }, (_, i) => `<option value="${i + 1}"${i + 1 === rlSt.s ? ' selected' : ''}>Séance ${i + 1}</option>`).join('')}</select></label></div>
  <div style="display:flex;gap:4px;margin-bottom:10px" id="rlTabs">${onglets.map(([k, l]) => `<button type="button" data-tab="${k}" style="flex:1;border:0;border-radius:9px;padding:9px 2px;font:700 0.76rem inherit;font-family:inherit;cursor:pointer;background:${rlSt.tab === k ? '#0e7c7b' : '#d9efee'};color:${rlSt.tab === k ? '#fff' : '#0a5a5a'}">${l}</button>`).join('')}</div>
  <div id="rlTab"></div>`;
  document.getElementById('rlCl').onchange = (e) => { rlSt.cl = e.target.value; relaisRendre(); };
  document.getElementById('rlS').onchange = (e) => { rlSt.s = +e.target.value; relaisRendre(); };
  document.getElementById('rlTabs').onclick = (e) => { const b = e.target.closest('button[data-tab]'); if (b) { rlSt.tab = b.dataset.tab; rlSt.ed = null; relaisRendre(); } };
  ({ groupes: rlTabGroupes, terrain: rlTabTerrain, zone: rlTabZone, exos: rlTabExos })[rlSt.tab]();
}

/* ── Onglet Groupes ── */
function rlTabGroupes() {
  const cl = rlSt.cl, s = rlSt.s, d = rlLire(cl), noms = rlEleves(cl), gen = (getGenres(currentYear)[cl]) || {};
  const el = document.getElementById('rlTab'); const ng = rlNbGroupes(d, cl);
  if (rlSt.g >= ng) rlSt.g = 0;
  if (!noms.length) { el.innerHTML = `<div class="card" style="padding:12px;font-size:0.85rem">Aucun élève en ${cl}. Ajoute-les dans « Élèves » (barre latérale).</div>`; return; }
  const grp = d.groupes[s] || {};
  const pill = (n) => { const v = d.niveau[n]; return `<button type="button" data-niv="${rlEsc(n)}" style="border:1.5px solid ${v ? RL_NIV[v] : 'var(--border)'};background:${v ? RL_NIV[v] : 'transparent'};color:${v ? '#fff' : 'var(--muted)'};border-radius:99px;width:30px;height:26px;font:700 0.72rem inherit;font-family:inherit;cursor:pointer" aria-label="Niveau de ${rlEsc(n)}">${v || '–'}</button>`; };
  el.innerHTML = `<div class="card" style="padding:10px 12px;margin-bottom:8px">
    <div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap">
      <label style="font-size:0.66rem;font-weight:700;color:var(--muted);flex:1;min-width:110px">Élèves par équipe<select id="rlNbEq" style="width:100%;padding:7px;font-size:1rem">${[3, 4, 5, 6].map((x) => `<option${x === d.nbEq ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
      <label style="display:flex;gap:6px;align-items:center;font-size:0.78rem;flex:1;min-width:130px"><input type="checkbox" id="rlMix" style="width:18px;height:18px"> Filles/garçons mélangés</label></div>
    <button type="button" class="btn btn-teal" id="rlEq" style="width:100%;margin-top:8px">⚖️ Équilibrer selon les niveaux A, B, C</button>
    <div style="font-size:0.7rem;color:var(--muted);margin-top:6px">Touche la pastille à droite du prénom pour donner un niveau (A, B, C). Sans niveau, l'élève compte comme B.</div></div>
  <div class="card" style="padding:10px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);margin-bottom:6px;text-transform:uppercase">Groupe actif</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap" id="rlGsel">${Array.from({ length: ng }, (_, i) => `<button type="button" data-g="${i}" style="border:2px solid ${RL_COL[i % 6]};background:${rlSt.g === i ? RL_COL[i % 6] : 'var(--white,#fff)'};color:${rlSt.g === i ? '#fff' : 'inherit'};border-radius:10px;padding:6px 10px;font:700 0.8rem inherit;font-family:inherit;cursor:pointer">G${i + 1}</button>`).join('')}</div>
    <div style="font-size:0.7rem;color:var(--muted);margin-top:6px">Choisis un groupe puis coche les élèves : ils y vont.</div></div>
  <div class="card" style="padding:2px 10px;margin-bottom:8px" id="rlList">${noms.map((n) => { const g = grp[n]; return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--border)"><label style="display:flex;align-items:center;gap:9px;flex:1;min-width:0;cursor:pointer"><input type="checkbox" data-n="${rlEsc(n)}" ${g === rlSt.g ? 'checked' : ''} style="width:20px;height:20px"><span style="flex:1;min-width:0;font-size:0.9rem">${rlEsc(n)}${gen[n] ? ` <small style="color:var(--muted)">${gen[n]}</small>` : ''}</span></label>${g !== undefined ? `<span style="font-size:0.66rem;font-weight:700;border-radius:99px;padding:2px 8px;color:#fff;background:${RL_COL[g % 6]}">G${g + 1}</span>` : ''}${pill(n)}</div>`; }).join('')}</div>
  <div style="display:flex;gap:8px;margin-bottom:8px"><button type="button" class="btn btn-outline" id="rlPrev" style="flex:1">Reprendre la séance ${Math.max(1, s - 1)}</button><button type="button" class="btn btn-outline" id="rlVider">Vider</button></div>
  <div class="card" style="padding:10px 12px" id="rlOrdre"></div>
  <button type="button" class="btn btn-teal" id="rlImpG" style="margin-top:8px;width:100%">🖨️ Imprimer les groupes</button>`;
  rlRendreOrdre(d);
  const sauver = () => { rlSauver(cl, d); rlTabGroupes(); };
  document.getElementById('rlNbEq').onchange = (e) => { d.nbEq = +e.target.value; rlSauver(cl, d); rlTabGroupes(); };
  document.getElementById('rlGsel').onclick = (e) => { const b = e.target.closest('button[data-g]'); if (b) { rlSt.g = +b.dataset.g; rlTabGroupes(); } };
  document.getElementById('rlList').onchange = (e) => { const n = e.target.dataset.n; if (n === undefined) return; d.groupes[s] = d.groupes[s] || {}; if (e.target.checked) d.groupes[s][n] = rlSt.g; else delete d.groupes[s][n]; delete (d.ordre[s] || {})[rlSt.g]; sauver(); };
  document.getElementById('rlList').onclick = (e) => { const b = e.target.closest('button[data-niv]'); if (!b) return; const n = b.dataset.niv; const nx = { undefined: 'A', A: 'B', B: 'C', C: undefined }[d.niveau[n]]; if (nx) d.niveau[n] = nx; else delete d.niveau[n]; sauver(); };
  document.getElementById('rlEq').onclick = () => { d.groupes[s] = rlEquilibrer(noms, d.niveau, ng, gen, document.getElementById('rlMix').checked); delete d.ordre[s]; sauver(); showToast('⚖️ Groupes équilibrés'); };
  document.getElementById('rlPrev').onclick = () => { if (s > 1 && d.groupes[s - 1]) { d.groupes[s] = Object.assign({}, d.groupes[s - 1]); d.ordre[s] = JSON.parse(JSON.stringify(d.ordre[s - 1] || {})); sauver(); } else showToast('Rien à reprendre'); };
  document.getElementById('rlVider').onclick = () => { delete d.groupes[s]; delete d.ordre[s]; sauver(); };
  document.getElementById('rlImpG').onclick = () => rlImprimerGroupes(cl, s);
}
function rlRendreOrdre(d) {
  const cl = rlSt.cl, s = rlSt.s, box = document.getElementById('rlOrdre'); const ng = rlNbGroupes(d, cl);
  let h = `<div style="font-size:0.66rem;font-weight:700;color:var(--muted);margin-bottom:6px;text-transform:uppercase">Ordre de passage</div>`;
  let any = false;
  for (let g = 0; g < ng; g++) {
    const ordre = rlOrdreEffectif(d, s, g, cl); if (!ordre.length) continue; any = true;
    h += `<div style="margin:8px 0 2px;display:flex;align-items:center;gap:8px"><b style="color:${RL_COL[g % 6]}">Groupe ${g + 1}</b><button type="button" data-prop="${g}" style="margin-left:auto;border:0;background:#d9efee;color:#0a5a5a;border-radius:8px;padding:4px 9px;font:700 0.7rem inherit;font-family:inherit;cursor:pointer">Proposer</button></div>`;
    h += ordre.map((n, i) => `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:0.86rem"><span style="width:20px;color:var(--muted);font-weight:700">${i + 1}</span><span style="flex:1;min-width:0">${rlEsc(n)}${d.niveau[n] ? ` <small style="color:${RL_NIV[d.niveau[n]]};font-weight:700">${d.niveau[n]}</small>` : ''}</span><button type="button" data-mv="${g}|${i}|-1" style="border:1px solid var(--border);background:transparent;border-radius:7px;width:30px;height:28px;cursor:pointer" aria-label="Monter">↑</button><button type="button" data-mv="${g}|${i}|1" style="border:1px solid var(--border);background:transparent;border-radius:7px;width:30px;height:28px;cursor:pointer" aria-label="Descendre">↓</button></div>`).join('');
  }
  if (!any) h += `<div style="font-size:0.78rem;color:var(--muted)">Forme d'abord les groupes.</div>`;
  box.innerHTML = h;
  box.onclick = (e) => {
    const p = e.target.closest('button[data-prop]'), m = e.target.closest('button[data-mv]');
    if (p) { const g = +p.dataset.prop; d.ordre[s] = d.ordre[s] || {}; d.ordre[s][g] = rlOrdrePropose(rlMembres(d, s, g, cl), d.niveau); rlSauver(cl, d); rlRendreOrdre(d); }
    if (m) { const [g, i, dir] = m.dataset.mv.split('|').map(Number); const o = rlOrdreEffectif(d, s, g, cl); const j = i + dir; if (j < 0 || j >= o.length) return; [o[i], o[j]] = [o[j], o[i]]; d.ordre[s] = d.ordre[s] || {}; d.ordre[s][g] = o; rlSauver(cl, d); rlRendreOrdre(d); }
  };
}
function rlImprimerGroupes(cl, s) {
  const d = rlLire(cl), ng = rlNbGroupes(d, cl);
  const blocs = Array.from({ length: ng }, (_, g) => { const o = rlOrdreEffectif(d, s, g, cl); return `<div class="b"><h2>Groupe ${g + 1}</h2><ol>${o.map((n) => `<li>${rlEsc(n)}</li>`).join('')}</ol></div>`; }).join('');
  docImprimerHtml(`<html><head><style>@page{size:A4 portrait;margin:12mm}h1{font-size:16pt;margin:0 0 6mm}.g{display:grid;grid-template-columns:1fr 1fr;gap:5mm}.b{border:0.4mm solid #333;border-radius:2mm;padding:3mm 5mm}h2{font-size:12pt;margin:0 0 2mm}ol{margin:0;padding-left:6mm;font-size:12pt;line-height:1.7}</style></head><body><h1>Relais · ${cl} · Séance ${s} : groupes et ordre de passage</h1><div class="g">${blocs}</div></body></html>`);
}

/* ── Onglet Terrain ── */
function rlTabTerrain() {
  const cl = rlSt.cl, d = rlLire(cl), el = document.getElementById('rlTab');
  el.innerHTML = `<canvas id="rlcvT" width="600" height="400" style="width:100%;height:auto;display:block;border-radius:10px" aria-label="Terrain de foot, circuit intérieur, départ au milieu du côté droit"></canvas>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0">
    <label style="font-size:0.66rem;font-weight:700;color:var(--muted)">Longueur du tour intérieur (m)<input id="rlTour" type="number" inputmode="numeric" value="${rlEsc(d.tour)}" placeholder="à mesurer" style="width:100%;padding:8px;font-size:1rem;box-sizing:border-box"></label>
    <label style="font-size:0.66rem;font-weight:700;color:var(--muted)">Zone de passage (m)<input id="rlZl" type="number" inputmode="numeric" value="${d.zoneLong}" style="width:100%;padding:8px;font-size:1rem;box-sizing:border-box"></label></div>
  <div class="card" style="padding:10px 12px" id="rlCalc"></div>
  <div style="font-size:0.72rem;color:var(--muted);margin-top:8px;line-height:1.4">Le circuit passe à l'intérieur du terrain, il ne fait donc pas 120 m. Mesure-le une fois (roue ou décamètre) : tout se calcule ensuite. Départ au milieu du côté droit.</div>`;
  const maj = () => {
    const n = d.nbEq, t = parseFloat(document.getElementById('rlTour').value);
    const cv = document.getElementById('rlcvT'), ctx = cv.getContext('2d');
    rlDessiner(ctx, 600, 400, { fond: 'foot', objets: [{ k: 'circuit', n }], acteurs: [] }, 0);
    document.getElementById('rlCalc').innerHTML = `<div style="display:flex;gap:10px"><div style="flex:1"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Distance par relayeur</div><div style="font-weight:800;font-size:1.3rem">${t > 0 ? Math.round(t / n) + ' m' : '—'}</div></div><div style="flex:1"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Passages</div><div style="font-weight:700">${n - 1} zones de ${d.zoneLong} m</div></div></div>${t > 0 ? `<div style="font-size:0.78rem;margin-top:6px">Temps de référence à 12 km/h : <b>${Math.round(t / (12 / 3.6))} s</b> par équipe, <b>${Math.round(t / n / (12 / 3.6))} s</b> par relayeur.</div>` : ''}`;
  };
  document.getElementById('rlTour').oninput = (e) => { d.tour = e.target.value; rlSauver(cl, d); maj(); };
  document.getElementById('rlZl').oninput = (e) => { d.zoneLong = parseInt(e.target.value, 10) || 20; rlSauver(cl, d); maj(); };
  maj();
}

/* ── Onglet Notation : on coche bons points et erreurs, la note vient du barème de la classe ── */
const RL_PASS = [['ok', '✓ Bon', '2 pts', '#2a9d8f', 2], ['lim', '~ Limite', '1 pt', '#d98a00', 1], ['ko', '✗ Raté', '0 pt', '#c8382e', 0]];
const RL_ENG = [['fond', '✓ À fond', 1], ['enc', '✓ Encourage', 1], ['rel', '✗ Relâche', 0], ['ral', '✗ Ralentit avant la fin', 0], ['des', '✗ Se désintéresse', 0]];
function rlNum(t) { return parseFloat(String(t).replace(',', '.')); }
function rlBareme(cl) {
  try { return baremeNiveau(SPORTS.find((x) => x.id === 'relais'), cl); } catch (e) { return null; }
}
function rlCrit(b, id) { return b && b.criteres.find((c) => c.id === id); }
// Points du temps, lus dans le tableau du barème de la classe (« 106–114 s » = de 106 inclus à 114 exclu)
function rlPtsTemps(b, t) {
  const c = rlCrit(b, 'temps'); if (!c || !(t > 0)) return null;
  for (const [lib, pts] of c.table) {
    const l = lib.replace(/\s/g, '').replace(/,/g, '.');
    let m;
    if ((m = l.match(/^<([\d.]+)/))) { if (t < +m[1]) return +pts; }
    else if ((m = l.match(/^>([\d.]+)/))) { if (t >= +m[1]) return +pts; }
    else if ((m = l.match(/^([\d.]+)[–-]([\d.]+)/))) { if (t >= +m[1] && t < +m[2]) return +pts; }
  }
  return null;
}
// Régularité : écart entre meilleur et moins bon essai valide, disqualifications (seuils lus dans le barème)
function rlPtsRegul(b, essais) {
  const c = rlCrit(b, 'regul'); if (!c) return null;
  const faits = essais.filter((e) => e && (e.dq || rlNum(e.t) > 0));
  if (faits.length < 3) return null;
  const dq = faits.filter((e) => e.dq).length; if (dq >= 3) return 0; if (dq === 2) return 1; if (dq === 1) return 2;
  const ts = faits.map((e) => rlNum(e.t)), ec = Math.max(...ts) - Math.min(...ts);
  const l0 = c.table[0][0].replace(/,/g, '.'), l1 = c.table[1][0].replace(/,/g, '.');
  const a = parseFloat((l0.match(/<\s*([\d.]+)/) || [])[1]), bb = parseFloat((l1.match(/[\d.]+\s*[–-]\s*([\d.]+)/) || [])[1]);
  if (!(a > 0) || !(bb > 0)) return null;
  return ec < a ? 4 : ec < bb ? 3 : 2;
}
function rlPtsEngage(e) {
  if (!e) return null; const n = ['fond', 'enc', 'rel', 'ral', 'des'].filter((k) => e[k]).length; if (!n) return null;
  if (e.des) return 1; if (e.ral) return 2; if (e.rel || !e.fond) return 3; return e.enc ? 4 : 3;
}
function rlBilan(cl, s, g) {
  const d = rlLire(cl), b = rlBareme(cl), z = ((d.zone[s] || {})[g]) || {}, o = rlOrdreEffectif(d, s, g, cl);
  const ess = z.essais || [{}, {}, {}];
  const valides = ess.filter((e) => e && !e.dq && rlNum(e.t) > 0).map((e) => rlNum(e.t));
  const meilleur = valides.length ? Math.min(...valides) : null;
  const ptsT = meilleur !== null ? rlPtsTemps(b, meilleur) : (ess.filter((e) => e && e.dq).length >= 3 ? 0 : null);
  const ptsR = rlPtsRegul(b, ess);
  const np = Math.max(1, o.length - 1), ps = (z.p || []).slice(0, np);
  const nbP = ps.filter(Boolean).length;
  const somme = ps.reduce((a, x) => a + (({ ok: 2, lim: 1, ko: 0 })[x] || 0), 0);
  const ptsP = nbP === np ? Math.round(somme / (2 * np) * 6) : null;
  const sous = ptsP === null ? null : [Math.min(2, ptsP), Math.min(2, Math.max(0, ptsP - 2)), Math.max(0, ptsP - 4)];
  return { d, b, z, o, meilleur, ptsT, ptsR, ptsP, sous, np, nbP, ess };
}
function rlTabZone() {
  const cl = rlSt.cl, s = rlSt.s, el = document.getElementById('rlTab');
  const d0 = rlLire(cl), ng = rlNbGroupes(d0, cl);
  const gs = Array.from({ length: ng }, (_, g) => g).filter((g) => rlMembres(d0, s, g, cl).length);
  if (!gs.length) { el.innerHTML = `<div class="card" style="padding:12px;font-size:0.85rem">Forme d'abord les groupes de la séance ${s}.</div>`; return; }
  if (!gs.includes(rlSt.g)) rlSt.g = gs[0];
  const g = rlSt.g, B = rlBilan(cl, s, g), d = B.d, o = B.o;
  const chip = (on, col) => `border:2px solid ${col};background:${on ? col : 'transparent'};color:${on ? '#fff' : 'inherit'};border-radius:9px;font:700 0.74rem inherit;font-family:inherit;cursor:pointer`;
  const pts = (v, max) => (v === null || v === undefined ? '—' : v + '/' + max);
  const essais = [0, 1, 2].map((i) => { const e = B.ess[i] || {}; return `<div style="display:flex;gap:8px;align-items:center;padding:6px 0;border-top:1px solid var(--border)"><b style="width:58px;font-size:0.82rem">Essai ${i + 1}</b><input data-t="${i}" type="number" step="0.1" inputmode="decimal" value="${rlEsc(e.t || '')}" placeholder="temps (s)" ${e.dq ? 'disabled' : ''} style="flex:1;min-width:0;padding:8px;font-size:1rem"><button type="button" data-dq="${i}" style="${chip(e.dq, '#c8382e')};padding:8px 10px">✗ Disqualifié</button></div>`; }).join('');
  const passages = o.slice(0, -1).map((n, i) => { const v = (B.z.p || [])[i];
    return `<div style="padding:7px 0;border-top:1px solid var(--border)"><div style="font-size:0.82rem;margin-bottom:5px"><b>Passage ${i + 1}</b> · ${rlEsc(n)} → ${rlEsc(o[i + 1])}</div><div style="display:flex;gap:6px">${RL_PASS.map(([k, l, p, col]) => `<button type="button" data-z="${i}|${k}" style="${chip(v === k, col)};flex:1;padding:7px 2px">${l}<br><small>${p}</small></button>`).join('')}</div></div>`; }).join('');
  const eleves = o.map((n) => { const e = (B.z.eng || {})[n] || {}; const p = rlPtsEngage(e);
    return `<div style="padding:7px 0;border-top:1px solid var(--border)"><div style="display:flex;justify-content:space-between;font-size:0.86rem;margin-bottom:5px"><b>${rlEsc(n)}</b><span style="color:var(--muted)">Engagement : <b>${pts(p, 4)}</b></span></div><div style="display:flex;gap:5px;flex-wrap:wrap">${RL_ENG.map(([k, l, bon]) => `<button type="button" data-e="${rlEsc(n)}|${k}" style="${chip(e[k], bon ? '#2a9d8f' : '#c8382e')};padding:6px 8px">${l}</button>`).join('')}</div></div>`; }).join('');
  const recap = o.map((n) => { const p = rlPtsEngage(((B.z.eng || {})[n]) || {}); const tot = [B.ptsT, B.sous ? B.ptsP : null, p, B.ptsR]; const ok = tot.every((x) => x !== null); return `<tr><td>${rlEsc(n)}</td><td>${pts(B.ptsT, 6)}</td><td>${pts(B.ptsP, 6)}</td><td>${pts(p, 4)}</td><td>${pts(B.ptsR, 4)}</td><td><b>${ok ? tot.reduce((a, x) => a + x, 0) + '/20' : '—'}</b></td></tr>`; }).join('');
  el.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${gs.map((x) => `<button type="button" data-gz="${x}" style="border:2px solid ${RL_COL[x % 6]};background:${x === g ? RL_COL[x % 6] : 'var(--white,#fff)'};color:${x === g ? '#fff' : 'inherit'};border-radius:10px;padding:6px 10px;font:700 0.8rem inherit;font-family:inherit;cursor:pointer">G${x + 1}</button>`).join('')}</div>
  <div style="font-size:0.72rem;color:var(--muted);margin-bottom:8px">Barème ${cl} : tu coches, les points se calculent avec les seuils de cette classe. Équipe : temps, passages, régularité. Individuel : engagement.</div>
  <div class="card" style="padding:6px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase;padding-top:4px">⏱ Essais de l'équipe · Temps ${pts(B.ptsT, 6)}${B.meilleur !== null ? ' (meilleur ' + B.meilleur + ' s)' : ''} · Régularité ${pts(B.ptsR, 4)}</div>${essais}<div style="font-size:0.68rem;color:var(--muted);padding:4px 0">Disqualifié : zone ratée, témoin tombé, hors couloir. L'essai ne compte pas pour toute l'équipe.</div></div>
  <div class="card" style="padding:6px 12px;margin-bottom:8px"><div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase;padding-top:4px">🤝 Passages de témoin · ${pts(B.ptsP, 6)}</div>${passages}</div>
  <div class="card" style="padding:6px 12px;margin-bottom:8px"><div style="display:flex;align-items:center;padding-top:4px"><span style="flex:1;font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">🔥 Engagement par élève</span><button type="button" id="rlToutBon" style="border:0;background:#d9efee;color:#0a5a5a;border-radius:8px;padding:5px 9px;font:700 0.7rem inherit;font-family:inherit;cursor:pointer">Tout le groupe : à fond + encourage</button></div>${eleves}</div>
  <div class="card" style="padding:8px 10px;margin-bottom:8px;overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.76rem"><tr style="text-align:left;color:var(--muted)"><th>Élève</th><th>Temps</th><th>Passages</th><th>Engag.</th><th>Régul.</th><th>Total</th></tr>${recap}</table></div>
  <button type="button" class="btn btn-teal" id="rlReport" style="width:100%">📥 Reporter les notes dans le barème (${cl})</button>
  <button type="button" class="btn btn-outline" id="rlImpZ" style="margin-top:8px;width:100%">🖨️ Fiche papier d'observation</button>`;
  const zz = () => { d.zone[s] = d.zone[s] || {}; return (d.zone[s][g] = d.zone[s][g] || { p: [], essais: [{}, {}, {}], eng: {} }); };
  const garde = () => { const z = zz(); z.essais = z.essais || [{}, {}, {}]; z.eng = z.eng || {}; z.p = z.p || []; return z; };
  el.onclick = (e) => {
    const t = e.target, gb = t.closest('button[data-gz]'), pb = t.closest('button[data-z]'), dq = t.closest('button[data-dq]'), eb = t.closest('button[data-e]');
    if (gb) { rlSt.g = +gb.dataset.gz; rlTabZone(); return; }
    if (pb) { const [i, k] = pb.dataset.z.split('|'); const z = garde(); z.p[+i] = z.p[+i] === k ? undefined : k; }
    else if (dq) { const z = garde(), i = +dq.dataset.dq; z.essais[i] = z.essais[i] || {}; z.essais[i].dq = !z.essais[i].dq; }
    else if (eb) { const [n, k] = eb.dataset.e.split('|'); const z = garde(); const x = z.eng[n] = z.eng[n] || {}; x[k] = !x[k]; if (x[k] && k === 'fond') x.rel = x.ral = x.des = false; if (x[k] && (k === 'rel' || k === 'ral' || k === 'des')) x.fond = false; }
    else if (t.closest('#rlToutBon')) { const z = garde(); o.forEach((n) => { z.eng[n] = { fond: true, enc: true }; }); }
    else if (t.closest('#rlReport')) { rlReporter(cl, s, g); return; }
    else if (t.closest('#rlImpZ')) { rlImprimerZone(cl, s); return; }
    else return;
    rlSauver(cl, d); rlTabZone();
  };
  el.onchange = (e) => { const i = e.target.dataset.t; if (i === undefined) return; const z = garde(); z.essais[+i] = z.essais[+i] || {}; z.essais[+i].t = e.target.value; rlSauver(cl, d); rlTabZone(); };
}
// Écrit les notes dans le barème (notes-<année>.relais[classe]) puis recharge l'onglet Barèmes
function rlReporter(cl, s, g) {
  const B = rlBilan(cl, s, g);
  if (B.ptsT === null || B.ptsP === null || B.ptsR === null) { showToast('Il manque le temps, les 3 essais ou les passages'); return; }
  const sans = B.o.filter((n) => rlPtsEngage((B.z.eng || {})[n]) === null);
  if (sans.length) { showToast('Engagement à cocher pour ' + sans[0] + (sans.length > 1 ? ' et ' + (sans.length - 1) + ' autre(s)' : '')); return; }
  const k = 'notes-' + currentYear; let N = {}; try { N = JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) {}
  N.relais = N.relais || {}; const arr = (N.relais[cl] = N.relais[cl] || []);
  B.o.forEach((n) => {
    const eg = rlPtsEngage(B.z.eng[n]);
    const e = { prenom: n, scores: { temps: B.ptsT, passage_p1: B.sous[0], passage_p2: B.sous[1], passage_p3: B.sous[2], engage: eg, regul: B.ptsR }, total: B.ptsT + B.ptsP + eg + B.ptsR, max: 20 };
    const i = arr.findIndex((x) => x.prenom === n); if (i >= 0) arr[i] = e; else arr.push(e);
  });
  try { localStorage.setItem(k, JSON.stringify(N)); } catch (e) {}
  if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
  const f = document.getElementById('baremesFrame'); if (f && f.getAttribute('src')) f.setAttribute('src', 'baremes.html?v=' + Date.now());
  showToast('📥 ' + B.o.length + ' notes reportées dans le barème ' + cl);
}
function rlImprimerZone(cl, s) {
  const d = rlLire(cl), ng = rlNbGroupes(d, cl), n = d.nbEq;
  const fiche = (g) => { const o = rlOrdreEffectif(d, s, g, cl);
    return `<div class="f"><h2>Groupe ${g + 1}</h2><table><tr><th>Essai</th><th>Temps (s)</th><th>Disqualifié</th></tr>${[1, 2, 3].map((i) => `<tr><td>${i}</td><td></td><td>☐</td></tr>`).join('')}</table><table><tr><th>Passage</th><th>Qui → qui</th><th>Bon (2)</th><th>Limite (1)</th><th>Raté (0)</th></tr>${Array.from({ length: n - 1 }, (_, i) => `<tr><td>${i + 1}</td><td>${rlEsc(o[i] || '')} → ${rlEsc(o[i + 1] || '')}</td><td>☐</td><td>☐</td><td>☐</td></tr>`).join('')}</table><table><tr><th>Élève</th><th>À fond</th><th>Encourage</th><th>Relâche</th><th>Ralentit</th><th>Désintérêt</th></tr>${o.map((x) => `<tr><td>${rlEsc(x)}</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>`).join('')}</table></div>`; };
  docImprimerHtml(`<html><head><style>@page{size:A4 portrait;margin:10mm}h1{font-size:14pt;margin:0 0 3mm}.f{margin-bottom:5mm;break-inside:avoid}h2{font-size:11pt;margin:0 0 1.5mm}table{width:100%;border-collapse:collapse;font-size:9.5pt;margin-bottom:2mm}th,td{border:0.3mm solid #333;padding:1.5mm 2.5mm;text-align:left}td:nth-child(n+3){text-align:center;font-size:12pt}</style></head><body><h1>Relais · ${cl} · Séance ${s} : fiche d'observation</h1>${Array.from({ length: ng }, (_, g) => fiche(g)).join('')}</body></html>`);
}

/* ── Onglet Exercices ── */
function rlTabExos() {
  const el = document.getElementById('rlTab'), s = rlSt.s, tous = !!rlSt.tousExos; let liste = rlExos();
  const vus = liste.filter((e) => tous || (e.seances || []).includes(s));
  if (rlSt.ed) { rlEditeurExo(); return; }
  el.innerHTML = `<div style="display:flex;gap:6px;margin-bottom:8px"><button type="button" class="btn ${tous ? 'btn-outline' : 'btn-teal'}" data-vue="s" style="flex:1;padding:8px">Séance ${s}</button><button type="button" class="btn ${tous ? 'btn-teal' : 'btn-outline'}" data-vue="t" style="flex:1;padding:8px">Toute la base (${liste.length})</button></div>
  ${vus.map((e) => { const sp = rlSpecDe(e); return `<div class="card" style="padding:10px 12px;margin-bottom:10px"><div style="display:flex;align-items:center;gap:8px"><b style="flex:1;min-width:0;font-size:0.95rem">${rlEsc(e.titre)}</b><button type="button" data-edit="${e.id}" style="border:1px solid var(--border);background:transparent;border-radius:8px;padding:5px 9px;cursor:pointer;font-size:0.76rem">✏️</button></div>
    ${sp ? `<div style="margin-top:8px">${rlHtmlLecteur(e.id)}</div>${sp.generee ? '<div style="font-size:0.66rem;color:var(--muted);margin-top:4px">Schéma généré : il montre l\'intention de l\'exercice, à ajuster si besoin.</div>' : ''}` : ''}
    <div style="font-size:0.82rem;line-height:1.45;margin-top:8px"><b>Organisation :</b> ${rlEsc(e.org)}</div><div style="font-size:0.82rem;line-height:1.45;margin-top:3px"><b>Consigne :</b> ${rlEsc(e.consigne)}</div>
    <div style="font-size:0.68rem;color:var(--muted);margin-top:5px">Séances : ${(e.seances || []).join(', ') || '—'}</div></div>`; }).join('') || '<div class="card" style="padding:12px;font-size:0.85rem">Aucun exercice pour cette séance.</div>'}
  <button type="button" class="btn btn-teal" id="rlNew" style="width:100%">+ Ajouter un exercice</button>`;
  vus.forEach((e) => rlLecteur(e.id, () => rlSpecDe(e)));
  el.onclick = (ev) => {
    const v = ev.target.closest('button[data-vue]'), ed = ev.target.closest('button[data-edit]');
    if (v) { rlSt.tousExos = v.dataset.vue === 't'; rlTabExos(); }
    if (ed) { rlSt.ed = { id: ed.dataset.edit }; rlTabExos(); }
    if (ev.target.closest('#rlNew')) { rlSt.ed = { id: null }; rlTabExos(); }
  };
}
function rlEditeurExo() {
  const el = document.getElementById('rlTab'), liste = rlExos();
  const ex = liste.find((x) => x.id === rlSt.ed.id) || { id: null, titre: '', org: '', consigne: '', seances: [rlSt.s], anim: { mode: 'gen' } };
  rlSt.ed.exo = rlSt.ed.exo || JSON.parse(JSON.stringify(ex));
  const e = rlSt.ed.exo, m = e.anim.mode;
  el.innerHTML = `<div class="card" style="padding:12px;display:flex;flex-direction:column;gap:8px">
    <b>${ex.id ? 'Modifier l\'exercice' : 'Nouvel exercice'}</b>
    <input id="rxT" type="text" placeholder="Titre (ex. Relais navette 4 × 30 m)" value="${rlEsc(e.titre)}" style="width:100%;padding:9px;font-size:1rem;box-sizing:border-box">
    <textarea id="rxO" rows="2" placeholder="Organisation (ex. équipes de 4, couloirs de 30 m)" style="width:100%;padding:9px;font-size:0.95rem;box-sizing:border-box">${rlEsc(e.org)}</textarea>
    <textarea id="rxC" rows="2" placeholder="Consigne" style="width:100%;padding:9px;font-size:0.95rem;box-sizing:border-box">${rlEsc(e.consigne)}</textarea>
    <div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Séances</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${Array.from({ length: RL_NSEANCES }, (_, i) => `<label style="display:flex;gap:4px;align-items:center;font-size:0.84rem"><input type="checkbox" data-sx="${i + 1}" ${(e.seances || []).includes(i + 1) ? 'checked' : ''} style="width:18px;height:18px">S${i + 1}</label>`).join('')}</div>
    <div style="font-size:0.66rem;font-weight:700;color:var(--muted);text-transform:uppercase">Animation</div>
    <select id="rxM" style="width:100%;padding:9px;font-size:1rem"><option value="gen"${m === 'gen' ? ' selected' : ''}>Schéma généré à partir du texte</option><option value="lib"${m === 'lib' ? ' selected' : ''}>Une animation de la bibliothèque</option><option value="custom"${m === 'custom' ? ' selected' : ''}>Je la dessine moi-même</option><option value="none"${m === 'none' ? ' selected' : ''}>Pas d'animation</option></select>
    <div id="rxA"></div>
    <div style="display:flex;gap:8px"><button type="button" class="btn btn-teal" id="rxSave" style="flex:1">Enregistrer</button><button type="button" class="btn btn-outline" id="rxCancel">Annuler</button>${ex.id ? '<button type="button" class="btn btn-outline" id="rxDel" style="color:#c8382e">Supprimer</button>' : ''}</div></div>`;
  const lire = () => { e.titre = document.getElementById('rxT').value; e.org = document.getElementById('rxO').value; e.consigne = document.getElementById('rxC').value; e.seances = Array.from(document.querySelectorAll('[data-sx]')).filter((x) => x.checked).map((x) => +x.dataset.sx); };
  const zone = () => {
    const box = document.getElementById('rxA'), mm = document.getElementById('rxM').value; e.anim.mode = mm;
    if (mm === 'lib') { e.anim.id = e.anim.id || RL_BIBLIO[0].id; box.innerHTML = `<select id="rxL" style="width:100%;padding:9px;font-size:1rem;margin-bottom:8px">${RL_BIBLIO.map((b) => `<option value="${b.id}"${b.id === e.anim.id ? ' selected' : ''}>${b.n}</option>`).join('')}</select>${rlHtmlLecteur('rx')}`; document.getElementById('rxL').onchange = (ev) => { e.anim.id = ev.target.value; zone(); }; rlLecteur('rx', () => rlSpecDe(e)); }
    else if (mm === 'gen') { lire(); box.innerHTML = `${rlHtmlLecteur('rx')}<div style="font-size:0.7rem;color:var(--muted);margin-top:4px">L'appli lit le titre et la consigne (équipes de 4, navette, zone de 20 m, tour…) et dessine la scène. Modifie le texte puis touche « Mettre à jour ».</div><button type="button" class="btn btn-outline" id="rxUp" style="margin-top:6px">Mettre à jour le schéma</button>`; document.getElementById('rxUp').onclick = () => { lire(); zone(); }; rlLecteur('rx', () => rlSpecDe(e)); }
    else if (mm === 'custom') { box.innerHTML = rlHtmlEditeurAnim(e); rlInitEditeur(e); }
    else box.innerHTML = '';
  };
  document.getElementById('rxM').onchange = () => { lire(); zone(); };
  document.getElementById('rxCancel').onclick = () => { rlSt.ed = null; rlTabExos(); };
  const del = document.getElementById('rxDel'); if (del) del.onclick = () => { rlExosSauver(liste.filter((x) => x.id !== ex.id)); rlSt.ed = null; rlTabExos(); showToast('Exercice supprimé'); };
  document.getElementById('rxSave').onclick = () => {
    lire(); if (!e.titre.trim()) { showToast('Donne un titre à l\'exercice'); return; }
    if (e.anim.mode === 'custom' && !(e.anim.spec && (e.anim.spec.acteurs || []).length)) { showToast('Place au moins un élève sur le terrain'); return; }
    const out = liste.slice(); if (ex.id) { out[out.findIndex((x) => x.id === ex.id)] = e; } else { e.id = 'u' + Date.now(); out.push(e); }
    rlExosSauver(out); rlSt.ed = null; showToast('Exercice enregistré'); rlTabExos();
  };
  zone();
}

/* ── Éditeur de dessin : plots, zones, élèves, trajets, ordre des départs ── */
function rlHtmlEditeurAnim(e) {
  e.anim.spec = e.anim.spec || { fond: 'foot', objets: [], acteurs: [], dur: 8000 };
  return `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px" id="edTools">${[['coureur', '🏃 Élève'], ['trajet', '〰️ Trajet'], ['plot', '🔶 Plot'], ['zone', '🟨 Zone'], ['gomme', '🧽 Gomme']].map(([k, l]) => `<button type="button" data-tool="${k}" style="border:0;border-radius:8px;padding:7px 9px;font:700 0.76rem inherit;font-family:inherit;cursor:pointer">${l}</button>`).join('')}</div>
  <canvas id="edCv" width="600" height="330" style="width:100%;height:auto;display:block;border-radius:10px;touch-action:none;background:#3f8f4f" aria-label="Zone de dessin"></canvas>
  <div id="edHint" style="font-size:0.72rem;color:var(--muted);margin:4px 0"></div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"><button type="button" class="btn btn-outline" id="edUndo" style="padding:6px 10px">↶ Annuler</button><button type="button" class="btn btn-outline" id="edClear" style="padding:6px 10px">Tout effacer</button><button type="button" class="btn btn-outline" id="edSeq" style="padding:6px 10px">Enchaîner les départs</button><select id="edFond" style="padding:6px;font-size:0.85rem"><option value="foot">Terrain de foot</option><option value="vide">Fond neutre</option></select></div>
  <div id="edActs"></div>
  ${rlHtmlLecteur('rx')}`;
}
function rlInitEditeur(e) {
  const spec = e.anim.spec, cv = document.getElementById('edCv'), ctx = cv.getContext('2d');
  let tool = 'coureur', sel = -1, p0 = null; const hist = [];
  const snap = () => hist.push(JSON.stringify(spec)); const dessiner = () => rlDessiner(ctx, 600, 330, spec, 0);
  const HINT = { coureur: 'Touche le terrain pour poser un élève.', trajet: 'Touche un élève pour le choisir, puis touche les points de son trajet.', plot: 'Touche pour poser un plot.', zone: 'Touche deux coins pour tracer la zone.', gomme: 'Touche un élément pour l\'effacer.' };
  const maj = () => {
    document.querySelectorAll('#edTools button').forEach((b) => { const on = b.dataset.tool === tool; b.style.background = on ? '#0e7c7b' : '#d9efee'; b.style.color = on ? '#fff' : '#0a5a5a'; });
    document.getElementById('edHint').textContent = HINT[tool] + (tool === 'trajet' && sel >= 0 ? ' (élève ' + spec.acteurs[sel].lbl + ' choisi)' : '');
    document.getElementById('edFond').value = spec.fond;
    document.getElementById('edActs').innerHTML = spec.acteurs.map((a, i) => `<div style="display:flex;gap:6px;align-items:center;font-size:0.76rem;padding:3px 0"><span style="width:22px;height:22px;border-radius:50%;background:${a.c};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700">${a.lbl}</span>part à <input type="range" data-t0="${i}" min="0" max="90" value="${Math.round(a.t0 * 100)}" style="width:70px"> arrive à <input type="range" data-t1="${i}" min="10" max="100" value="${Math.round(a.t1 * 100)}" style="width:70px"><label style="margin-left:auto"><input type="checkbox" data-tem="${i}" ${a.tem ? 'checked' : ''}> témoin</label></div>`).join('');
    dessiner(); rlLecteur('rx', () => (spec.acteurs.length ? spec : null));
  };
  const pos = (ev) => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height]; };
  const proche = (x, y, pts, r) => pts.some((p) => Math.hypot((p[0] - x) * 600, (p[1] - y) * 330) < r);
  cv.onpointerdown = (ev) => {
    ev.preventDefault(); const [x, y] = pos(ev);
    if (tool === 'coureur') { snap(); const n = spec.acteurs.filter((a) => !a.bat).length; spec.acteurs.push({ lbl: String(n + 1), c: RL_COULEURS[n % 6], t0: 0, t1: 1, pts: [[x, y]], tem: 1 }); sel = spec.acteurs.length - 1; }
    else if (tool === 'trajet') { const i = spec.acteurs.findIndex((a) => proche(x, y, [a.pts[0]], 22)); if (i >= 0) sel = i; else if (sel >= 0) { snap(); spec.acteurs[sel].pts.push([x, y]); } }
    else if (tool === 'plot') { snap(); spec.objets.push({ k: 'plot', x, y }); }
    else if (tool === 'zone') { if (!p0) { p0 = [x, y]; } else { snap(); spec.objets.push({ k: 'zone', x: Math.min(p0[0], x), y: Math.min(p0[1], y), w: Math.abs(x - p0[0]), h: Math.abs(y - p0[1]) }); p0 = null; } }
    else if (tool === 'gomme') {
      const ia = spec.acteurs.findIndex((a) => proche(x, y, [a.pts[0]], 22)); if (ia >= 0) { snap(); spec.acteurs.splice(ia, 1); sel = -1; }
      else { const io = spec.objets.findIndex((o) => (o.k === 'plot' && proche(x, y, [[o.x, o.y]], 20)) || (o.k === 'zone' && x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h)); if (io >= 0) { snap(); spec.objets.splice(io, 1); } }
    }
    maj();
  };
  document.getElementById('edTools').onclick = (ev) => { const b = ev.target.closest('button[data-tool]'); if (b) { tool = b.dataset.tool; p0 = null; maj(); } };
  document.getElementById('edUndo').onclick = () => { if (!hist.length) return; const s = JSON.parse(hist.pop()); spec.fond = s.fond; spec.objets = s.objets; spec.acteurs = s.acteurs; sel = -1; maj(); };
  document.getElementById('edClear').onclick = () => { snap(); spec.objets = []; spec.acteurs = []; sel = -1; maj(); };
  document.getElementById('edFond').onchange = (ev) => { spec.fond = ev.target.value; maj(); };
  document.getElementById('edSeq').onclick = () => { snap(); const l = spec.acteurs.filter((a) => !a.bat); l.forEach((a, i) => { a.t0 = i / l.length; a.t1 = (i + 1) / l.length; }); maj(); };
  document.getElementById('edActs').oninput = (ev) => {
    const t = ev.target; const i = +(t.dataset.t0 ?? t.dataset.t1 ?? t.dataset.tem); const a = spec.acteurs[i]; if (!a) return;
    if (t.dataset.t0 !== undefined) a.t0 = Math.min(+t.value / 100, a.t1 - .05); if (t.dataset.t1 !== undefined) a.t1 = Math.max(+t.value / 100, a.t0 + .05); if (t.dataset.tem !== undefined) a.tem = t.checked ? 1 : 0;
    dessiner(); rlLecteur('rx', () => spec);
  };
  maj();
}

/* ───────────── Intégration à l'accueil ───────────── */
function boutonRelais(sd, cl, col, num, petit) {
  if (!sd || sd.id !== 'relais') return '';
  if (petit) return `<button onclick="relaisOuvrir('${cl}',${num || 1})" title="Relais : groupes, exercices animés, notation" style="flex-shrink:0;background:${col};color:#fff;border:none;border-radius:7px;width:30px;height:30px;font-size:0.85rem;cursor:pointer;display:flex;align-items:center;justify-content:center">🏃</button>`;
  return `<button onclick="relaisOuvrir('${cl}',${num || 1})" title="Groupes, exercices animés et notation du relais" style="background:${col};color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif">🏃 Relais</button>`;
}
