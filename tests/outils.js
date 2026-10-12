// Outils communs : petit serveur local pour les pages du site + navigateur sans écran.
// Tout ce qui sort du site (Firebase, Google Fonts, OpenRouter…) est bloqué :
// les tests ne touchent JAMAIS ta vraie base de données ni ta clé d'IA.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const RACINE = fileURLToPath(new URL("../", import.meta.url));
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };
export const ANNEE = "2026-27";

export async function demarrer() {
  const serveur = http.createServer(async (req, res) => {
    const chemin = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    if (chemin.startsWith("..")) { res.writeHead(403); return res.end(); }
    try {
      const data = await readFile(join(RACINE, chemin || "index.html"));
      res.writeHead(200, { "Content-Type": TYPES[extname(chemin)] || "application/octet-stream" });
      res.end(data);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((ok) => serveur.listen(0, "127.0.0.1", ok));
  const base = "http://127.0.0.1:" + serveur.address().port + "/";
  const navigateur = await chromium.launch();

  // Ouvre une page « propre » (stockage vide sauf l'année en cours) et relève les erreurs JS.
  async function page(chemin, { largeur = 1300, stockage = {}, routes = {} } = {}) {
    const contexte = await navigateur.newContext({ viewport: { width: largeur, height: 900 } });
    await contexte.addInitScript(([annee, sto]) => {
      if (sessionStorage.getItem("__init")) return;
      sessionStorage.setItem("__init", "1");
      if (!("eps-v2" in sto)) localStorage.setItem("eps-v2", JSON.stringify({ currentYear: annee }));
      for (const [k, v] of Object.entries(sto)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
    }, [ANNEE, stockage]);
    await contexte.route("**/*", (route) => {
      const url = route.request().url();
      for (const [motif, reponse] of Object.entries(routes)) if (url.includes(motif)) return reponse(route);
      return url.startsWith(base) ? route.continue() : route.abort();
    });
    const p = await contexte.newPage();
    p.erreurs = [];
    p.on("pageerror", (e) => p.erreurs.push(e.message));
    await p.goto(base + chemin);
    await p.waitForTimeout(300);
    return p;
  }

  // Sauvegarde complète de l'app avec l'année en cours = ANNEE (l'app ignore une sauvegarde sans programmation).
  async function sauvegardeApp() {
    const p = await page("index.html");
    const v = await p.evaluate((a) => { currentYear = a; saveAll(); return localStorage.getItem("eps-v2"); }, ANNEE);
    await p.context().close();
    return v;
  }

  async function arreter() { await navigateur.close(); serveur.close(); }
  return { base, page, sauvegardeApp, arreter };
}
