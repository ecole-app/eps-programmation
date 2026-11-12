// Barèmes par classe (6e → 3e), combiné 6e, fiches alignées sur les barèmes, observateurs, corrections de champs.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { demarrer, ANNEE } from "./outils.js";

let env, APP;
before(async () => { env = await demarrer(); APP = await env.sauvegardeApp(); });
after(async () => { await env.arreter(); });

describe("Barèmes par classe", () => {
  it("chaque APSA vaut 20 points dans chaque classe, avec les mêmes critères que son cycle", async () => {
    const p = await env.page("baremes.html");
    const faux = await p.evaluate(() => {
      const r = [];
      SPORTS.forEach((s) => ["6e", "5e", "4e", "3e"].forEach((cl) => {
        const b = baremeNiveau(s, cl), base = s[cl === "6e" ? "c3" : "c4"];
        if (maxTotal(b.criteres) !== 20) r.push(s.id + " " + cl + " total");
        if (b.criteres.map((c) => c.id + c.max).join() !== base.criteres.map((c) => c.id + c.max).join()) r.push(s.id + " " + cl + " critères");
      }));
      Object.entries(NIVEAUX).forEach(([sid, lv]) => Object.entries(lv).forEach(([cl, o]) => Object.keys(o.crit || {}).forEach((cid) => {
        const s = SPORTS.find((x) => x.id === sid);
        if (!s || !s[cl === "6e" ? "c3" : "c4"].criteres.some((c) => c.id === cid)) r.push("critère inconnu " + sid + " " + cl + " " + cid);
      })));
      return r;
    });
    assert.deepEqual(faux, []);
  });
  it("relais : les temps sont de plus en plus exigeants de la 6e à la 3e", async () => {
    const p = await env.page("baremes.html");
    const seuils = await p.evaluate(() => ["6e", "5e", "4e", "3e"].map((cl) => parseInt(baremeNiveau(SPORTS.find((s) => s.id === "relais"), cl).criteres[0].table[0][0].replace(/\D/g, ""), 10)));
    assert.deepEqual(seuils, [106, 102, 97, 94]);
  });
  it("changer de classe met à jour le barème affiché, les notes gardent les mêmes clés", async () => {
    const p = await env.page("baremes.html");
    await p.evaluate(() => { setClasse("5e"); showPanel("relais"); });
    const t5 = await p.locator("#relais-c4-criteres").textContent();
    await p.evaluate(() => setClasse("3e"));
    const t3 = await p.locator("#relais-c4-criteres").textContent();
    assert.match(t5, /Barème 5e/); assert.match(t5, /< 102 s/);
    assert.match(t3, /Barème 3e/); assert.match(t3, /< 94 s/);
    assert.deepEqual(p.erreurs, []);
  });
  it("tournoi par terrains : le barème suit le nombre de terrains du jour", async () => {
    const p = await env.page("baremes.html");
    await p.evaluate(() => { setClasse("4e"); showPanel("badminton"); });
    const zone = p.locator('.terrains[data-sid="badminton"][data-cyc="c4"]');
    assert.match(await zone.textContent(), /Terrain 4 \(bas\) : 2/);
    await zone.locator("button").nth(1).click();   // 4 terrains au maximum : le « + » ne fait rien
    assert.doesNotMatch(await zone.textContent(), /Terrain 5/);
    await zone.locator("button").nth(0).click();
    assert.doesNotMatch(await zone.textContent(), /Terrain 4/);
    assert.match(await zone.textContent(), /Terrain 3 \(bas\)/);
  });
  it("combiné athlétique 6e : 5 critères sur 20, le vortex peut être non évalué", async () => {
    const p = await env.page("baremes.html");
    const t = await p.evaluate(() => {
      const c = SPORTS.find((s) => s.id === "combine").c3.criteres;
      return [maxTotal(c), computeTotal(c, { course: 4, saut: 4, lancer: "na", role: 3, fiche: 2 })];
    });
    assert.deepEqual(t, [20, 17.5]);
  });
});

