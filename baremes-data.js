// Barèmes EPS — source unique, lue par l'onglet Barèmes ET par les fiches APSA de l'app.
// Si une fiche et un barème ne disent pas la même chose, c'est le barème qui fait foi.
const SPORTS = [

  // ── RELAIS ──────────────────────────────────────────
  { id:'relais', nom:'Relais', emoji:'🏃', ca:'CA1', famille:'Athlétisme',
    c3:{
      seances:'10–12',
      ca_texte:'Courir vite sur sa fraction de course, réussir le passage de témoin. Tenir le rôle de chronométreur de son équipe.',
      criteres:[
        { id:'temps', label:'⏱ Temps collectif', max:6, hint:'Course 4×120m (1 tour de piste 40×20 m chacun) — 3 tentatives, meilleur temps parmi les essais valides (essai disqualifié = non compté ; aucun essai valide = 0)',
          sous:null,
          table:[['< 106s','6'],['106–114s','5'],['114–122s','4'],['122–131s','3'],['131–140s','2'],['> 140s','1'],['Aucun essai valide','0']] },
        { id:'passage', label:'🤝 Passages de témoin', max:6, hint:'3 passages notés 0–2 : zone respectée, continuité de course',
          sous:[{id:'p1',label:'Passage 1',max:2},{id:'p2',label:'Passage 2',max:2},{id:'p3',label:'Passage 3',max:2}],
          table:[['Passage sans ralentissement, zone OK','2'],['Léger ralentissement ou zone limite','1'],['Arrêt ou hors-zone','0']] },
        { id:'engage', label:'🔥 Engagement et effort', max:4, hint:'Court à fond sur sa fraction, sans ralentir ni se désintéresser, encourage son équipe',
          sous:null,
          table:[['Engagement maximal sur toute sa fraction, encourage','4'],['Bon engagement, léger relâchement','3'],['Engagement inégal, ralentit avant la fin','2'],['Peu engagé ou se désintéresse','1']] },
        { id:'regul', label:'📊 Régularité et respect des règles', max:4, hint:'Écart entre meilleur et moins bon essai valide. Une disqualification (zone ratée, témoin tombé, hors couloir…) compte comme un essai raté, pour toute l\'équipe',
          sous:null,
          table:[['3 essais valides, écart < 6s','4'],['3 essais valides, écart 6–9s','3'],['3 essais valides, écart > 9s, ou 1 disqualification','2'],['2 disqualifications','1'],['3 disqualifications (aucun temps valide)','0']] }
      ]
    },
    c4:{
      seances:'10–12',
      ca_texte:'Optimiser le passage de témoin en aveugle. Comprendre que la performance collective dépasse la somme des performances individuelles. Analyser et proposer des ajustements.',
      criteres:[
        { id:'temps', label:'⏱ Temps collectif', max:6, hint:'Course 4×120m (1 tour de piste 40×20 m chacun) — 3 tentatives, meilleur temps parmi les essais valides (essai disqualifié = non compté ; aucun essai valide = 0)',
          sous:null,
          table:[['< 72s','6'],['72–77s','5'],['77–82s','4'],['82–86s','3'],['86–94s','2'],['> 94s','1'],['Aucun essai valide','0']] },
        { id:'passage', label:'🤝 Passages de témoin', max:6, hint:'Passage en aveugle, zone réglementaire, vitesse maintenue',
          sous:[{id:'p1',label:'Passage 1',max:2},{id:'p2',label:'Passage 2',max:2},{id:'p3',label:'Passage 3',max:2}],
          table:[['Aveugle, zone OK, vitesse maintenue','2'],['Aveugle tenté mais ralentissement','1'],['Avec regard ou hors-zone','0']] },
        { id:'engage', label:'🔥 Engagement et effort', max:4, hint:'Court à fond sur sa fraction, sans ralentir ni se désintéresser, encourage son équipe',
          sous:null,
          table:[['Engagement maximal sur toute sa fraction, encourage','4'],['Bon engagement, léger relâchement','3'],['Engagement inégal, ralentit avant la fin','2'],['Peu engagé ou se désintéresse','1']] },
        { id:'regul', label:'📊 Régularité et respect des règles', max:4, hint:'Constance sur les 3 essais valides. Une disqualification (zone ratée, témoin tombé, hors couloir…) compte comme un essai raté, pour toute l\'équipe',
          sous:null,
          table:[['3 essais valides, écart < 2,5s','4'],['3 essais valides, écart 2,5–5s','3'],['3 essais valides, écart > 5s, ou 1 disqualification','2'],['2 disqualifications','1'],['3 disqualifications (aucun temps valide)','0']] }
      ]
    }
  },

  // ── COURSE LONGUE ───────────────────────────────────
  { id:'course-longue', nom:'Course longue', emoji:'🏃', ca:'CA1', famille:'Athlétisme',
    c3:{
      seances:'10–12',
      ca_texte:"Courir à allure régulière sans s'arrêter. Connaître sa fréquence cardiaque et ses sensations. Commencer à se fixer un objectif de durée.",
      criteres:[
        { id:'duree', label:'⏱ Durée de course', max:6, hint:'Courir sans interruption — durée atteinte en minutes entières (14 min 40 = 14 min), 15 min maximum',
          sous:null,
          table:[['15 min','6'],['12 à 14 min','5'],['9 à 11 min','4'],['6 à 8 min','3'],['4 à 5 min','2'],['0 à 3 min','1']] },
        { id:'allure', label:'📊 Gestion de l\'allure', max:6, hint:'Observée pendant la course : régularité du début à la fin',
          sous:null,
          table:[['Allure régulière du début à la fin','5–6'],['Quelques ralentissements, repart','3–4'],['Part trop vite puis ralentit fortement ou s\'arrête','1–2']] },
        { id:'projet', label:'🎯 Projet tenu', max:5, hint:'L\'élève annonce une durée cible — écart réel/prévu',
          sous:null,
          table:[['Écart ≤ 1 min','5'],['Écart 1–2 min','4'],['Écart 2–3 min','3'],['Écart 3–4 min','2'],['Écart > 4 min','1']] },
        { id:'fiche', label:'📋 Fiche de suivi', max:3, hint:'Ressenti, FC, durée relevés à chaque séance',
          sous:null,
          table:[['Fiche complète (toutes les séances)','3'],['Fiche incomplète','2'],['Quelques notes','1'],['Absente','0']] }
      ]
    },
    c4:{
      seances:'10–12',
      ca_texte:"Établir et tenir un projet de course basé sur sa VMA. Gérer son effort sur 12 minutes. Observer un camarade et proposer un retour constructif.",
      criteres:[
        { id:'vma', label:'📐 VMA', max:4, hint:'Test Vameval ou Léger-Boucher en début de cycle',
          sous:null,
          table:[['Palier ≥ 10','4'],['Palier 8–9','3'],['Palier 6–7','2'],['Palier 4–5','1'],['Palier < 4','0']] },
        { id:'projet', label:'🎯 Tenue du projet', max:8, hint:'Écart distance prévue / réalisée sur 12 min',
          sous:null,
          table:[['Écart ≤ 50m','8'],['Écart 50–100m','6'],['Écart 100–200m','4'],['Écart 200–300m','2'],['Écart > 300m','0']] },
        { id:'regul', label:'📊 Régularité d\'allure', max:5, hint:'Constance des passages par segment',
          sous:null,
          table:[['Variation < 5%','5'],['Variation 5–10%','4'],['Variation 10–15%','3'],['Variation 15–20%','2'],['> 20%','1']] },
        { id:'obs', label:'📋 Observateur', max:3, hint:'Retour écrit ou oral sur la course d\'un camarade',
          sous:null,
          table:[['Retour précis avec données chiffrées','3'],['Retour général correct','2'],['Retour vague','1'],['Absent','0']] }
      ]
    }
  },

  // ── DEMI-FOND ───────────────────────────────────────
  { id:'demi-fond', nom:'Demi-fond', emoji:'🏃', ca:'CA1', famille:'Athlétisme',
    c3:{
      seances:'10',
      ca_texte:"Courir à allure soutenue sur 6–8 minutes. Connaître ses sensations d'effort et s'y référer pour gérer sa course.",
      criteres:[
        { id:'duree', label:'⏱ Durée soutenue', max:5, hint:'Course à allure rapide mais tenue sans interruption',
          sous:null,
          table:[['≥ 8 min','5'],['7–8 min','4'],['6–7 min','3'],['5–6 min','2'],['< 5 min','1']] },
        { id:'regul', label:'📊 Régularité', max:6, hint:'Constance de l\'allure — tours chronométrés',
          sous:null,
          table:[['Variation < 8%','6'],['Variation 8–14%','4'],['Variation 14–20%','2'],['> 20%','1']] },
        { id:'projet', label:'🎯 Projet tenu', max:6, hint:'Annonce une allure cible — écart avec réalisé',
          sous:null,
          table:[['Écart ≤ 5%','6'],['Écart 5–10%','4'],['Écart 10–15%','2'],['> 15%','1']] },
        { id:'fiche', label:'📋 Fiche sensations', max:3, hint:'Ressenti par allure (facile/moyen/difficile) noté',
          sous:null,
          table:[['Fiche complète','3'],['Fiche partielle','2'],['Quelques notes','1'],['Absente','0']] }
      ]
    },
    c4:{
      seances:'11',
      ca_texte:"Gérer son effort entre 3 et 9 minutes. Planifier et réaliser un projet de course basé sur %VMA. Analyser sa propre performance.",
      criteres:[
        { id:'vma', label:'📐 VMA', max:4, hint:'Palier au test initial',
          sous:null,
          table:[['Palier ≥ 11','4'],['Palier 9–10','3'],['Palier 7–8','2'],['Palier 5–6','1'],['< 5','0']] },
        { id:'projet', label:'🎯 Écart projet/réalisé', max:9, hint:'3 allures progressives sur 15 min — écart global prévu/réalisé',
          sous:null,
          table:[['Écart ≤ 5%','9'],['Écart 5–10%','7'],['Écart 10–15%','5'],['Écart 15–20%','3'],['> 20%','1']] },
        { id:'perf', label:'⚡ Performance absolue', max:5, hint:'Distance parcourue sur les 3 allures',
          sous:null,
          table:[['≥ 3000m','5'],['2600–3000m','4'],['2200–2600m','3'],['1800–2200m','2'],['< 1800m','1']] },
        { id:'fiche', label:'📋 Fiche individuelle', max:2, hint:'VMA, projet, résultat, analyse',
          sous:null,
          table:[['Fiche complète et analysée','2'],['Fiche présente, incomplète','1'],['Absente','0']] }
      ]
    }
  },

  // ── SPRINT ─────────────────────────────────────────
  { id:'sprint', nom:'Sprint', emoji:'⚡', ca:'CA1', famille:'Athlétisme',
    c3:{
      seances:'10',
      ca_texte:"Courir le plus vite possible sur 30–40m. Réagir au signal. Chronométrer ses camarades.",
      criteres:[
        { id:'perf', label:'⚡ Meilleur temps (40m)', max:8, hint:'3 passages — meilleur temps retenu',
          sous:null,
          table:[['< 6s','8'],['6–6,5s','7'],['6,5–7s','6'],['7–7,5s','5'],['7,5–8s','4'],['8–9s','3'],['9–10s','2'],['> 10s','1']] },
        { id:'depart', label:'🎯 Réactivité au départ', max:5, hint:'Observation sur 2 passages — posture + réaction',
          sous:null,
          table:[['Réaction < 0,5s, bonne inclinaison','5'],['Réaction correcte, légère hésitation','3–4'],['Départ lent ou posture haute','1–2']] },
        { id:'regul', label:'📊 Régularité', max:4, hint:'Écart entre meilleur et moins bon des 3 passages',
          sous:null,
          table:[['Écart < 0,4s','4'],['Écart 0,4–0,7s','3'],['Écart 0,7–1s','2'],['> 1s','1']] },
        { id:'chrono', label:'📋 Chronométreur', max:3, hint:'Temps des camarades relevés correctement',
          sous:null,
          table:[['Temps corrects + restitution orale','3'],['Temps corrects','2'],['Temps partiels','1'],['Absent','0']] }
      ]
    },
    c4:{
      seances:'10',
      ca_texte:"Produire un effort maximal sur 50m. Maîtriser la technique de départ et d'accélération. Chronométrer avec précision et analyser.",
      criteres:[
        { id:'perf', label:'⚡ Meilleur temps (50m)', max:8, hint:'3 passages — meilleur temps retenu',
          sous:null,
          table:[['< 7s','8'],['7–7,5s','7'],['7,5–8s','6'],['8–8,5s','5'],['8,5–9s','4'],['9–10s','3'],['10–11s','2'],['> 11s','1']] },
        { id:'tech', label:'🎯 Technique', max:5, hint:'Départ, montée en vitesse, coordination',
          sous:[{id:'dep',label:'Départ explosif + inclinaison',max:2},{id:'mont',label:'Montée en fréquence',max:2},{id:'coord',label:'Coordination bras/jambes',max:1}],
          table:[['Départ explosif, corps incliné','2/2'],['Montée progressive à fréquence élevée','2/2'],['Balancé symétrique','1/1']] },
        { id:'regul', label:'📊 Régularité', max:4, hint:'Écart entre meilleur et moins bon passage',
          sous:null,
          table:[['Écart < 0,3s','4'],['Écart 0,3–0,6s','3'],['Écart 0,6–1s','2'],['> 1s','1']] },
        { id:'chrono', label:'📋 Chronométreur', max:3, hint:'Temps + analyse (vitesse de pointe, phase de décélération)',
          sous:null,
          table:[['Temps corrects + analyse','3'],['Temps corrects','2'],['Temps partiels','1'],['Absent','0']] }
      ]
    }
  },

  // ── BASKET ─────────────────────────────────────────
  { id:'basket', nom:'Basket-ball', emoji:'🏀', ca:'CA4', famille:'Sports collectifs',
    c3:{
      seances:'10–12',
      ca_texte:"S'organiser à 3 ou 4 pour progresser vers la cible et tirer. Respecter les règles élémentaires. Tenir le rôle d'arbitre.",
      criteres:[
        { id:'perf', label:'⚡ Performance', max:4, hint:'Matchs 3v3 — paniers marqués par l\'élève',
          sous:null,
          table:[['≥ 5 paniers','4'],['3–4 paniers','3'],['1–2 paniers','2'],['0 panier','1']] },
        { id:'jeu', label:'🤝 Jeu collectif', max:8, hint:'3 critères observés sur 2 matchs',
          sous:[{id:'pass',label:'Passes utiles (sans dribble inutile)',max:3},{id:'dem',label:'Démarquage avant et après passe',max:3},{id:'cible',label:'Orientation vers le panier',max:2}],
          table:[['Passe directe sans dribble systématique','3/3'],['Se démarque en espace libre','3/3'],['Regarde vers le panier dès réception','2/2']] },
        { id:'regles', label:'📖 Respect des règles', max:4, hint:'Marcher, sortie, contacts — infractions comptées',
          sous:null,
          table:[['0–1 infraction','4'],['2 infractions','3'],['3 infractions','2'],['4+ infractions','1']] },
        { id:'arb', label:'⚖️ Arbitrage', max:4, hint:'Arbitre un match en entier',
          sous:null,
          table:[['Score annoncé + fautes signalées','4'],['Score correct, fautes partielles','3'],['Quelques oublis','2'],['Arbitrage absent','1']] }
      ]
    },
    c4:{
      seances:'10–12',
      ca_texte:"S'organiser collectivement pour créer des déséquilibres et marquer. Défendre collectivement. Assumer les rôles joueur, arbitre, observateur.",
      criteres:[
        { id:'perf', label:'⚡ Performance', max:5, hint:'Tournoi 4v4 — 3 matchs de 6 min',
          sous:null,
          table:[['3 victoires','5'],['2 victoires','4'],['1 victoire + 1 nul','3'],['1 victoire','2'],['0 victoire','1']] },
        { id:'jeu', label:'🤝 Jeu collectif', max:8, hint:'Démarquage, passes, espaces — 2 matchs observés',
          sous:[{id:'dem',label:'Démarquage actif',max:3},{id:'pass',label:'Passes utiles et précises',max:3},{id:'esp',label:'Utilisation des espaces',max:2}],
          table:[['Se démarque avant et après chaque passe','3/3'],['Passe sans dribble inutile','3/3'],['Joue en largeur et en profondeur','2/2']] },
        { id:'arb', label:'⚖️ Arbitrage', max:4, hint:'Match entier : annonce, règles, litiges',
          sous:null,
          table:[['Score + marcher + contacts + litiges','4'],['Score + marcher + contacts','3'],['Score seulement','2'],['Arbitrage absent','1']] },
        { id:'def', label:'🛡️ Défense collective', max:3, hint:'2 matchs observés — défense sur le porteur, replacement, aide aux partenaires',
          sous:null,
          table:[['Défend dès la perte de balle, gêne le porteur, aide ses partenaires','3'],['Défend sur son joueur, replacement correct','2'],['Défend de façon intermittente','1'],['Ne défend pas','0']] }
      ]
    }
  },

  // ── FOOTBALL ───────────────────────────────────────
  { id:'football', nom:'Football', emoji:'⚽', ca:'CA4', famille:'Sports collectifs',
    c3:{
      seances:'10–12',
      ca_texte:"Conduire, passer et tirer en situation de jeu simple. Respecter les règles élémentaires. Jouer en équipe.",
      criteres:[
        { id:'perf', label:'⚡ Performance', max:4, hint:'Matchs 4v4 — buts marqués par l\'élève',
          sous:null,
          table:[['≥ 4 buts','4'],['2–3 buts','3'],['1 but','2'],['0 but participatif','1']] },
        { id:'jeu', label:'🤝 Jeu collectif', max:8, hint:'Passes, soutien, utilisation de l\'espace',
          sous:[{id:'pass',label:'Passes réussies vers un partenaire libre',max:3},{id:'sout',label:'Soutien du porteur',max:3},{id:'esp',label:'Utilisation de l\'espace',max:2}],
          table:[['Passe précise vers partenaire libre','3/3'],['Toujours à portée du porteur','3/3'],['Se déplace pour créer espace','2/2']] },
        { id:'regles', label:'📖 Respect des règles', max:4, hint:'Mains, hors-jeu simplifié, remises en jeu',
          sous:null,
          table:[['0–1 infraction','4'],['2 infractions','3'],['3 infractions','2'],['4+ infractions','1']] },
        { id:'arb', label:'⚖️ Arbitrage', max:4, hint:'Match entier — fautes, sorties, corners',
          sous:null,
          table:[['Mains + sorties + corners corrects','4'],['Mains + sorties','3'],['Sorties seulement','2'],['Refus','1']] }
      ]
    },
    c4:{
      seances:'10–12',
      ca_texte:"Comprendre et utiliser l'espace de jeu pour créer des occasions de but. Rôles arbitre et observateur tenus avec rigueur.",
      criteres:[
        { id:'perf', label:'⚡ Performance', max:5, hint:'Tournoi 5v5 — 3 matchs de 7 min',
          sous:null,
          table:[['3 victoires','5'],['2 victoires','4'],['1 victoire + 1 nul','3'],['1 victoire','2'],['0 victoire','1']] },
        { id:'jeu', label:'🤝 Jeu collectif', max:8, hint:'Espaces, passes, soutien — 2 matchs',
          sous:[{id:'pass',label:'Passes courtes précises',max:3},{id:'esp',label:'Utilisation des espaces libres',max:3},{id:'sout',label:'Soutien du porteur',max:2}],
          table:[['Passe sans pression, balle tendue','3/3'],['Se déplace vers espace libre','3/3'],['Toujours en soutien proche','2/2']] },
        { id:'arb', label:'⚖️ Arbitrage', max:4, hint:'Mains, sorties, hors-jeu, corners',
          sous:null,
          table:[['Fautes + remises en jeu correctes','4'],['Fautes principales correctes','3'],['Partiel','2'],['Refus','1']] },
        { id:'obs', label:'📋 Grille observateur', max:3, hint:'Grille actions offensives sur un match',
          sous:null,
          table:[['Grille complète + analyse','3'],['Grille complète','2'],['Grille partielle','1'],['Absent','0']] }
      ]
    }
  },

  // ── ULTIMATE ───────────────────────────────────────
  { id:'ultimate', nom:'Ultimate', emoji:'🥏', ca:'CA4', famille:'Sports collectifs',
    c3:{
      seances:'10',
      ca_texte:"Lancer et réceptionner le disque avec précision. Progresser vers la zone d'en-but sans courir avec le disque. Respecter les règles de base.",
      criteres:[
        { id:'technique', label:'🎯 Technique disque', max:6, hint:'Lancers et réceptions évalués en situation',
          sous:[{id:'lancer',label:'Précision des lancers',max:3},{id:'recept',label:'Réceptions sécurisées',max:3}],
          table:[['Lancer plat et précis sur 10m','3/3'],['Réception deux mains, contrôle','3/3']] },
        { id:'perf', label:'⚡ Performance', max:5, hint:'Points marqués dans le tournoi 4v4',
          sous:null,
          table:[['Équipe gagnante','5'],['Équipe intermédiaire','3'],['Équipe en difficulté','1']] },
        { id:'spirit', label:'🌟 Spirit', max:5, hint:'Respect des règles de base et auto-arbitrage initié',
          sous:null,
          table:[['Respecte règles + annonce fautes soi-même','5'],['Respecte les règles','3'],['Quelques infractions','1']] },
        { id:'regles', label:'📖 Connaît les règles', max:4, hint:'Pivot, stall count, zone d\'en-but',
          sous:null,
          table:[['3 règles maîtrisées','4'],['2 règles','3'],['1 règle','2'],['Aucune','1']] }
      ]
    },
    c4:{
      seances:'10',
      ca_texte:"Construire une attaque collective sans courir avec le disque. Appliquer l'auto-arbitrage et le spirit of the game avec exigence.",
      criteres:[
        { id:'perf', label:'⚡ Performance', max:5, hint:'Points marqués en tournoi 5v5 — 3 matchs',
          sous:null,
          table:[['Meilleure équipe','5'],['Équipe intermédiaire','3'],['Équipe en difficulté','1']] },
        { id:'jeu', label:'🤝 Jeu collectif', max:7, hint:'Passes, démarquage, progression zone par zone',
          sous:[{id:'lanc',label:'Précision des lancers (3 types)',max:3},{id:'dem',label:'Démarquage et pivots',max:2},{id:'prog',label:'Progression vers la zone',max:2}],
          table:[['Forehand/backhand/hammer maîtrisés','3/3'],['Se démarque, pivote avant de lancer','2/2'],['Progresse zone par zone','2/2']] },
        { id:'spirit', label:'🌟 Spirit of the game', max:5, hint:'Auto-arbitrage intégral + fair-play',
          sous:null,
          table:[['Auto-arbitre + aide adversaire','5'],['Auto-arbitre correctement','4'],['Quelques oublis','3'],['Litiges fréquents','2'],['Refus','0']] },
        { id:'obs', label:'📋 Grille spirit score', max:3, hint:'Évalue l\'esprit de jeu de l\'équipe adverse',
          sous:null,
          table:[['Grille complète + analyse','3'],['Grille complète','2'],['Grille partielle','1']] }
      ]
    }
  },

  // ── BALLON PRISONNIER ──────────────────────────────
  { id:'ballon-prisonnier', nom:'Ballon prisonnier', emoji:'🎯', ca:'CA4', famille:'Sports collectifs',
    c3:{
      seances:'8–10',
      ca_texte:"Lancer avec précision pour éliminer. Esquiver les lancers adverses. Coopérer pour libérer les prisonniers.",
      criteres:[
        { id:'perf', label:'⚡ Performance', max:5, hint:'Victoires en tournoi + nombre d\'éliminations',
          sous:null,
          table:[['3 victoires','5'],['2 victoires','4'],['1 victoire','3'],['0 victoire participatif','2'],['Peu impliqué','1']] },
        { id:'tech', label:'🎯 Technique', max:6, hint:'Qualité des lancers et des esquives',
          sous:[{id:'lancer',label:'Lancer précis et fort',max:3},{id:'esquive',label:'Esquive réactive',max:3}],
          table:[['Lancer dirigé, touche l\'adversaire','3/3'],['Esquive en pas chassés, anticipe','3/3']] },
        { id:'coop', label:'🤝 Coopération', max:5, hint:'Communication, libération des prisonniers, organisation',
          sous:null,
          table:[['Libère prisonniers + communique + s\'organise','5'],['Libère + communique','3'],['Joue seul','1']] },
        { id:'regles', label:'📖 Règles', max:4, hint:'Sorties, relancés, réceptions — infractions comptées',
          sous:null,
          table:[['0–1 infraction','4'],['2 infractions','3'],['3 infractions','2'],['4+ infractions','1']] }
      ]
    },
    c4:{
      seances:'8–10',
      ca_texte:"Éliminer les adversaires tout en évitant d'être touché. Construire une stratégie collective d'attaque et de défense. Arbitrer.",
      criteres:[
        { id:'perf', label:'⚡ Performance', max:5, hint:'Résultats des 3 manches de 5 min',
          sous:null,
          table:[['3 victoires','5'],['2 victoires','4'],['1 victoire','3'],['0 victoire participatif','2'],['Peu impliqué','1']] },
        { id:'strat', label:'🧠 Stratégie collective', max:7, hint:'Distribution des rôles, libération, coordination',
          sous:[{id:'roles',label:'Distribution des rôles',max:3},{id:'lib',label:'Libération des prisonniers',max:2},{id:'coord',label:'Coordination attaque/défense',max:2}],
          table:[['Rôles définis et respectés','3/3'],['Libère efficacement','2/2'],['Alterne attaque/défense','2/2']] },
        { id:'tech', label:'🎯 Technique', max:4, hint:'Lancers et esquives observés',
          sous:null,
          table:[['Lancer précis + esquive réactive','4'],['Lancer correct, esquive passive','3'],['Lancer fort imprécis','2'],['Aléatoire','1']] },
        { id:'arb', label:'⚖️ Arbitrage', max:4, hint:'Arbitre une manche entière',
          sous:null,
          table:[['Arbitre + observe, grille complète','4'],['Arbitre correctement','2'],['Refuse','0']] }
      ]
    }
  },

  // ── RUGBY ──────────────────────────────────────────
  { id:'rugby', nom:'Rugby à 7', emoji:'🏉', ca:'CA4', famille:'Sports collectifs',
    c3:{
      seances:'10',
      ca_texte:"Avancer en passant en arrière. Soutenir le porteur. Respecter les règles du toucher-plaquage.",
      criteres:[
        { id:'perf', label:'⚡ Essais', max:5, hint:'Essais marqués en tournoi toucher-plaquage',
          sous:null,
          table:[['≥ 3 essais','5'],['2 essais','4'],['1 essai','3'],['0 essai participatif','2'],['Peu impliqué','1']] },
        { id:'passes', label:'🤝 Passes en arrière', max:6, hint:'Qualité et respect de la règle de la passe',
          sous:null,
          table:[['Toutes passes en arrière, sans faute','6'],['1–2 fautes de passe','4'],['3–4 fautes','2'],['> 4 fautes','1']] },
        { id:'soutien', label:'🏃 Soutien du porteur', max:5, hint:'Suit le porteur, propose une solution',
          sous:null,
          table:[['Toujours présent derrière le porteur','5'],['La plupart du temps','4'],['Parfois','2'],['Joue seul','1']] },
        { id:'regles', label:'📖 Règles', max:4, hint:'Toucher, zone de toucher, hors-jeu défense',
          sous:null,
          table:[['0–1 infraction','4'],['2 infractions','3'],['3 infractions','2'],['4+ infractions','1']] }
      ]
    },
    c4:{
      seances:'10–12',
      ca_texte:"Créer des surnombres pour aplatir. Soutenir, passer en arrière, défendre en ligne. Arbitrer avec rigueur.",
      criteres:[
        { id:'perf', label:'⚡ Performance', max:5, hint:'Essais marqués en tournoi 5v5 ou 7v7',
          sous:null,
          table:[['≥ 3 essais','5'],['2 essais','4'],['1 essai','3'],['0 essai participatif','2'],['Peu impliqué','1']] },
        { id:'jeu', label:'🤝 Jeu collectif', max:8, hint:'Passes, soutien, surnombres — 2 matchs',
          sous:[{id:'pass',label:'Passes en arrière précises',max:3},{id:'sout',label:'Soutien du porteur',max:3},{id:'surnom',label:'Création de surnombre',max:2}],
          table:[['Passe en arrière sans faute','3/3'],['Suit le porteur, toujours proche','3/3'],['Décale pour créer le 2v1','2/2']] },
        { id:'regles', label:'⚖️ Respect des règles', max:4, hint:'Passe en arrière, toucher, remises en jeu',
          sous:null,
          table:[['0 faute de règle','4'],['1–2 fautes','3'],['3–4 fautes','2'],['> 4 fautes','1']] },
        { id:'obs', label:'📋 Grille observateur', max:3, hint:'Grille jeu collectif sur un match',
          sous:null,
          table:[['Grille complète + analyse','3'],['Grille complète','2'],['Grille partielle','1']] }
      ]
    }
  },

  // ── BADMINTON ──────────────────────────────────────
  { id:'badminton', nom:'Badminton', emoji:'🏸', ca:'CA4', famille:'Raquettes',
    c3:{
      seances:'10–12',
      ca_texte:"Mettre le volant en jeu, l'envoyer dans le camp adverse et maintenir l'échange. Compter les points et arbitrer simplement.",
      criteres:[
        { id:'tech', label:'🎯 Technique de frappe', max:8, hint:'Frappes évaluées sur 2 matchs',
          sous:[{id:'traj',label:'Trajectoires dirigées',max:3},{id:'serv',label:'Service réussi (court et long)',max:3},{id:'depl',label:'Déplacements vers le volant',max:2}],
          table:[['Dirige le volant dans les 2 zones (fond/court)','3/3'],['Service court et long réussis','3/3'],['Va chercher le volant, ne laisse pas tomber','2/2']] },
        { id:'perf', label:'⚡ Performance', max:6, hint:'Terrain final du tournoi montante-descendante (le barème s’adapte au nombre de terrains)', terrains:{min:2, mot:'Terrain'},
          sous:null,
          table:[['Terrain du haut (le meilleur)','6'],['Terrains intermédiaires : selon le nombre de terrains du jour','5–3'],['Terrain du bas','2']] },
        { id:'arb', label:'⚖️ Arbitrage', max:3, hint:'Score annoncé, fautes de service signalées',
          sous:null,
          table:[['Score + service + limites','3'],['Score annoncé','2'],['Score partiel','1'],['Refus','0']] },
        { id:'regles', label:'📖 Règles connues', max:3, hint:'Règle du volant au sol, services alternés, limites de terrain',
          sous:null,
          table:[['3 règles maîtrisées','3'],['2 règles','2'],['1 règle','1'],['Aucune','0']] }
      ]
    },
    c4:{
      seances:'10–12',
      ca_texte:"Rechercher le gain d'une rencontre par des frappes variées en longueur ou largeur. Exploiter les espaces adverses. Assurer la gestion du tournoi pyramide.",
      criteres:[
        { id:'tech', label:'🎯 Technique & Tactique', max:10, hint:'3 sous-critères observés sur 2 matchs',
          sous:[{id:'traj',label:'Trajectoires variées',max:4},{id:'frapp',label:'Frappes efficaces',max:4},{id:'depl',label:'Déplacements (retour centre)',max:2}],
          table:[['Joue dans les 4 zones','4/4'],['Frappes variées qui mettent en difficulté','4/4'],['Retour au centre systématique','2/2']] },
        { id:'perf', label:'⚡ Performance', max:6, hint:'Terrain final du tournoi montante-descendante (le barème s’adapte au nombre de terrains)', terrains:{min:2, mot:'Terrain'},
          sous:null,
          table:[['Terrain du haut (le meilleur)','6'],['Terrains intermédiaires : selon le nombre de terrains du jour','5–3'],['Terrain du bas','2']] },
        { id:'arb', label:'⚖️ Arbitrage', max:4, hint:'Match entier : annonce, règles, litiges',
          sous:null,
          table:[['Annonce score + règles + gère litiges','4'],['Annonce + règles','3'],['Annonce seulement','2'],['Refus','1']] }
      ]
    }
  },

  // ── TENNIS DE TABLE ────────────────────────────────
  { id:'tennis-table', nom:'Tennis de table', emoji:'🏓', ca:'CA4', famille:'Raquettes',
    c3:{
      seances:'10',
      ca_texte:"Mettre la balle en jeu, maintenir des échanges réguliers. Compter les points en autonomie. Connaître les règles de base.",
      criteres:[
        { id:'regul', label:'📊 Régularité des échanges', max:7, hint:'Nombre moyen de coups par échange en matchs',
          sous:null,
          table:[['> 6 coups en moyenne','7'],['4–6 coups','5'],['2–4 coups','3'],['1–2 coups','1']] },
        { id:'perf', label:'⚡ Performance', max:6, hint:'Table finale du tournoi montante-descendante, matchs en 11 points (le barème s’adapte au nombre de tables)', terrains:{min:2, mot:'Table'},
          sous:null,
          table:[['Table du haut (la meilleure)','6'],['Tables intermédiaires : selon le nombre de tables du jour','5–3'],['Table du bas','2']] },
        { id:'service', label:'🎯 Service réussi', max:4, hint:'Service coup droit correct — 3 essais',
          sous:null,
          table:[['3/3 corrects (rebond 2 côtés)','4'],['2/3 corrects','3'],['1/3 correct','2'],['0/3','1']] },
        { id:'arb', label:'⚖️ Arbitrage', max:3, hint:'Score correct en autonomie sur un match',
          sous:null,
          table:[['Score correct + règle du service','3'],['Score correct','2'],['Score partiel','1'],['Refus','0']] }
      ]
    },
    c4:{
      seances:'10',
      ca_texte:"Construire l'échange par la régularité et la variation. Passer du renvoi à la construction intentionnelle. Arbitrer et gérer le score en autonomie.",
      criteres:[
        { id:'perf', label:'⚡ Performance', max:6, hint:'Table finale du tournoi montante-descendante, matchs en 11 points (le barème s’adapte au nombre de tables)', terrains:{min:2, mot:'Table'},
          sous:null,
          table:[['Table du haut (la meilleure)','6'],['Tables intermédiaires : selon le nombre de tables du jour','5–3'],['Table du bas','2']] },
        { id:'regul', label:'📊 Régularité', max:6, hint:'Échanges construits — observé sur 2 matchs',
          sous:null,
          table:[['Échanges > 5 coups réguliers','6'],['Échanges 3–5 coups','4–5'],['Échanges 1–3 coups','2–3'],['Renvoi aléatoire','1']] },
        { id:'variete', label:'🎭 Variété', max:5, hint:'Effets, directions, rythmes variés intentionnellement',
          sous:[{id:'eff',label:'Effets (lifté/coupé)',max:2},{id:'dir',label:'Directions (croisé/long de table)',max:2},{id:'rythme',label:'Variations de rythme',max:1}],
          table:[['Lifté ou coupé maîtrisé','2/2'],['Croisé ET long de table','2/2'],['Accélère/ralentit intentionnellement','1/1']] },
        { id:'arb', label:'⚖️ Arbitrage', max:3, hint:'Gestion score + règles en autonomie',
          sous:null,
          table:[['Score + règles service + litiges','3'],['Score + règles','2'],['Score seulement','1'],['Refus','0']] }
      ]
    }
  },

  // ── ACROSPORT ──────────────────────────────────────
  { id:'acrosport', nom:'Acrosport', emoji:'🤸', ca:'CA3', famille:'Gym / Renfo',
    c3:{
      seances:'10–12',
      ca_texte:"Créer et présenter des figures à 3 en respectant les exigences de sécurité. Assurer les rôles porteur, voltigeur, pareur.",
      criteres:[
        { id:'figures', label:'⭐ Figures réalisées', max:6, hint:'Nombre et niveau des figures dans l\'enchaînement (3–4 figures)',
          sous:null,
          table:[['4 figures niveau 2','6'],['3 figures niveau 2 + 1 niveau 1','4–5'],['Figures niveau 1 uniquement','2–3'],['< 3 figures','1']] },
        { id:'exec', label:'✅ Exécution', max:6, hint:'Tenue 3 secondes, corps aligné',
          sous:null,
          table:[['Toutes figures tenues 3s, corps droit','6'],['La plupart tenues, quelques écarts','4–5'],['Tenues partielles','2–3'],['Non tenues','1']] },
        { id:'secu', label:'🛡 Sécurité', max:5, hint:'Parades respectées, posture du pareur',
          sous:null,
          table:[['Parade active sur toutes les figures','5'],['Parade présente mais passive','3'],['Parade oubliée','1']] },
        { id:'compo', label:'🎭 Présentation', max:3, hint:'Début, fin marqués, fluidité entre les figures',
          sous:null,
          table:[['Début/fin + liaisons','3'],['Début/fin sans liaisons','2'],['Enchaînement non mémorisé','1']] }
      ]
    },
    c4:{
      seances:'10–12',
      ca_texte:"Créer et présenter un enchaînement acrobatique collectif maîtrisé et esthétique. Tenir les rôles de porteur, voltigeur, pareur avec exigence.",
      criteres:[
        { id:'diff', label:'⭐ Difficulté', max:6, hint:'Niveau des figures (4 à 6 figures dans l\'enchaînement)',
          sous:null,
          table:[['Figures niveau 3 (renversements)','6'],['Figures niveau 2 (équilibre épaules)','4–5'],['Figures niveau 1 (pyramides simples)','2–3'],['Figures sans renversement','1']] },
        { id:'exec', label:'✅ Exécution', max:6, hint:'Tenue 3s, alignements, amplitude',
          sous:null,
          table:[['Toutes figures tenues 3s, corps tendu','6'],['La plupart tenues, quelques écarts','4–5'],['Tenues partielles, tremblements','2–3'],['Non tenues','1']] },
        { id:'compo', label:'🎭 Composition', max:5, hint:'Liaisons, artistique, mémorisation',
          sous:[{id:'liais',label:'Liaisons fluides',max:2},{id:'art',label:'Qualité artistique',max:2},{id:'mem',label:'Mémorisation (sans aide)',max:1}],
          table:[['Passages fluides entre toutes les figures','2/2'],['Expression, synchronisation du groupe (on part et on finit ensemble)','2/2'],['Enchaînement complet sans aide','1/1']] },
        { id:'secu', label:'🛡 Sécurité', max:3, hint:'Parades respectées, aucune mise en danger',
          sous:null,
          table:[['Parade active, jamais de danger','3'],['Parade présente mais passive','2'],['Parade oubliée 1–2 fois','1'],['Sécurité non assurée','0']] }
      ]
    }
  },

  // ── RENFO ──────────────────────────────────────────
  { id:'renfo', nom:'Renfo musculaire', emoji:'💪', ca:'CA1', famille:'Gym / Renfo', classes:['4e','3e'],
    c3:{
      seances:'10',
      ca_texte:"Réaliser des exercices au poids de corps en respectant les consignes de posture. Connaître les groupes musculaires sollicités.",
      criteres:[
        { id:'tech', label:'🎯 Posture & technique', max:6, hint:'4 exercices évalués : gainage, pompes, squats, abdos',
          sous:null,
          table:[['4/4 corrects','6'],['3/4 corrects','4–5'],['2/4 corrects','2–3'],['1/4 correct','1']] },
        { id:'connaissance', label:'📖 Connaissances', max:5, hint:'Nomme les muscles sollicités pour 4 exercices',
          sous:null,
          table:[['4/4 muscles nommés','5'],['3/4','4'],['2/4','3'],['1/4','2'],['0/4','1']] },
        { id:'programme', label:'📋 Participation active', max:5, hint:'Engagement dans toutes les séances',
          sous:null,
          table:[['Toujours actif, aide ses camarades','5'],['Régulier, quelques pauses','4'],['Irrégulier','2'],['Peu impliqué','1']] },
        { id:'echauf', label:'🔥 Échauffement', max:4, hint:'Participe activement à l\'échauffement',
          sous:null,
          table:[['Actif et attentif','4'],['Présent mais passif','2'],['Absent ou distrait','1']] }
      ]
    },
    c4:{
      seances:'10',
      ca_texte:"Réaliser les exercices avec la bonne technique. Suivre et respecter le programme de sa fiche (en groupe). Mesurer ses progrès sur le cycle.",
      criteres:[
        { id:'tech', label:'🎯 Technique d\'exécution', max:5, hint:'10 exercices : 3 haut du corps, 3 bas du corps, 4 tout le corps — qualité gestuelle',
          sous:null,
          table:[['9–10 exercices corrects','5'],['7–8 corrects','4'],['5–6 corrects','3'],['3–4 corrects','2'],['< 3 corrects','1']] },
        { id:'programme', label:'📋 Réalisation de la fiche', max:5, hint:'Fiche du groupe (2 élèves ou +) : les exercices imposés sont respectés et la fiche est menée à terme',
          sous:null,
          table:[['Respecte tous les exercices de sa fiche, tours complets','5'],['Respecte sa fiche, 1–2 exercices ou tours non terminés','4'],['Respecte partiellement (exercices changés ou omis)','2–3'],['Ne suit pas sa fiche','1'],['Aucune réalisation','0']] },
        { id:'progres', label:'📈 Progrès mesurés', max:5, hint:'Amélioration entre début et fin de cycle',
          sous:null,
          table:[['Progression sur ≥ 3 exercices','5'],['Progression sur 2 exercices','4'],['Progression sur 1','3'],['Stagnation','2'],['Régression','1']] },
        { id:'echauf', label:'🔥 Échauffement autonome', max:5, hint:'Échauffement réalisé seul en début de séance',
          sous:null,
          table:[['Complet et progressif, seul','5'],['Correct, quelques oublis','4'],['Partiel','2–3'],['Absent','1']] }
      ]
    }
  },

  // ── COURSE ORIENTATION ─────────────────────────────
  { id:'course-orientation', nom:"Course d'orientation", emoji:'🗺️', ca:'CA2', famille:'Plein air',
    c3:{
      seances:'8–10',
      ca_texte:"Lire une carte simplifiée et se repérer dans un espace connu. Trouver des balises en binôme. Respecter les limites de sécurité.",
      criteres:[
        { id:'balises', label:'📍 Balises trouvées', max:7, hint:'Parcours en score 12 min en binôme',
          sous:null,
          table:[['Score ≥ 80%','7'],['60–79%','5–6'],['40–59%','3–4'],['20–39%','2'],['< 20%','1']] },
        { id:'carte', label:'🗺 Lecture de carte', max:5, hint:'Orientée la carte correctement, utilise les symboles',
          sous:null,
          table:[['Carte orientée + 3 symboles utilisés','5'],['Carte orientée + 1–2 symboles','4'],['Carte orientée seulement','2–3'],['Carte non orientée','1']] },
        { id:'secu', label:'🛡 Respect des limites', max:4, hint:'Reste dans la zone autorisée, revient dans les temps',
          sous:null,
          table:[['Respect total','4'],['1 dépassement mineur','3'],['2 dépassements','2'],['Hors-zone fréquent','1']] },
        { id:'bilan', label:'📋 Bilan de parcours', max:4, hint:'Trace son itinéraire sur la carte après le parcours',
          sous:null,
          table:[['Tracé complet','4'],['Tracé partiel','2'],['Absence de tracé','1']] }
      ]
    },
    c4:{
      seances:'8–10',
      ca_texte:"Lire une carte et se repérer dans l'espace réel. Planifier son parcours, prendre des décisions autonomes. Gérer sa sécurité.",
      criteres:[
        { id:'balises', label:'📍 Balises trouvées', max:7, hint:'Parcours en score 15–20 min individuel',
          sous:null,
          table:[['Score ≥ 90%','7'],['70–89%','5–6'],['50–69%','3–4'],['30–49%','2'],['< 30%','1']] },
        { id:'strat', label:'🧠 Stratégie de parcours', max:5, hint:'Itinéraire optimisé, ordre des balises',
          sous:null,
          table:[['Itinéraire optimisé, ordre logique','5'],['Bon parcours, 1–2 détours','4'],['Plusieurs allers-retours','2–3'],['Aléatoire','1']] },
        { id:'auto', label:'🧭 Autonomie', max:5, hint:'Sans aide de l\'enseignant',
          sous:null,
          table:[['0 aide demandée','5'],['1 aide','4'],['2–3 aides','2–3'],['Dépendant','1']] },
        { id:'bilan', label:'📋 Bilan de parcours', max:3, hint:'Tracé + analyse des erreurs',
          sous:null,
          table:[['Tracé exact + analyse','3'],['Tracé présent','2'],['Tracé partiel','1'],['Absent','0']] }
      ]
    }
  },

  // ── LUTTE ──────────────────────────────────────────
  { id:'lutte', nom:'Lutte', emoji:'🥋', ca:'CA4', famille:'Combat',
    c3:{
      seances:'10',
      ca_texte:"S'engager en sécurité dans un corps-à-corps codifié. Déséquilibrer son adversaire et le mettre au sol. Respecter les règles et son partenaire.",
      criteres:[
        { id:'perf', label:'⚡ Performance', max:5, hint:'Tournoi 1×2 min — points marqués',
          sous:null,
          table:[['≥ 5 points','5'],['3–4 points','4'],['2 points','3'],['1 point','2'],['0 point','1']] },
        { id:'tech', label:'🎯 Technique', max:6, hint:'Qualité des actions offensives',
          sous:[{id:'desq',label:'Déséquilibre (tirer/pousser)',max:3},{id:'sol',label:'Amener au sol',max:3}],
          table:[['Utilise tirer + pousser pour déséquilibrer','3/3'],['Amène au sol de façon contrôlée','3/3']] },
        { id:'secu', label:'🛡 Sécurité & respect', max:5, hint:'Respect des interdits, gestes contrôlés',
          sous:null,
          table:[['0 geste dangereux, accompagne','5'],['1–2 manquements légers','4'],['3 manquements','3'],['Gestes dangereux','1']] },
        { id:'regles', label:'📖 Règles connues', max:4, hint:'Interdits (cou, doigts, cheveux), mise au sol, contrôle 3s',
          sous:null,
          table:[['3 règles maîtrisées','4'],['2 règles','3'],['1 règle','2'],['Aucune','1']] }
      ]
    },
    c4:{
      seances:'10',
      ca_texte:"S'engager en sécurité dans un corps-à-corps codifié. Déséquilibrer, amener au sol et contrôler l'adversaire. Arbitrer un combat.",
      criteres:[
        { id:'perf', label:'⚡ Performance', max:6, hint:'Tournoi 2×2 min — points (mise au sol=1, contrôle 3s=2)',
          sous:null,
          table:[['≥ 8 points','6'],['6–7 points','5'],['4–5 points','4'],['2–3 points','3'],['1 point','2'],['0 point','1']] },
        { id:'tech', label:'🎯 Technique offensive', max:6, hint:'Déséquilibre, projection, contrôle',
          sous:[{id:'desq',label:'Déséquilibre avant projection',max:2},{id:'proj',label:'Projection maîtrisée',max:2},{id:'ctrl',label:'Contrôle au sol 3s',max:2}],
          table:[['Saisit et tire/pousse avant de projeter','2/2'],['Projection technique, adversaire accompagné','2/2'],['Maintient 3s sans danger','2/2']] },
        { id:'secu', label:'🛡 Sécurité & respect', max:5, hint:'Interdits, gestes contrôlés, attitude',
          sous:null,
          table:[['0 interdit, accompagne toujours','5'],['1–2 manquements mineurs','4'],['3 manquements','3'],['Gestes dangereux répétés','1']] },
        { id:'arb', label:'⚖️ Arbitrage', max:3, hint:'Arbitre un combat 2×2 min',
          sous:null,
          table:[['Points corrects + litiges gérés','3'],['Points corrects','2'],['Hésitant','1'],['Refuse','0']] }
      ]
    }
  },

  // ── COMBINÉ ATHLÉTIQUE ──────────────────────────────
  { id:'combine', nom:'Combiné athlétique', emoji:'🏅', ca:'CA1', famille:'Athlétisme',
    c3:{
      seances:'10–12',
      ca_texte:"Combiner une course, des bonds et un lancer pour faire la meilleure performance cumulée. Mesurer, chronométrer et noter ses performances.",
      criteres:[
        { id:'course', label:'⚡ Course 30 m', max:5, hint:'Départ arrêté, 2 essais, meilleur temps',
          sous:null,
          table:[['< 5 s','5'],['5–5,4 s','4'],['5,4–5,8 s','3'],['5,8–6,3 s','2'],['> 6,3 s','1']] },
        { id:'saut', label:'🦘 5 bonds sur herbe', max:5, hint:'Départ pieds joints, 5 bonds alternés, 2 essais, meilleure distance',
          sous:null,
          table:[['≥ 10 m','5'],['9–10 m','4'],['8–9 m','3'],['7–8 m','2'],['< 7 m','1']] },
        { id:'lancer', label:'🌀 Lancer de vortex', max:5, hint:"Élan de 3 pas maximum, 2 essais, meilleure distance. Vortex pas fait : NE",
          sous:null,
          table:[['≥ 30 m','5'],['24–30 m','4'],['18–24 m','3'],['12–18 m','2'],['< 12 m','1']] },
        { id:'role', label:'⏱ Juge / chronométreur', max:3, hint:'Chronomètre ou mesure ses camarades et note les résultats',
          sous:null,
          table:[['Mesures justes, notées sans aide','3'],['Mesures justes avec un peu d’aide','2'],['Mesures approximatives','1'],['Absent','0']] },
        { id:'fiche', label:'📋 Fiche de performances', max:2, hint:'Performances notées à chaque séance, comparaison 1re et dernière séance',
          sous:null,
          table:[['Complète avec comparaison','2'],['Incomplète','1'],['Absente','0']] }
      ]
    },
    c4:{
      seances:'10–12',
      ca_texte:"Planifier et réaliser une épreuve combinée course + bonds + lancer. Annoncer son total et analyser l'écart. Assumer les rôles de juge et de chronométreur.",
      criteres:[
        { id:'course', label:'⚡ Course 40 m', max:5, hint:'Départ en appuis décalés, 2 essais, meilleur temps',
          sous:null,
          table:[['< 6,2 s','5'],['6,2–6,7 s','4'],['6,7–7,2 s','3'],['7,2–7,8 s','2'],['> 7,8 s','1']] },
        { id:'saut', label:'🦘 5 bonds sur herbe', max:5, hint:'5 bonds alternés avec élan réduit (3 pas), 2 essais',
          sous:null,
          table:[['≥ 11 m','5'],['10–11 m','4'],['9–10 m','3'],['8–9 m','2'],['< 8 m','1']] },
        { id:'lancer', label:'🌀 Lancer de vortex', max:5, hint:"Élan de 5 pas maximum, 2 essais. Vortex pas fait : NE",
          sous:null,
          table:[['≥ 36 m','5'],['30–36 m','4'],['24–30 m','3'],['18–24 m','2'],['< 18 m','1']] },
        { id:'projet', label:'🎯 Projet', max:3, hint:'Total des 3 épreuves (sur 15) annoncé avant le combiné',
          sous:null,
          table:[['Écart ≤ 1 point','3'],['Écart de 2 points','2'],['Écart de 3 points','1'],['Écart > 3 points','0']] },
        { id:'role', label:'⏱ Juge / chronométreur', max:2, hint:'Mesures et chronos des camarades',
          sous:null,
          table:[['Mesures justes, notées sans aide','2'],['Avec aide','1'],['Absent','0']] }
      ]
    }
  },
];
// ── TEMPORAIRE (oct. 2026) : CO 4e, évaluation 45 min (balises + heure de découverte notée).
//    Placé avant la CO habituelle, qui reste inchangée juste en dessous.
//    Pour le retirer : supprimer ce bloc.
(function(){
  var co=SPORTS.find(function(x){return x.id==='course-orientation';});
  SPORTS.splice(SPORTS.indexOf(co),0,{
    id:'co-temp', nom:"CO temporaire · 45 min", emoji:'⏱️', ca:'CA2', famille:'Plein air',
    c3:co.c3,
    c4:{
      seances:'1 (temporaire)',
      ca_texte:"Barème temporaire : 45 min pour trouver un maximum de balises, en notant l'heure de découverte de chacune.",
      criteres:[
        { id:'bal', label:'📍 Balises trouvées', max:12, hint:'12 × (balises trouvées ÷ balises posées), arrondi — une balise sans heure notée ne compte pas',
          sous:null,
          table:[['≥ 90 % des balises','11–12'],['70–89 %','9–10'],['50–69 %','6–8'],['30–49 %','4–5'],['10–29 %','2–3'],['< 10 %','0–1']] },
        { id:'tps', label:'⏱ Respect du temps', max:4, hint:'Retour dans les 45 min',
          sous:null,
          table:[['Retour dans les 45 min','4'],['Jusqu\'à 2 min de retard','3'],['De 2 à 5 min de retard','2'],['Plus de 5 min ou pas rentré','0']] },
        { id:'fia', label:'📝 Fiabilité des heures notées', max:4, hint:'Heure de découverte notée pour chaque balise',
          sous:null,
          table:[['Toutes les heures notées et cohérentes','4'],['Quelques oublis','3'],['La moitié notée','2'],['Presque rien noté','1'],['Rien','0']] }
      ]
    }
  });
})();

