/* Note automatique : pour les critères mesurables (temps, distance, nombre…), on saisit la valeur mesurée
   et la note se déduit du barème de la classe (le tableau « table » de chaque critère).
   Élèves adaptés (PAI/PAP) : la performance est évaluée avec une tolérance (facteur 0,8) sur les seuls critères
   « adapte:true » — 12 min pour 15, un temps 25 % plus long, une distance 20 % plus courte…

   sens : 'haut' = plus la valeur est grande, mieux c'est ; 'bas' = plus elle est petite, mieux c'est.
   adapte : le facteur de tolérance s'applique à ce critère pour un élève adapté.
   cnt : valeur entière (comptage) — la tolérance est arrondie à l'entier inférieur. */
(function (root) {
  const FACTEUR_ADAPTE = 0.8;
  const R = (sens, adapte, cnt, ent, unite) => ({ sens, adapte: !!adapte, cnt: !!cnt, ent: !!ent, unite });
  const REGLES = {
    'course-longue': { duree: R('haut', 1, 0, 1), projet: R('bas', 1), vma: R('haut', 1), regul: R('bas', 0) },
    'demi-fond': { duree: R('haut', 1), regul: R('bas', 0), projet: R('bas', 1), vma: R('haut', 1), perf: R('haut', 1) },
    sprint: { perf: R('bas', 1), regul: R('bas', 0) },
    basket: { perf: R('haut', 1, 1), regles: R('bas', 0, 1) },
    football: { perf: R('haut', 1, 1), regles: R('bas', 0, 1) },
    rugby: { perf: R('haut', 1, 1), regles: R('bas', 0, 1) },
    'ballon-prisonnier': { regles: R('bas', 0, 1) },
    lutte: { perf: R('haut', 1, 1) },
    'tennis-table': { regul: R('haut', 0), service: R('haut', 0, 1, 0, 'essais') },
    combine: { course: R('bas', 1), saut: R('haut', 1), lancer: R('haut', 1), projet: R('bas', 0, 1) },
    renfo: { tech: R('haut', 1, 1), connaissance: R('haut', 0, 1), progres: R('haut', 0, 1) },
    'course-orientation': { balises: R('haut', 0) },
    'co-temp': { bal: R('haut', 0), balises: R('haut', 0) }
  };

  const num = (x) => parseFloat(x);
  /** Une ligne du tableau (ex. « 106–114 s », « ≥ 13 km/h », « 3–4 paniers ») → intervalle, ou null. */
  function parseLigne(label) {
    const s = String(label).replace(/ /g, ' ').replace(/(\d),(\d)/g, '$1.$2').trim();
    if (/aléatoire/i.test(s)) return { lo: -Infinity, hi: 1, hiS: true, unite: '' };
    if (/aucun|absent|refus|impliqu|\d+\s*[a-zé]+\s*\+\s*\d/i.test(s)) return null;
    let m, o;
    if ((m = /plus de\s*(\d+(?:\.\d+)?)/i.exec(s))) o = { lo: num(m[1]), hi: Infinity, loS: true };
    else if ((m = /(<|≤)\s*(\d+(?:\.\d+)?)/.exec(s))) o = { lo: -Infinity, hi: num(m[2]), hiS: m[1] === '<' };
    else if ((m = /(>|≥)\s*(\d+(?:\.\d+)?)/.exec(s))) o = { lo: num(m[2]), hi: Infinity, loS: m[1] === '>' };
    else if ((m = /(\d+(?:\.\d+)?)\s*(?:–|-|à)\s*(\d+(?:\.\d+)?)/.exec(s))) o = { lo: num(m[1]), hi: num(m[2]) };
    else if ((m = /(\d+(?:\.\d+)?)\s*\+/.exec(s))) o = { lo: num(m[1]), hi: Infinity };
    else if ((m = /(\d+(?:\.\d+)?)\s*\/\s*\d+/.exec(s))) o = { lo: num(m[1]), hi: num(m[1]) };
    else if ((m = /(\d+(?:\.\d+)?)/.exec(s))) o = { lo: num(m[1]), hi: num(m[1]) };
    else return null;
    const suf = /[\d.]+\s*([^\d.]*)$/.exec(s);
    let unite = suf ? suf[1].trim().split(/\s+/)[0] : '';
    if (!unite) { const pre = /^([A-Za-zÀ-ÿ]+)/.exec(s); unite = pre ? pre[1].toLowerCase() : ''; }
    o.unite = unite.replace(/^[,;.]+/, '');
    return o;
  }

  /** Tableau d'un critère → { lignes:[{lo,hi,loS,hiS,pts}], unite } ou null si non utilisable. */
  function tableau(sportId, crit) {
    const rg = REGLES[sportId] && REGLES[sportId][crit.id];
    if (!rg || !crit.table || crit.sous) return null;
    const lignes = [];
    for (const [lab, pts] of crit.table) {
      const l = parseLigne(lab); if (!l) continue;
      const pm = /^(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?$/.exec(String(pts).trim()); if (!pm) return null;
      const a = num(pm[1]), b = pm[2] === undefined ? a : num(pm[2]);
      l.pts = Math.min(a, b); l.ptsMax = Math.max(a, b); lignes.push(l);
    }
    if (lignes.length < 3) return null;
    const unite = rg.unite || (lignes.find((l) => l.unite) || {}).unite || '';
    if (/^victoire/.test(unite)) return null; // résultats d'équipe : déjà gérés par les outils Basket / Badminton / Relais
    return { lignes, unite, sens: rg.sens, adapte: rg.adapte, cnt: rg.cnt, ent: rg.ent };
  }

  function dans(l, v) {
    return (l.loS ? v > l.lo : v >= l.lo) && (l.hiS ? v < l.hi : v <= l.hi);
  }
  /** Valeur équivalente pour un élève adapté (tolérance). */
  function equivalent(t, v, adapte) {
    if (!adapte || !t.adapte) return v;
    const e = t.sens === 'haut' ? v / FACTEUR_ADAPTE : v * FACTEUR_ADAPTE;
    return Math.round((t.cnt && t.sens === 'bas' ? Math.floor(e + 1e-9) : e) * 1e6) / 1e6;
  }
  /** Points pour une valeur mesurée (ligne la plus proche si la valeur tombe entre deux lignes). */
  function points(t, valeur, adapte) {
    let v = equivalent(t, num(valeur), adapte);
    if (!isFinite(v)) return null;
    if (t.ent) v = Math.floor(v + 1e-9);
    let l = t.lignes.find((x) => dans(x, v));
    if (!l) {
      const d = (x) => (v < x.lo ? x.lo - v : v - x.hi);
      l = t.lignes.slice().sort((a, b) => d(a) - d(b))[0];
    }
    let pts = l.pts;
    if (l.ptsMax > l.pts && isFinite(l.lo)) { // points en fourchette : proportionnel dans l'intervalle
      const hi = isFinite(l.hi) ? l.hi : (t.unite === '%' ? 100 : l.lo);
      if (hi > l.lo) pts = Math.round(l.pts + Math.min(1, Math.max(0, (v - l.lo) / (hi - l.lo))) * (l.ptsMax - l.pts));
    }
    return { pts, equiv: v };
  }

  const API = { FACTEUR_ADAPTE, REGLES, parseLigne, tableau, points, equivalent };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BaremeAuto = API;
})(typeof window !== 'undefined' ? window : globalThis);