describe("Acrosport : critère Juge", () => {
  it("juge non évalué : ses 2 points passent sur la sécurité, le total reste sur 20", async () => {
    const p = await env.page("baremes.html");
    const r = await p.evaluate(() => ["c3", "c4"].map((c) => {
      const cr = SPORTS.find((s) => s.id === "acrosport")[c].criteres;
      const fait = (juge, secu) => { const o = {}; cr.forEach((x) => { if (x.sous) x.sous.forEach((y) => { o[x.id + "_" + y.id] = y.max; }); else o[x.id] = x.id === "juge" ? juge : x.id === "secu" ? secu(x.max) : x.max; }); return o; };
      return [maxTotal(cr), computeTotal(cr, fait(2, (m) => m)), computeTotal(cr, fait("na", (m) => m)), computeTotal(cr, fait("na", (m) => m / 2))];
    }));
    // sécurité 1,5/3 devient 2,5/5 : 15 + 2,5 = 17,5 dans les deux cycles
    assert.deepEqual(r, [[20, 20, 20, 17.5], [20, 20, 20, 17.5]]);
  });
});

describe("Programmation : corrections de champs", () => {
  it("ancienne sauvegarde corrigée une seule fois (CA5, Renfo, sprint 6e, ballon prisonnier 5e, acrosport 3e)", async () => {
    const vieux = await (async () => {
      const p = await env.page("index.html");
      const v = await p.evaluate((a) => {
        currentYear = a; const pl = plannings[a];
        pl.P5["6e"][1] = { apsa: "Sprint", famille: "ath", semaines: 6, ca: "CA1", note: "", objectif: "" };
        pl.P5["5e"] = [{ apsa: "Ballon prisonnier", famille: "col", semaines: 5, ca: "CA4", note: "", objectif: "" }, { apsa: "Ultimate", famille: "col", semaines: 6, ca: "CA4", note: "", objectif: "" }];
        pl.P5["3e"][1] = { apsa: "Course longue durée", famille: "ath", semaines: 6, ca: "CA5", note: "", objectif: "" }; pl.P2["3e"][0].ca = "CA3"; saveAll();
        return localStorage.getItem("eps-v2");
      }, ANNEE);
      await p.context().close(); return v;
    })();
    const p = await env.page("index.html", { stockage: { "eps-v2": vieux } });
    const r = await p.evaluate((a) => { const pl = plannings[a]; return [pl.P5["6e"][1].apsa, pl.P5["5e"].map((x) => x.apsa + "|" + x.note).join(), pl.P5["3e"][1].ca, pl.P2["3e"][0].ca]; }, ANNEE);
    assert.deepEqual(r, ["Combiné athlétique", "Ultimate|,Ballon prisonnier|Non évalué", "CA3", "CA1"]);
    await p.evaluate((a) => { plannings[a].P5["6e"][1].apsa = "Sprint"; saveAll(); }, ANNEE);
    await p.reload(); await p.waitForTimeout(300);
    assert.equal(await p.evaluate((a) => plannings[a].P5["6e"][1].apsa, ANNEE), "Sprint");
  });
  it("le CA5 n'est plus proposé", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    assert.equal(await p.locator("#addCA option[value=CA5]").count(), 0);
  });
});

describe("Fiches APSA alignées sur les barèmes", () => {
  it("la fiche affiche les attendus officiels, la version 2027 et la progression du barème", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    await p.evaluate(() => openFicheModal("relais"));
    const t = await p.locator("#ficheModalBody").textContent();
    assert.match(t, /Attendus de fin de cycle 4/i);
    assert.match(t, /rentrée 2027/i);
    await p.click(".fp-tab:nth-child(2)");
    assert.match(await p.locator("#fpBox").textContent(), /< 102 s/);
    assert.deepEqual(p.erreurs, []);
  });
});

