// Barèmes : calcul des notes, « non évalué », statuts, ordre de saisie, sauvegarde, classes.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { demarrer, ANNEE } from "./outils.js";

let env;
before(async () => { env = await demarrer(); });
after(async () => { await env.arreter(); });

const total = (p, sport, cyc, scores) => p.evaluate(([s, c, sc]) => computeTotal(SPORTS.find((x) => x.id === s)[c].criteres, sc), [sport, cyc, scores]);

// Saisit un élève dans le barème ouvert (valeurs : nombre ou "NE").
async function saisir(p, sid, cyc, prenom, notes) {
  await p.fill(`#${sid}-${cyc}-prenom`, prenom);
  for (const [k, v] of Object.entries(notes)) {
    if (v === "NE") await p.click(`#${sid}-${cyc}-btn-${k} .pts-na`);
    else await p.click(`#${sid}-${cyc}-btn-${k} .pts-btn:nth-child(${v + 1})`);
  }
}

describe("Calcul du total", () => {
  it("relais 6e : somme simple des critères", async () => {
    const p = await env.page("baremes.html");
    assert.equal(await total(p, "relais", "c3", { temps: 3, passage_p1: 1, passage_p2: 2, passage_p3: 1, engage: 4, regul: 3 }), 14);
  });
  it("tous les barèmes valent 20 points", async () => {
    const p = await env.page("baremes.html");
    const faux = await p.evaluate(() => {
      const r = [];
      SPORTS.forEach((s) => ["c3", "c4"].forEach((c) => { if (s[c] && maxTotal(s[c].criteres) !== 20) r.push(s.id + " " + c + " = " + maxTotal(s[c].criteres)); }));
      return r;
    });
    assert.deepEqual(faux, []);
  });
  it("note maximale partout = 20/20", async () => {
    const p = await env.page("baremes.html");
    const faux = await p.evaluate(() => {
      const r = [];
      SPORTS.forEach((s) => ["c3", "c4"].forEach((c) => {
        if (!s[c]) return;
        const sc = {};
        s[c].criteres.forEach((cr) => { if (cr.sous) cr.sous.forEach((x) => { sc[cr.id + "_" + x.id] = x.max; }); else sc[cr.id] = cr.max; });
        if (computeTotal(s[c].criteres, sc) !== 20) r.push(s.id + " " + c);
      }));
      return r;
    });
    assert.deepEqual(faux, []);
  });
});

describe("Non évalué (NE)", () => {
  it("un passage NE : les passages sont recalculés sur ce qui est noté", async () => {
    const p = await env.page("baremes.html");
    assert.equal(await total(p, "relais", "c3", { temps: 3, passage_p1: 1, passage_p2: 2, passage_p3: "na", engage: 4, regul: 3 }), 14.5);
  });
  it("critère entier NE : le reste est ramené sur 20", async () => {
    const p = await env.page("baremes.html");
    assert.equal(await total(p, "relais", "c3", { temps: 6, passage_p1: "na", passage_p2: "na", passage_p3: "na", engage: 4, regul: 4 }), 20);
  });
  it("arrondi au demi-point", async () => {
    const p = await env.page("baremes.html");
    const t = await total(p, "relais", "c3", { temps: 5, passage_p1: 1, passage_p2: 1, passage_p3: "na", engage: 3, regul: "na" });
    assert.equal(t * 2, Math.round(t * 2));
  });
  it("saisie avec le bouton NE, enregistrement et affichage « NE »", async () => {
    const p = await env.page("baremes.html");
    await p.evaluate(() => { setClasse("6e"); showPanel("relais"); });
    await saisir(p, "relais", "c3", "Zakarya", { temps: 3, passage_p1: 1, passage_p2: 2, passage_p3: "NE", engage: 4, regul: 3 });
    assert.match(await p.innerText("#relais-c3-total"), /14\.5/);
    await p.click("#relais-c3-valider");
    const liste = await p.innerText("#relais-c3-liste");
    assert.match(liste, /Passage 3 NE/);
    assert.match(liste, /14\.5\/20/);
    assert.deepEqual(p.erreurs, []);
  });
});

