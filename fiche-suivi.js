// Fiche de suivi élève (course longue) : HTML complet, une page A4 par élève. Partagé par l'onglet Barèmes et Documents.
function ficheSuiviHtml(sid, cl, nb, noms){
  nb=nb||10;
  const sport=SPORTS.find(s=>s.id===sid);
  noms=noms||[];
  const compact=nb>10;
  const hLigne=compact?Math.max(26,Math.floor(560/nb)):46;
  const ressenti=compact?'Facile – Ça va<br>Dur – Très dur':'Facile<br>Ça va<br>Dur<br>Très dur';
  const essouf=compact?'Je parle – Avec difficulté<br>Je ne peux pas parler':'Je parle<br>Avec difficulté<br>Je ne peux pas parler';
  const hGraph=compact?11:15;
  const liste=noms.length?noms:[''];
  const lignes=n=>{let h='';for(let i=1;i<=n;i++)h+=`<tr style="height:${hLigne}px"><td class="c">${i}</td><td></td><td></td><td></td><td></td>
    <td class="choix">${ressenti}</td><td class="choix">${essouf}</td><td></td></tr>`;return h;};
  let graph='<table class="g"><tr><th></th>';
  for(let i=1;i<=nb;i++) graph+='<th>S'+i+'</th>';
  graph+='</tr>';
  for(let m=15;m>=1;m--){ graph+='<tr><th>'+m+' min</th>'; for(let i=1;i<=nb;i++) graph+='<td></td>'; graph+='</tr>'; }
  graph+='</table>';
  const page=nom=>`<section>
    <h1>${sport.nom} — Fiche de suivi</h1>
    <div class="id"><span>Nom Prénom : <b>${nom||''}</b>${nom?'':'<i class="ligne"></i>'}</span><span>Classe : <b>${cl}</b></span><span>Mon objectif de durée au départ : <i class="ligne court"></i> min</span></div>
    <table class="t"><colgroup><col style="width:38px"><col style="width:62px"><col style="width:62px"><col style="width:62px"><col style="width:58px"><col style="width:${compact?84:72}px"><col style="width:${compact?120:100}px"><col></colgroup><tr><th>Séance</th><th>Date</th><th>Durée annoncée</th><th>Durée courue</th><th>Pouls après<br><small>(15 s × 4)</small></th><th>Ressenti<br><small>(entourer)</small></th><th>Essoufflement<br><small>(entourer)</small></th><th>Ce que je change la prochaine fois</th></tr>${lignes(nb)}</table>
    <h2>Ma progression : je colorie la durée courue à chaque séance</h2>${graph}
    <p class="pied">Le binôme remplit la fiche de celui qui court. À rendre à la fin du cycle.</p>
  </section>`;
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>Fiche de suivi — ${sport.nom} ${cl}</title><style>
    @page{size:A4 portrait;margin:10mm}
    body{font-family:Arial,sans-serif;color:#111;margin:0}
    section{page-break-after:always}
    section:last-child{page-break-after:auto}
    h1{font-size:17px;margin:0 0 6px}
    h2{font-size:12px;margin:10px 0 4px}
    .id{display:flex;flex-wrap:wrap;gap:6px 22px;font-size:12px;margin-bottom:8px}
    .ligne{display:inline-block;border-bottom:1px solid #333;width:150px;height:12px}
    .ligne.court{width:40px}
    table{border-collapse:collapse;width:100%}
    .t th,.t td{border:1px solid #333;font-size:10px;padding:2px 3px;vertical-align:middle}
    .t th{background:#eee}
    .t td{height:auto}
    .t td.c{text-align:center;font-weight:bold;width:34px}
    .t td.choix{font-size:8.5px;line-height:1.35}
    .g th,.g td{border:1px solid #888;font-size:8px;height:${hGraph}px;padding:0 2px}
    .g th{background:#f4f4f4;width:34px}
    .pied{font-size:9px;color:#555;margin-top:6px}
  </style></head><body>${liste.map(page).join('')}</body></html>`;
  return html;
}