describe("Observateurs dans les séances", () => {
  it("les séances indiquent le rôle d'observateur et la fiche de séance garde les élèves cochés", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP, ["eleves-" + ANNEE]: { "6e": ["Lina", "Adam"] } } });
    await p.click(".nav-tab[onclick*=\"'seances'\"]");
    assert.match(await p.locator("#seancesContent").textContent(), /Observateurs :/);
    const key = await p.evaluate(() => Object.keys(seanceDataMap).find((k) => seanceDataMap[k].s.obs && seanceDataMap[k].cl === "6e"));
    await p.evaluate((k) => openSeanceFiche(k), key);
    await p.locator("#sfObsBox button").first().click();
    await p.evaluate(() => saveSeanceFiche());
    const obs = await p.evaluate((k) => JSON.parse(localStorage.getItem("fiche-seance-" + k)).obs, key);
    assert.deepEqual(obs, { Lina: 1 });
  });
});

describe("Appréciations : sport tapé dans les mots libres", () => {
  for (const f of ["appreciations.html", "appreciations-ia.html"]) it(f + " : le sport est intégré à la phrase", async () => {
    const p = await env.page(f, { largeur: 390, hauteur: 844, mobile: true });
    await p.evaluate(() => { const b = document.querySelector("#cp-pos .chip, #cp-gen .chip"); if (b) b.click(); });
    const phrase = await p.evaluate(() => { document.getElementById("free").value = "Badminton, ULIS"; return genPhrase(Object.keys(sel).length ? Object.keys(sel) : [], false, "Il", "il", "EPS", 0); });
    assert.match(phrase, /notamment en badminton/);
    assert.match(phrase, /ULIS/);
    assert.ok(!/\(badminton\)/i.test(phrase));
    assert.deepEqual(p.erreurs, []);
  });
});

describe("Documents interactifs", () => {
  it("programmation cliquable, document unique et fiche de suivi course longue", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    await p.click(".nav-tab[onclick*=\"'documents'\"]");
    await p.evaluate(() => docSpecialOuvrir("prog-sports"));
    assert.ok((await p.locator(".ps-sport").count()) > 10);
    await p.evaluate(() => { window.print = () => {}; });
    await p.locator(".ps-sport").nth(0).click();
    await p.locator(".ps-sport").nth(1).click();
    await p.evaluate(() => psBasculer("plan"));
    assert.match(await p.locator("#psPanier").textContent(), /Mon document \(3\)/);
    await p.evaluate(() => progSportsGenerer());
    await p.waitForTimeout(300);
    const txt = await p.locator("#docPrint").textContent();
    assert.match(txt, /Programmation EPS/);
    assert.ok((await p.locator("#docPrint section.bp").count()) == 3);
    assert.match(await p.locator("#docPrintStyle").textContent(), /#docPrint \.bp/);
    await p.evaluate(() => docSpecialOuvrir("renfo-suivi"));
    await p.fill("#rfGroupes", "A, B\nC, D, E");
    await p.evaluate(() => renfoGenerer());
    await p.waitForTimeout(300);
    assert.equal(await p.locator("#docPrint section").count(), 2);
    assert.equal(await p.locator("#docPrint tr").count(), 22);
    await p.evaluate(() => docSpecialOuvrir("suivi-cl"));
    await p.evaluate(() => suiviClGenerer());
    await p.waitForTimeout(300);
    assert.match(await p.locator("#docPrint").textContent(), /Fiche de suivi/);
    assert.deepEqual(p.erreurs, []);
  });
});