describe("Saisie des élèves", () => {
  it("le premier saisi reste en haut de la liste", async () => {
    const p = await env.page("baremes.html");
    await p.evaluate(() => { setClasse("6e"); showPanel("relais"); });
    for (const n of ["Amina", "Bilal", "Chaïma"]) {
      await saisir(p, "relais", "c3", n, { temps: 1, passage_p1: 1, passage_p2: 1, passage_p3: 1, engage: 1, regul: 1 });
      await p.click("#relais-c3-valider");
    }
    const noms = await p.$$eval("#relais-c3-liste .eleve-prenom", (els) => els.map((e) => e.textContent));
    assert.deepEqual(noms, ["Amina", "Bilal", "Chaïma"]);
  });
  it("Absent(e) et Non noté(e)", async () => {
    const p = await env.page("baremes.html");
    await p.evaluate(() => { setClasse("6e"); showPanel("relais"); });
    await p.fill("#relais-c3-prenom", "Idriss"); await p.click("#relais-c3-abs");
    await p.fill("#relais-c3-prenom", "Lina"); await p.click("#relais-c3-nn");
    const notes = await p.$$eval("#relais-c3-liste .eleve-note", (els) => els.map((e) => e.textContent.trim()));
    assert.deepEqual(notes, ["ABS", "NN"]);
  });
  it("Valider reste bloqué tant qu'un critère n'est pas rempli", async () => {
    const p = await env.page("baremes.html");
    await p.evaluate(() => { setClasse("6e"); showPanel("relais"); });
    await saisir(p, "relais", "c3", "Test", { temps: 3, passage_p1: 1 });
    assert.equal(await p.isDisabled("#relais-c3-valider"), true);
  });
});