// ═══════════════════════════════════════════════════════
// PROGRESSION PAR CLASSE (6e → 5e → 4e → 3e)
// ═══════════════════════════════════════════════════════
// Chaque classe garde EXACTEMENT les mêmes critères et les mêmes points que le
// barème de son cycle (6e = cycle 3, 5e/4e/3e = cycle 4) : seules les exigences
// changent (seuils de performance, critères techniques plus fins, projet plus
// précis, rôles plus exigeants). Les notes déjà saisies restent donc valables.
// `crit` remplace, critère par critère, le texte d'aide (hint) et/ou le tableau.
// Convention des tableaux : « 106–114 s » = de 106 s inclus à 114 s exclu.
const NIVEAUX = {
  relais: {
    '6e': { epreuve: "4 × 120 m (1 tour de piste 40 × 20 m par relayeur). 3 essais, meilleur temps parmi les essais valides." },
    '5e': {
      ca_texte: "Courir vite sur sa fraction et transmettre le témoin dans la zone en partant sur une marque au sol.",
      epreuve: "4 × 120 m, 3 essais. Le receveur part sur une marque au sol (regard autorisé).",
      crit: {
        temps: { table: [['< 102 s','6'],['102–109 s','5'],['109–117 s','4'],['117–126 s','3'],['126–134 s','2'],['> 134 s','1'],['Aucun essai valide','0']] },
        passage: { hint: "3 passages notés 0–2 : départ sur la marque, transmission dans la zone", table: [['Départ sur la marque, transmission dans la zone sans ralentir','2'],['Transmission dans la zone mais ralentissement ou départ trop tôt/tard','1'],['Arrêt, témoin tombé ou hors zone','0']] },
        regul: { table: [['3 essais valides, écart < 5,5 s','4'],['3 essais valides, écart 5,5–8,5 s','3'],['3 essais valides, écart > 8,5 s, ou 1 disqualification','2'],['2 disqualifications','1'],['3 disqualifications (aucun temps valide)','0']] }
      }
    },
    '4e': {
      ca_texte: "Transmettre en aveugle dans la zone sans ralentir. Ajuster sa marque de départ avec son partenaire.",
      epreuve: "4 × 120 m, 3 essais. Transmission en aveugle demandée, le receveur ajuste sa marque.",
      crit: {
        temps: { table: [['< 97 s','6'],['97–105 s','5'],['105–112 s','4'],['112–120 s','3'],['120–129 s','2'],['> 129 s','1'],['Aucun essai valide','0']] },
        passage: { hint: "3 passages notés 0–2 : transmission en aveugle, zone respectée, vitesse conservée", table: [['Aveugle, dans la zone, sans ralentir','2'],['Aveugle tenté mais ralentissement, ou regard','1'],['Arrêt, témoin tombé ou hors zone','0']] },
        regul: { table: [['3 essais valides, écart < 5 s','4'],['3 essais valides, écart 5–8 s','3'],['3 essais valides, écart > 8 s, ou 1 disqualification','2'],['2 disqualifications','1'],['3 disqualifications (aucun temps valide)','0']] }
      }
    },
    '3e': {
      ca_texte: "Optimiser la transmission en aveugle, régler sa marque, choisir l'ordre des relayeurs et analyser les essais pour progresser.",
      epreuve: "4 × 120 m, 3 essais. Transmission en aveugle à pleine vitesse ; l'équipe choisit et justifie son ordre de passage.",
      crit: {
        temps: { table: [['< 94 s','6'],['94–101 s','5'],['101–108 s','4'],['108–116 s','3'],['116–124 s','2'],['> 124 s','1'],['Aucun essai valide','0']] },
        passage: { hint: "3 passages notés 0–2 : aveugle, pleine vitesse, marque réglée par l'élève", table: [['Aveugle, pleine vitesse, marque bien réglée','2'],['Aveugle mais ralentissement ou marque mal réglée','1'],['Avec regard, arrêt ou hors zone','0']] },
        regul: { table: [['3 essais valides, écart < 4,5 s','4'],['3 essais valides, écart 4,5–7 s','3'],['3 essais valides, écart > 7 s, ou 1 disqualification','2'],['2 disqualifications','1'],['3 disqualifications (aucun temps valide)','0']] }
      }
    }
  },

  'course-longue': {
    '6e': { epreuve: "Courir jusqu'à 15 min sans s'arrêter, en annonçant sa durée cible avant de partir." },
    '5e': {
      ca_texte: "Courir 12 min à une allure choisie à partir de sa VMA. Relever les temps de passage d'un camarade.",
      epreuve: "12 min de course. L'élève annonce la distance visée (calculée avec sa VMA) ; plots tous les 20 m pour mesurer la distance réalisée.",
      crit: {
        vma: { hint: "VMA en km/h au test de début de cycle (Vameval ou Léger-Boucher)", table: [['≥ 13 km/h','4'],['12–13 km/h','3'],['11–12 km/h','2'],['10–11 km/h','1'],['< 10 km/h','0']] },
        projet: { table: [['Écart ≤ 75 m','8'],['Écart 75–150 m','6'],['Écart 150–250 m','4'],['Écart 250–350 m','2'],['Écart > 350 m','0']] },
        regul: { table: [['Variation < 8 %','5'],['Variation 8–12 %','4'],['Variation 12–16 %','3'],['Variation 16–22 %','2'],['> 22 %','1']] },
        obs: { hint: "Relève les temps de passage d'un camarade à chaque tour", table: [['Tous les temps relevés et lisibles','3'],['Quelques oublis','2'],['Relevé très incomplet','1'],['Absent','0']] }
      }
    },
    '4e': {
      ca_texte: "Construire un projet de course à partir de sa VMA et le tenir sur 12 min. Comparer ses temps de passage au projet.",
      epreuve: "12 min de course à allure annoncée (% de VMA choisi par l'élève), temps de passage relevés par l'observateur.",
      crit: {
        vma: { hint: "VMA en km/h au test de début de cycle (Vameval ou Léger-Boucher)", table: [['≥ 13,5 km/h','4'],['12,5–13,5 km/h','3'],['11,5–12,5 km/h','2'],['10,5–11,5 km/h','1'],['< 10,5 km/h','0']] },
        projet: { table: [['Écart ≤ 60 m','8'],['Écart 60–120 m','6'],['Écart 120–200 m','4'],['Écart 200–300 m','2'],['Écart > 300 m','0']] },
        regul: { table: [['Variation < 6 %','5'],['Variation 6–11 %','4'],['Variation 11–15 %','3'],['Variation 15–20 %','2'],['> 20 %','1']] },
        obs: { hint: "Relève les temps de passage et les compare au projet du camarade", table: [['Temps relevés + écart au projet calculé','3'],['Temps relevés correctement','2'],['Relevé incomplet','1'],['Absent','0']] }
      }
    },
    '3e': {
      ca_texte: "Établir et tenir un projet de course basé sur sa VMA. Gérer son effort sur 12 minutes. Observer un camarade et lui proposer un retour constructif.",
      epreuve: "12 min de course à allure annoncée. L'observateur relève les passages et propose un conseil pour la prochaine course.",
      crit: {
        vma: { hint: "VMA en km/h au test de début de cycle (Vameval ou Léger-Boucher)", table: [['≥ 14 km/h','4'],['13–14 km/h','3'],['12–13 km/h','2'],['11–12 km/h','1'],['< 11 km/h','0']] }
      }
    }
  },

  'demi-fond': {
    '6e': { epreuve: "Courir 8 min à allure soutenue sans s'arrêter, tours chronométrés." },
    '5e': {
      ca_texte: "Courir 3 fois 3 minutes à 3 allures différentes annoncées à l'avance. Connaître sa VMA et s'en servir pour choisir ses allures.",
      epreuve: "3 courses de 3 min (environ 80, 90 et 100 % de VMA), 2 min de récupération marchée entre chaque. L'élève annonce sa distance avant chaque course ; plot posé au coup de sifflet final.",
      crit: {
        vma: { hint: "VMA en km/h au test de début de cycle", table: [['≥ 13 km/h','4'],['12–13 km/h','3'],['11–12 km/h','2'],['10–11 km/h','1'],['< 10 km/h','0']] },
        projet: { hint: "Écart total entre les 3 distances annoncées et réalisées", table: [['Écart ≤ 6 %','9'],['Écart 6–10 %','7'],['Écart 10–15 %','5'],['Écart 15–20 %','3'],['> 20 %','1']] },
        perf: { hint: "Distance totale des 3 courses de 3 min", table: [['≥ 1650 m','5'],['1500–1650 m','4'],['1350–1500 m','3'],['1200–1350 m','2'],['< 1200 m','1']] },
        fiche: { hint: "VMA, distances annoncées et réalisées notées", table: [['Fiche complète','2'],['Fiche incomplète','1'],['Absente','0']] }
      }
    },
    '4e': {
      ca_texte: "Construire un projet à 3 allures à partir de sa VMA et le tenir. Analyser l'écart entre prévu et réalisé.",
      epreuve: "3 × 3 min à 3 allures annoncées (80, 90, 100 % de VMA), récupération 2 min. Analyse écrite des écarts.",
      crit: {
        vma: { hint: "VMA en km/h au test de début de cycle", table: [['≥ 13,5 km/h','4'],['12,5–13,5 km/h','3'],['11,5–12,5 km/h','2'],['10,5–11,5 km/h','1'],['< 10,5 km/h','0']] },
        projet: { hint: "Écart total entre les 3 distances annoncées et réalisées", table: [['Écart ≤ 5 %','9'],['Écart 5–9 %','7'],['Écart 9–13 %','5'],['Écart 13–18 %','3'],['> 18 %','1']] },
        perf: { hint: "Distance totale des 3 courses de 3 min", table: [['≥ 1720 m','5'],['1560–1720 m','4'],['1400–1560 m','3'],['1250–1400 m','2'],['< 1250 m','1']] }
      }
    },
    '3e': {
      ca_texte: "Gérer son effort entre 3 et 9 minutes. Planifier et réaliser un projet de course basé sur sa VMA. Analyser sa performance et proposer un ajustement.",
      epreuve: "3 × 3 min à 3 allures annoncées, récupération 2 min. Analyse des écarts et ajustement proposé pour la course suivante.",
      crit: {
        vma: { hint: "VMA en km/h au test de début de cycle", table: [['≥ 14 km/h','4'],['13–14 km/h','3'],['12–13 km/h','2'],['11–12 km/h','1'],['< 11 km/h','0']] },
        projet: { hint: "Écart total entre les 3 distances annoncées et réalisées", table: [['Écart ≤ 4 %','9'],['Écart 4–8 %','7'],['Écart 8–12 %','5'],['Écart 12–16 %','3'],['> 16 %','1']] },
        perf: { hint: "Distance totale des 3 courses de 3 min", table: [['≥ 1800 m','5'],['1630–1800 m','4'],['1460–1630 m','3'],['1300–1460 m','2'],['< 1300 m','1']] }
      }
    }
  },

  sprint: {
    '6e': { epreuve: "3 courses de 40 m départ debout, meilleur temps retenu." },
    '5e': {
      epreuve: "3 courses de 50 m, meilleur temps retenu.",
      crit: { perf: { table: [['< 7,4 s','8'],['7,4–7,9 s','7'],['7,9–8,4 s','6'],['8,4–8,9 s','5'],['8,9–9,4 s','4'],['9,4–10,3 s','3'],['10,3–11,2 s','2'],['> 11,2 s','1']] } }
    },
    '4e': {
      epreuve: "3 courses de 50 m, départ en appuis décalés, meilleur temps retenu.",
      crit: { perf: { table: [['< 7,2 s','8'],['7,2–7,7 s','7'],['7,7–8,2 s','6'],['8,2–8,7 s','5'],['8,7–9,2 s','4'],['9,2–10,1 s','3'],['10,1–11 s','2'],['> 11 s','1']] } }
    },
    '3e': { epreuve: "3 courses de 50 m, départ en appuis décalés, analyse de sa course (vitesse, décélération)." }
  },

  basket: {
    '6e': { epreuve: "Matchs 3 contre 3, observation sur 2 matchs, arbitrage d'un match." },
    '5e': {
      ca_texte: "Conserver la balle et progresser vers le panier en passant à un partenaire démarqué. Arbitrer les fautes simples.",
      epreuve: "Tournoi 4 contre 4, 3 matchs de 6 min. Un observateur par équipe remplit la grille.",
      crit: {
        jeu: { hint: "3 critères observés sur 2 matchs", table: [['Passe à un partenaire démarqué, sans dribble inutile','3/3'],['Se démarque dans un espace libre pour recevoir','3/3'],['Avance vers le panier dès qu’il reçoit','2/2']] },
        arb: { table: [['Score + marcher + sorties annoncés','4'],['Score + sorties','3'],['Score seulement','2'],['Arbitrage absent','1']] },
        def: { hint: "Défense sur son joueur, 2 matchs observés", table: [['Gêne le porteur, se replace entre son joueur et le panier','3'],['Suit son joueur','2'],['Défend de façon intermittente','1'],['Ne défend pas','0']] }
      }
    },
    '4e': {},
    '3e': {
      ca_texte: "Créer et exploiter des situations favorables (surnombre, contre-attaque, attaque placée). Défendre collectivement. Arbitrer et analyser un match.",
      epreuve: "Tournoi 4 contre 4, 3 matchs de 6 min. L'observateur relève les tirs et les pertes de balle et propose un conseil à son équipe.",
      crit: {
        jeu: { hint: "Choix tactiques observés sur 2 matchs", table: [['Fixe un défenseur et passe pour créer le surnombre','3/3'],['Choisit entre contre-attaque et attaque placée','3/3'],['Tire en situation favorable (près, seul)','2/2']] },
        arb: { table: [['Arbitre seul : fautes, marcher, litiges, explique ses décisions','4'],['Score + marcher + contacts','3'],['Score seulement','2'],['Arbitrage absent','1']] },
        def: { table: [['Défense collective : aide, change de joueur, récupère des balles','3'],['Défend sur son joueur, replacement correct','2'],['Défend de façon intermittente','1'],['Ne défend pas','0']] }
      }
    }
  },

  football: {
    '6e': { epreuve: "Matchs 4 contre 4, observation sur 2 matchs, arbitrage d'un match." },
    '5e': {
      ca_texte: "Conserver le ballon par des passes et progresser vers le but. Arbitrer les fautes simples.",
      crit: {
        jeu: { table: [['Passe à un partenaire libre','3/3'],['Se déplace vers un espace libre','3/3'],['Reste à portée du porteur','2/2']] },
        arb: { table: [['Mains + sorties + remises en jeu','4'],['Mains + sorties','3'],['Sorties seulement','2'],['Refus','1']] },
        obs: { hint: "Grille simple sur un match (passes réussies)", table: [['Grille complète','3'],['Grille presque complète','2'],['Grille partielle','1'],['Absent','0']] }
      }
    },
    '4e': {},
    '3e': {
      ca_texte: "Créer des déséquilibres (jeu en largeur, appels en profondeur) pour marquer. Arbitrer et analyser un match.",
      crit: {
        jeu: { table: [['Passe qui élimine un adversaire (vers l’avant, dans la course)','3/3'],['Appels en largeur ou en profondeur','3/3'],['Soutien juste derrière ou à côté du porteur','2/2']] },
        obs: { hint: "Grille d'actions offensives + conseil à l'équipe", table: [['Grille complète + conseil pertinent','3'],['Grille complète','2'],['Grille partielle','1'],['Absent','0']] }
      }
    }
  },

  ultimate: {
    '6e': { epreuve: "Tournoi 4 contre 4, matchs en auto-arbitrage." },
    '5e': {
      ca_texte: "Lancer et recevoir le disque à 10 m. Progresser vers la zone d'en-but sans courir avec le disque. Auto-arbitrer avec l'aide de l'enseignant.",
      epreuve: "Tournoi 5 contre 5, 3 matchs. Un observateur par équipe.",
      crit: {
        jeu: { table: [['Revers et coup droit précis à 10 m','3/3'],['Se démarque pour recevoir','2/2'],['Avance vers la zone d’en-but','2/2']] },
        spirit: { table: [['Annonce ses fautes et respecte les décisions','5'],['Auto-arbitre avec un peu d’aide','4'],['Quelques oublis','3'],['Litiges fréquents','2'],['Refus','0']] },
        obs: { hint: "Grille spirit simple sur l'équipe adverse", table: [['Grille complète','3'],['Grille presque complète','2'],['Grille partielle','1']] }
      }
    },
    '4e': {
      crit: {
        jeu: { table: [['Lancers précis à 15 m et en mouvement','3/3'],['Se démarque et pivote avant de lancer','2/2'],['Progresse zone par zone','2/2']] }
      }
    },
    '3e': {}
  },

  'ballon-prisonnier': {
    '6e': { epreuve: "Tournoi en 3 manches." },
    '5e': { epreuve: "Non évalué cette année : joué dans la 2e partie du cycle 5." },
    '4e': {},
    '3e': {}
  },

  rugby: {
    '6e': { epreuve: "Tournoi toucher-plaquage." },
    '5e': {
      ca_texte: "Avancer en passant en arrière et soutenir le porteur. Respecter la règle du toucher.",
      crit: {
        jeu: { table: [['Passe en arrière sans faute','3/3'],['Suit le porteur','3/3'],['Avance dès qu’il a le ballon','2/2']] }
      }
    },
    '4e': {},
    '3e': {
      ca_texte: "Créer et exploiter le surnombre pour marquer. Défendre en ligne. Arbitrer et analyser le jeu de son équipe.",
      crit: {
        jeu: { table: [['Fixe un défenseur avant de passer','3/3'],['Soutien en position de recevoir à pleine vitesse','3/3'],['Crée et exploite le 2 contre 1','2/2']] },
        obs: { hint: "Grille jeu collectif + conseil à l'équipe", table: [['Grille complète + conseil pertinent','3'],['Grille complète','2'],['Grille partielle','1']] }
      }
    }
  },

  badminton: {
    '6e': { epreuve: "Tournoi par terrains (montante-descendante), matchs en 15 points." },
    '5e': {
      ca_texte: "Renvoyer le volant loin ou court pour déplacer l'adversaire. Servir court et long. Arbitrer un match.",
      epreuve: "Tournoi par terrains (montante-descendante). Technique observée sur 2 matchs.",
      crit: {
        tech: { table: [['Joue loin et court','4/4'],['Service court et service long réussis','4/4'],['Se déplace vers le volant et revient','2/2']] },
        arb: { table: [['Score + fautes de service + limites','4'],['Score + limites','3'],['Score seulement','2'],['Refus','1']] }
      }
    },
    '4e': {
      ca_texte: "Varier les trajectoires (longueur et largeur) pour mettre l'adversaire en difficulté. Se replacer au centre. Arbitrer un match.",
      crit: {
        tech: { table: [['Joue dans les 4 coins du terrain','4/4'],['Frappes variées (dégagé, amorti)','4/4'],['Retour au centre après chaque frappe','2/2']] }
      }
    },
    '3e': {
      ca_texte: "Construire le point : provoquer une faiblesse adverse puis l'exploiter (smash, amorti). Arbitrer et conseiller un joueur.",
      crit: {
        tech: { table: [['Construit le point puis l’exploite (smash, amorti)','4/4'],['Frappes variées qui mettent en difficulté','4/4'],['Replacement rapide et équilibré','2/2']] },
        arb: { table: [['Arbitre seul + conseil au joueur','4'],['Annonce + règles','3'],['Annonce seulement','2'],['Refus','1']] }
      }
    }
  },

  'tennis-table': {
    '6e': { epreuve: "Tournoi par tables (montante-descendante), matchs en 11 points." },
    '5e': {
      ca_texte: "Maintenir l'échange en coup droit et revers. Commencer à diriger la balle. Arbitrer un match.",
      crit: {
        regul: { table: [['Échanges de plus de 5 coups réguliers','6'],['Échanges de 3 à 5 coups','4–5'],['Échanges de 1 à 3 coups','2–3'],['Renvoi aléatoire','1']] },
        variete: { table: [['Coup droit et revers maîtrisés','2/2'],['Dirige la balle à droite ou à gauche','2/2'],['Varie la vitesse','1/1']] }
      }
    },
    '4e': {},
    '3e': {
      ca_texte: "Construire le point (placement, effet, accélération) pour gagner. Arbitrer et conseiller un joueur.",
      crit: {
        variete: { table: [['Effets lifté et coupé utilisés à bon escient','2/2'],['Croisé, long de ligne et changements de direction','2/2'],['Accélère pour conclure le point','1/1']] },
        arb: { table: [['Score + service + litiges + conseil au joueur','3'],['Score + règles','2'],['Score seulement','1'],['Refus','0']] }
      }
    }
  },

  acrosport: {
    '6e': { epreuve: "Présentation devant la classe d'un enchaînement à 3 ou 4 : 3 à 4 figures, début et fin marqués." },
    '5e': {
      ca_texte: "Réaliser un enchaînement de figures acrobatiques à 3 ou 4, en sécurité, devant un jury d'élèves.",
      epreuve: "Enchaînement de 4 figures (dont 1 dynamique) noté par l'enseignant ; un groupe d'élèves juge en parallèle avec une fiche de juge.",
      crit: {
        diff: { table: [['4 figures dont 2 de niveau 2','6'],['4 figures de niveau 1 et 2','4–5'],['Figures de niveau 1 uniquement','2–3'],['Moins de 4 figures','1']] },
        compo: { table: [['Liaisons fluides entre les figures','2/2'],['Début et fin marqués, synchronisation','2/2'],['Enchaînement mémorisé','1/1']] }
      }
    },
    '4e': {
      ca_texte: "Composer un enchaînement acrobatique collectif plus difficile, synchronisé sans musique (au compte ou au signal). Juger un autre groupe.",
      epreuve: "Enchaînement de 5 figures synchronisé au compte, noté par l'enseignant ; un groupe d'élèves juge en parallèle avec une fiche de juge.",
      crit: {
        diff: { table: [['5 figures dont 2 de niveau 3','6'],['5 figures de niveau 2','4–5'],['Figures de niveau 1 et 2','2–3'],['Moins de 5 figures','1']] }
      }
    },
    '3e': {
      ca_texte: "Créer et interpréter une composition acrobatique et artistique. Se filmer, revoir la prestation et la faire évoluer.",
      epreuve: "Composition de 6 figures avec un thème (sans musique : rythme au compte, frappes de mains, silences). Une première version filmée, analysée puis améliorée avant la présentation finale.",
      crit: {
        compo: { hint: "Liaisons, thème, analyse vidéo", table: [['Liaisons fluides et originales','2/2'],['Le thème et le rythme servent la composition','2/2'],['Améliorations visibles après la vidéo','1/1']] }
      }
    }
  },

  renfo: {
    '6e': { epreuve: "4 exercices au poids du corps évalués (gainage, pompes, squats, abdos)." },
    '5e': {
      epreuve: "Circuit de 6 exercices au poids du corps.",
      crit: { tech: { hint: "6 exercices : 2 haut du corps, 2 bas du corps, 2 tout le corps", table: [['6 exercices corrects','5'],['5 corrects','4'],['4 corrects','3'],['2–3 corrects','2'],['< 2 corrects','1']] } }
    },
    '4e': {
      epreuve: "Circuit de 8 exercices sur la fiche du groupe.",
      crit: { tech: { hint: "8 exercices : 3 haut du corps, 3 bas du corps, 2 tout le corps", table: [['7–8 exercices corrects','5'],['6 corrects','4'],['4–5 corrects','3'],['2–3 corrects','2'],['< 2 corrects','1']] } }
    },
    '3e': {}
  },

  'course-orientation': {
    '6e': { epreuve: "Parcours en étoile dans un espace clos et connu, en binôme, retour à l'enseignant entre chaque balise." },
    '5e': {
      ca_texte: "Orienter sa carte et trouver des balises dans un espace délimité, seul ou en binôme. Respecter les limites et l'heure de retour.",
      epreuve: "Parcours en score en binôme, temps limité, espace délimité.",
      crit: {
        strat: { table: [['Choisit un ordre de balises cohérent','5'],['Bon parcours, quelques détours','4'],['Plusieurs allers-retours','2–3'],['Au hasard','1']] },
        auto: { table: [['Aucune aide demandée','5'],['1 aide','4'],['2–3 aides','2–3'],['Dépendant','1']] }
      }
    },
    '4e': {},
    '3e': {
      ca_texte: "Planifier un itinéraire, choisir entre plusieurs options et le réaliser seul dans un milieu moins connu. Gérer sa sécurité et analyser ses erreurs.",
      crit: {
        strat: { table: [['Itinéraire optimisé, choix justifiés','5'],['Bon itinéraire, 1–2 détours','4'],['Plusieurs allers-retours','2–3'],['Au hasard','1']] },
        bilan: { hint: "Tracé + analyse des erreurs + amélioration proposée", table: [['Tracé exact, analyse et amélioration proposée','3'],['Tracé + analyse','2'],['Tracé partiel','1'],['Absent','0']] }
      }
    }
  },

  lutte: {
    '6e': { epreuve: "Tournoi 1 × 2 min : déséquilibrer et amener au sol en sécurité." },
    '5e': {
      ca_texte: "Déséquilibrer et amener son adversaire au sol en sécurité. Arbitrer un combat simple.",
      crit: {
        tech: { table: [['Saisit et tire ou pousse pour déséquilibrer','2/2'],['Amène au sol en accompagnant','2/2'],['Maintient au sol 3 s','2/2']] }
      }
    },
    '4e': {},
    '3e': {
      ca_texte: "Enchaîner déséquilibre, projection et contrôle en choisissant le bon moment. Arbitrer et conseiller un lutteur.",
      crit: {
        tech: { table: [['Enchaîne feinte ou déséquilibre puis projection','2/2'],['Projection technique, adversaire accompagné','2/2'],['Retournement ou contrôle au sol 3 s','2/2']] },
        arb: { table: [['Points corrects, litiges gérés, conseil donné','3'],['Points corrects','2'],['Hésitant','1'],['Refuse','0']] }
      }
    }
  },

  combine: {
    '6e': { epreuve: "Combiné : 30 m départ arrêté + 5 bonds sur herbe + lancer de vortex (si le vortex n'est pas fait : NE). 2 essais par épreuve, meilleur retenu." },
    '5e': {
      ca_texte: "Réaliser un combiné course + bonds + lancer et annoncer son total avant l'épreuve. Juger et mesurer.",
      epreuve: "Combiné : 40 m + 5 bonds sur herbe + vortex. Total de points annoncé avant l'épreuve.",
      crit: {
        course: { table: [['< 6,4 s','5'],['6,4–6,9 s','4'],['6,9–7,4 s','3'],['7,4–8 s','2'],['> 8 s','1']] },
        saut: { table: [['≥ 10,5 m','5'],['9,5–10,5 m','4'],['8,5–9,5 m','3'],['7,5–8,5 m','2'],['< 7,5 m','1']] },
        lancer: { table: [['≥ 33 m','5'],['27–33 m','4'],['21–27 m','3'],['15–21 m','2'],['< 15 m','1']] }
      }
    },
    '4e': {},
    '3e': {
      ca_texte: "Planifier son combiné (où gagner des points), le réaliser et analyser l'écart avec son projet.",
      epreuve: "Combiné : 40 m + 5 bonds sur herbe + vortex. Projet de total annoncé et justifié.",
      crit: {
        course: { table: [['< 6 s','5'],['6–6,5 s','4'],['6,5–7 s','3'],['7–7,6 s','2'],['> 7,6 s','1']] },
        saut: { table: [['≥ 11,5 m','5'],['10,5–11,5 m','4'],['9,5–10,5 m','3'],['8,5–9,5 m','2'],['< 8,5 m','1']] },
        lancer: { table: [['≥ 40 m','5'],['33–40 m','4'],['27–33 m','3'],['20–27 m','2'],['< 20 m','1']] }
      }
    }
  }
};

// Barème effectif d'une APSA pour une classe : critères du cycle + exigences de la classe.
function baremeNiveau(s, cl){
  const cyc = cl==='6e' ? 'c3' : 'c4';
  const base = s[cyc];
  if(!base) return null;
  const n = (NIVEAUX[s.id] && NIVEAUX[s.id][cl]) || {};
  const crit = n.crit || {};
  return {
    cycle: cyc, classe: cl,
    seances: n.seances || base.seances,
    ca_texte: n.ca_texte || base.ca_texte,
    epreuve: n.epreuve || base.epreuve || '',
    criteres: base.criteres.map(c => crit[c.id] ? Object.assign({}, c, crit[c.id]) : c)
  };
}