describe("Documents préparés", () => {
  it("la séance de tests 6e, les attendus 2027 et le mémo VMA s'ouvrent depuis Documents", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    await p.click(".nav-tab[onclick*=\"'documents'\"]");
    assert.equal(await p.locator("button.da-card").count(), 6);
    assert.equal(await p.locator("a.da-card").count(), 3);
    await p.evaluate(() => docAppOuvrir("tests-6e"));
    assert.match(await p.locator("#docAppBody").textContent(), /navette Luc-Léger/);
    await p.evaluate(() => { docAppFermer(); docAppOuvrir("afc-2027"); });
    assert.equal(await p.locator("#docAppBody ol li").count(), 12);
    await p.evaluate(() => { docAppFermer(); docAppOuvrir("memo-vma"); });
    assert.match(await p.locator("#docAppBody").textContent(), /550 m/);
    assert.deepEqual(p.erreurs, []);
  });
});

describe("Situations pratiques dans le déroulé", () => {
  it("chaque séance propose 1 ou 2 situations datées, l'évaluation propose l'épreuve", async () => {
    const p = await env.page("index.html", { stockage: { "eps-v2": APP } });
    await p.click(".nav-tab[onclick*=\"'seances'\"]");
    const r = await p.evaluate(() => {
      const ks = Object.keys(seanceDataMap);
      const app = ks.find((k) => seanceDataMap[k].s.type === "appr" && seanceDataMap[k].sd && SITUATIONS[seanceDataMap[k].sd.id]);
      const ev = ks.find((k) => seanceDataMap[k].s.type === "eval" && seanceDataMap[k].sd && SITUATIONS[seanceDataMap[k].sd.id]);
      const t = (k) => { const d = seanceDataMap[k]; return buildDerouleText(d.cl, d.s, d.sd); };
      return [t(app), t(ev), Object.keys(SITUATIONS).length];
    });
    assert.match(r[0], /Situation 1 : .*\(\d+ min\)/);
    assert.match(r[0], /Situation 2 : /);
    assert.match(r[0], /Organisation : .*\n.*Consigne : .*\n.*Réussite : /);
    assert.match(r[1], /Épreuve : /);
    assert.equal(r[2], 16);
    assert.deepEqual(p.erreurs, []);
  });
});

describe("Choix de novembre : CO 6e, acrosport 5e, combiné 4e", () => {
  it("ancienne sauvegarde corrigée une seule fois, dates et cycles inchangés", async () => {
    const vieux = await (async () => {
      const p = await env.page("index.html");
      const v = await p.evaluate((a) => {
        const pl = plannings[a];
        pl.P5["6e"][0] = { apsa: "Badminton", famille: "raq", semaines: 5, ca: "CA4", note: "", objectif: "" };
        pl.P4["5e"][0] = { apsa: "Relais", famille: "ath", semaines: 5, ca: "CA1", note: "", objectif: "" };
        pl.P4["4e"][0] = { apsa: "Relais", famille: "ath", semaines: 5, ca: "CA1", note: "", objectif: "" };
        saveAll(); return localStorage.getItem("eps-v2");
      }, ANNEE);
      await p.context().close(); return v;
    })();
    const p = await env.page("index.html", { stockage: { "eps-v2": vieux } });
    const r = await p.evaluate((a) => { const pl = plannings[a]; return [pl.P5["6e"][0].apsa + pl.P5["6e"][0].ca, pl.P4["5e"][0].apsa + pl.P4["5e"][0].ca, pl.P4["4e"][0].apsa + pl.P4["4e"][0].ca, pl.P5["6e"][0].semaines, periodesData[a].map((x) => x.dates).join()]; }, ANNEE);
    assert.deepEqual(r.slice(0, 4), ["Course d'orientationCA2", "AcrosportCA3", "Combiné athlétiqueCA1", 5]);
    assert.equal(r[4], "1/09 – 9/10,12/10 – 27/11,1/12 – 22/01,25/01 – 12/03,15/03 – 11/06");
    await p.evaluate((a) => { plannings[a].P4["5e"][0].apsa = "Relais"; saveAll(); }, ANNEE);
    await p.reload(); await p.waitForTimeout(300);
    assert.equal(await p.evaluate((a) => plannings[a].P4["5e"][0].apsa, ANNEE), "Relais");
    assert.deepEqual(p.erreurs, []);
  });
});