describe("Sauvegarde des notes", () => {
  it("les notes restent après rechargement, rangées par année et par classe", async () => {
    const p = await env.page("baremes.html");
    await p.evaluate(() => { setClasse("5e"); showPanel("basket"); });
    const notes = await p.evaluate(() => {
      const sc = {}; SPORTS.find((s) => s.id === "basket").c4.criteres.forEach((c) => { if (c.sous) c.sous.forEach((x) => { sc[c.id + "_" + x.id] = 1; }); else sc[c.id] = 1; });
      return sc;
    });
    for (const [k, v] of Object.entries(notes)) await p.click(`#basket-c4-btn-${k} .pts-btn:nth-child(${v + 1})`);
    await p.fill("#basket-c4-prenom", "Romaissa");
    await p.click("#basket-c4-valider");
    const brut = await p.evaluate((a) => JSON.parse(localStorage.getItem("notes-" + a)), ANNEE);
    assert.equal(brut.basket["5e"][0].prenom, "Romaissa");
    await p.reload(); await p.waitForTimeout(300);
    await p.evaluate(() => { setClasse("5e"); showPanel("basket"); });
    assert.match(await p.innerText("#basket-c4-liste"), /Romaissa/);
    await p.evaluate(() => setClasse("4e"));
    assert.doesNotMatch(await p.innerText("#basket-c4-liste"), /Romaissa/);
  });
  it("lien d'import #import= : les élèves sont ajoutés sans doublon", async () => {
    const data = { sport: "basket", cl: "5e", eleves: [{ prenom: "Neyla", scores: {} }, { prenom: "Fahed", scores: {} }] };
    const b64 = Buffer.from(JSON.stringify(data)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const p = await env.page("baremes.html#import=" + b64);
    const brut = await p.evaluate((a) => JSON.parse(localStorage.getItem("notes-" + a)), ANNEE);
    assert.deepEqual(brut.basket["5e"].map((e) => e.prenom), ["Neyla", "Fahed"]);
  });
});

describe("Classes et sports", () => {
  it("Renfo visible seulement en 4e et 3e", async () => {
    const p = await env.page("baremes.html");
    const vis = {};
    for (const cl of ["6e", "5e", "4e", "3e"]) {
      await p.evaluate((c) => setClasse(c), cl);
      vis[cl] = await p.isVisible("#nav-renfo");
    }
    assert.deepEqual(vis, { "6e": false, "5e": false, "4e": true, "3e": true });
  });
  it("lien #sport=…&cl=… ouvre le bon sport et la bonne classe", async () => {
    const p = await env.page("baremes.html#sport=badminton&cl=3e");
    assert.equal(await p.evaluate(() => [currentClasse, document.querySelector(".sport-panel.active").id].join(" ")), "3e panel-badminton");
  });
  it("critères affichés à côté de la saisie sur PC après clic sur « Critères »", async () => {
    const p = await env.page("baremes.html");
    await p.evaluate(() => { setClasse("3e"); showPanel("badminton"); });
    await p.click("#badminton-tabs .tab:nth-child(2)");
    assert.equal(await p.isVisible("#badminton-c4-criteres"), true);
    assert.equal(await p.isVisible("#badminton-c4-saisie"), true);
  });
});

describe("Course longue 6e", () => {
  it("barème durée sur 15 min et gestion de l'allure (plus de variation en %)", async () => {
    const p = await env.page("baremes.html");
    const c = await p.evaluate(() => SPORTS.find((s) => s.id === "course-longue").c3.criteres.map((x) => x.id + ":" + x.max));
    assert.deepEqual(c, ["duree:6", "allure:6", "projet:5", "fiche:3"]);
    const t = await p.evaluate(() => SPORTS.find((s) => s.id === "course-longue").c3.criteres[0].table[0][0]);
    assert.equal(t, "15 min");
  });
  it("fiche de suivi : une page par élève, 10 séances, nom pré-rempli, sans emoji", async () => {
    const p = await env.page("baremes.html", { stockage: { ["eleves-" + ANNEE]: { "6e": ["Zakarya", "Aaroun"] } } });
    await p.evaluate(() => { setClasse("6e"); showPanel("course-longue"); });
    const [w] = await Promise.all([p.context().waitForEvent("page"), p.evaluate(() => ficheSuivi("course-longue"))]);
    await w.waitForLoadState();
    const r = await w.evaluate(() => ({
      pages: document.querySelectorAll("section").length,
      lignes: document.querySelector("section .t").querySelectorAll("tr").length - 1,
      nom: document.querySelector("section .id b").textContent,
      emoji: /\p{Extended_Pictographic}/u.test(document.body.innerText),
    }));
    assert.deepEqual(r, { pages: 2, lignes: 10, nom: "Zakarya", emoji: false });
  });
});

describe("Fiche de suivi : réglages", () => {
  it("choix de la classe et du nombre de séances (mémorisé)", async () => {
    const p = await env.page("baremes.html", { stockage: { ["eleves-" + ANNEE]: { "6e": ["Zakarya"], "4e": ["Mina", "Adel", "Assia"] } } });
    await p.evaluate(() => { setClasse("6e"); showPanel("course-longue"); });
    await p.click("#course-longue-c3-block button:has-text('Fiche de suivi élève')");
    assert.equal(await p.isVisible("#papier-seances"), true);
    await p.selectOption("#papier-classe", "4e");
    await p.fill("#papier-seances", "6");
    const [w] = await Promise.all([p.context().waitForEvent("page"), p.click("#papier-modal button:has-text('Imprimer')")]);
    await w.waitForLoadState();
    const r = await w.evaluate(() => ({
      pages: document.querySelectorAll("section").length,
      lignes: document.querySelector("section .t").querySelectorAll("tr").length - 1,
      colonnesGraph: document.querySelector("section .g tr").querySelectorAll("th").length - 1,
      classe: document.querySelectorAll("section .id b")[1].textContent,
    }));
    assert.deepEqual(r, { pages: 3, lignes: 6, colonnesGraph: 6, classe: "4e" });
    assert.equal(await p.evaluate(() => localStorage.getItem("fiche-suivi-seances")), "6");
  });
  it("le bouton Fiche papier (barème) n'affiche pas le nombre de séances", async () => {
    const p = await env.page("baremes.html");
    await p.evaluate(() => { setClasse("5e"); showPanel("basket"); openFichePapier("basket", "c4"); });
    assert.equal(await p.isVisible("#papier-seances"), false);
  });
});

describe("Relais : disqualification", () => {
  it("régularité = « et respect des règles » avec 0 possible, en 6e et en cycle 4", async () => {
    const p = await env.page("baremes.html");
    const r = await p.evaluate(() => ["c3", "c4"].map((c) => {
      const cr = SPORTS.find((s) => s.id === "relais")[c].criteres;
      const reg = cr.find((x) => x.id === "regul"), t = cr.find((x) => x.id === "temps");
      return [reg.label, reg.max, reg.table[reg.table.length - 1], t.table[t.table.length - 1]];
    }));
    for (const x of r) {
      assert.match(x[0], /respect des règles/);
      assert.equal(x[1], 4);
      assert.deepEqual(x[2], ["3 disqualifications (aucun temps valide)", "0"]);
      assert.deepEqual(x[3], ["Aucun essai valide", "0"]);
    }
  });
  it("les notes déjà saisies sont conservées (même clé 'regul')", async () => {
    const p = await env.page("baremes.html");
    assert.equal(await total(p, "relais", "c3", { temps: 3, passage_p1: 1, passage_p2: 2, passage_p3: 1, engage: 4, regul: 3 }), 14);
    assert.equal(await total(p, "relais", "c3", { temps: 0, passage_p1: 1, passage_p2: 1, passage_p3: 1, engage: 2, regul: 0 }), 5);
  });
});
