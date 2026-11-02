// Situations pratiques proposées dans le déroulé horaire des séances (exemples, à adapter).
// Chaque situation : k = mots du thème de séance qui l'appellent (sans accents, minuscules),
// p = phase où elle sert par défaut ('diag' 1re séance, 'appr' apprentissage, 'eval' évaluation),
// n = nom, o = organisation, c = consigne, r = critère de réussite, v = variante (simplifier / complexifier).
const SITUATIONS = {
  relais: [
    { k:/decouverte|regle/, p:'diag', n:"Relais navette avec témoin", o:"4 équipes de 4, couloirs de 30 m balisés par des plots, 2 coureurs à chaque bout.", c:"Courir jusqu'au partenaire en face et lui donner le témoin dans la main, sans le lancer.", r:"Aucun témoin tombé sur 2 tours.", v:"Plus simple : en trottinant. Plus dur : 40 m et passage main droite → main gauche imposé." },
    { k:/arret/, p:'appr', n:"Transmission à l'arrêt en colonne", o:"Colonnes de 4 élèves, 1,5 m entre chacun. Le témoin remonte la colonne de l'arrière vers l'avant.", c:"Au « hop » du donneur, le receveur tend le bras en arrière, paume ouverte vers le haut, sans se retourner. Donneur main droite, receveur main gauche.", r:"5 transmissions de suite sans regarder le témoin.", v:"En marchant, puis en trottinant." },
    { k:/mouvement|marque/, p:'appr', n:"Prise de marque au sol", o:"Binômes sur 30 m. Le receveur pose un plot à 5 pieds devant sa position de départ.", c:"Le receveur part à fond quand le donneur touche le plot. Le donneur crie « hop » quand il peut toucher la main.", r:"Le donneur ne ralentit pas et la transmission se fait dans les 10 m après le départ du receveur.", v:"Reculer ou avancer le plot d'un pied selon que le donneur rattrape trop ou pas assez." },
    { k:/zone|synchronisation/, p:'appr', n:"Zone de transmission de 20 m", o:"Sur le côté de la piste : zone de 20 m balisée en couleur. Binômes, 2 essais chacun, un observateur par zone.", c:"Transmettre le témoin dans la zone, à pleine vitesse. L'observateur dit si c'est dans la zone et si le receveur est parti trop tôt ou trop tard.", r:"2 transmissions sur 2 dans la zone, sans arrêt du receveur.", v:"Chronométrer le 40 m en binôme et comparer avec la somme des deux 20 m." },
    { k:/equipe|strategie|ordre/, p:'appr', n:"Tester 2 ordres de passage", o:"Équipes de 4 sur 4 × 60 m (moitié de piste). 1 chronométreur et 1 observateur par équipe.", c:"Courir avec l'ordre A, puis avec l'ordre B. Garder le meilleur et dire pourquoi (meilleur départ, meilleur finisseur, meilleures transmissions).", r:"L'équipe choisit son ordre en le justifiant avec les chronos.", v:"Imposer un ordre aux équipes qui hésitent ; distance réelle 4 × 120 m pour les plus avancées." },
    { k:/chronometre|tournoi|course relais/, p:'appr', n:"Relais 4 × 120 m chronométré", o:"Une équipe court, une équipe juge (zones, chrono). On inverse.", c:"3 essais, meilleur temps retenu. Les juges notent les transmissions hors zone.", r:"Battre le temps de la séance précédente.", v:"Handicap de départ pour équilibrer les équipes." },
    { k:/evaluation|evalue/, p:'eval', n:"Épreuve du relais", o:"Équipes de 4, 3 essais. Rôles tournants : chronométreur, juges de zone, secrétaire.", c:"Réaliser le meilleur temps en restant dans les zones. Chaque juge remplit sa fiche.", r:"Barème du relais (temps, régularité et règles, rôle).", v:"" },
  ],
  'course-longue': [
    { k:/decouverte|echauffement/, p:'diag', n:"8 minutes à allure de conversation", o:"Piste de 120 m, plots tous les 20 m. Par groupes de 3.", c:"Courir 8 minutes en pouvant parler avec son voisin. Si on n'arrive plus à parler, on ralentit.", r:"8 minutes sans marcher, en parlant.", v:"Plus simple : 2 × 4 min avec 1 min de marche. Plus dur : 10 min." },
    { k:/sans s'arreter|sans s arreter|courir 8|duree/, p:'appr', n:"Course en durée progressive", o:"Piste de 120 m. 3 blocs : 4 min, 6 min, 8 min, avec 1 min de marche entre chaque.", c:"Garder la même allure sur les 3 blocs.", r:"Tours identiques à 1 tour près sur chaque bloc ramené à 4 min.", v:"Faire varier la durée des blocs selon le niveau du groupe." },
    { k:/allure|reguliere|fractionne/, p:'appr', n:"Course au sifflet", o:"Plots tous les 20 m sur la piste. Coup de sifflet toutes les 7,5 s (≈ 9,6 km/h) ou toutes les 6,5 s (≈ 11 km/h) selon le groupe.", c:"Être à hauteur d'un plot à chaque coup de sifflet, ni avant ni après.", r:"8 sifflets de suite à hauteur du plot.", v:"Changer de groupe d'allure après 3 min réussies." },
    { k:/vma|vitesse repere|test/, p:'appr', n:"Demi-Cooper (6 minutes)", o:"Binômes coureur / observateur. Piste de 120 m, plots tous les 20 m.", c:"Parcourir la plus grande distance en 6 min. L'observateur compte les tours et pose un plot au sifflet final.", r:"VMA = distance ÷ 100 (ex. 1 120 m → 11,2 km/h).", v:"Annoncer le temps toutes les minutes pour éviter les départs trop rapides." },
    { k:/projet|individuel/, p:'appr', n:"Contrat de tours", o:"Binômes coureur / observateur. Fiche de passages.", c:"Annoncer le nombre de tours en 6 min, puis courir. L'observateur note les tours et l'écart.", r:"Écart de moins d'un demi-tour entre l'annonce et la réalité.", v:"3 × 4 min avec 1 min de récupération, même contrat à chaque fois." },
    { k:/binome|allure imposee/, p:'appr', n:"Lièvre et suiveur", o:"Binômes de même niveau. Plots tous les 20 m.", c:"Le lièvre mène 2 min à l'allure prévue, le suiveur reste derrière. On inverse.", r:"Même nombre de plots passés sur chaque bloc de 2 min.", v:"Le suiveur ferme les yeux sur le chrono et annonce son allure à la fin." },
    { k:/bilan|compar|evaluation/, p:'eval', n:"Course bilan", o:"Binômes coureur / observateur, fiche de passages.", c:"Courir la durée de l'épreuve à l'allure projet. L'observateur note les temps de passage.", r:"Barème de la course longue.", v:"" },
  ],
  'demi-fond': [
    { k:/vma|test/, p:'diag', n:"Demi-Cooper (6 minutes)", o:"Binômes coureur / observateur. Piste de 120 m, plots tous les 20 m.", c:"Parcourir la plus grande distance en 6 min. L'observateur pose un plot au sifflet final.", r:"VMA = distance ÷ 100. Chacun repart avec sa VMA notée.", v:"Annoncer le temps chaque minute." },
    { k:/fractionne|%|pourcent/, p:'appr', n:"30-30 à 100 % de VMA", o:"Plots de couleur posés à la distance à atteindre en 30 s : VMA × 8,3 m (ex. 11 km/h → 92 m).", c:"30 s de course pour atteindre son plot, 30 s de marche retour. 2 séries de 6.", r:"Atteindre son plot sur au moins 5 répétitions sur 6.", v:"Passer au plot suivant si c'est trop facile." },
    { k:/2 allures|deux allures|allures differentes/, p:'appr', n:"3 min à 80 % puis 3 min à 90 %", o:"Distances repères : VMA × 40 m à 80 % et VMA × 45 m à 90 % (voir le mémo VMA).", c:"Courir 3 min à 80 %, récupérer 2 min, puis 3 min à 90 %. L'observateur note la distance.", r:"Écart de moins de 30 m avec la distance visée à chaque course.", v:"Ajouter 3 min à 100 % (VMA × 50 m) pour les plus avancés." },
    { k:/projet|ajuster/, p:'appr', n:"Projet à 3 allures", o:"Fiche des 3 allures : distances visées calculées depuis la VMA.", c:"Annoncer ses 3 distances, courir 3 × 3 min avec 2 min de récupération.", r:"2 distances sur 3 tenues à moins de 30 m.", v:"Après la 1re course, l'élève peut ajuster ses deux autres annonces." },
    { k:/binome|observateur/, p:'appr', n:"Coureur et observateur", o:"Binômes. L'observateur note le plot atteint toutes les 30 s.", c:"Le coureur garde une allure régulière ; l'observateur lui annonce « en avance » ou « en retard ».", r:"Écart régulier entre chaque relevé de 30 s.", v:"Le coureur court sans montre et doit sentir son allure." },
    { k:/bilan|evaluation/, p:'eval', n:"Course bilan à 3 allures", o:"Binômes coureur / observateur, fiche des 3 allures.", c:"Réaliser son projet de 3 courses. L'observateur relève les distances.", r:"Barème du demi-fond.", v:"" },
  ],
  sprint: [
    { k:/decouverte|reaction|depart/, p:'diag', n:"Départs au signal", o:"Lignes de 4 élèves, 15 m de course. Positions de départ variées : assis, à genoux, dos à la course.", c:"Partir au signal sonore le plus vite possible et franchir la ligne d'arrivée.", r:"Être dans les 2 premiers 2 fois sur 4.", v:"Signal visuel (bras levé) pour travailler l'attention." },
    { k:/vitesse|frequence|acceleration/, p:'appr', n:"Course poursuite", o:"Binômes, le 2e part 2 m derrière. 30 m de course.", c:"Celui de derrière doit toucher le dos de celui de devant avant la ligne.", r:"Le poursuivi garde son avance sur 30 m.", v:"Ajuster l'écart (1 à 3 m) selon les binômes." },
    { k:/chrono|evaluation/, p:'eval', n:"Sprint chronométré", o:"Binômes coureur / chronométreur, 2 essais.", c:"Réaliser le meilleur temps sur la distance de l'épreuve.", r:"Barème du sprint.", v:"" },
  ],
  combine: [
    { k:/decouverte|securite|role/, p:'diag', n:"Ateliers de découverte des 3 épreuves", o:"3 ateliers tournants (course, bonds, lancer), 8 min chacun. 1 juge et 1 secrétaire par atelier.", c:"Essayer chaque épreuve 2 fois et noter sa performance sur la fiche.", r:"Fiche remplie pour les 3 épreuves.", v:"Au lancer : les lanceurs sont alignés, on ramasse seulement au signal." },
    { k:/course|depart|30 m|acceleration/, p:'appr', n:"Départ arrêté et 30 m chronométré", o:"Binômes coureur / chronométreur. 30 m en 6e, 40 m en 4e.", c:"Départ pied avant derrière la ligne, le chrono part au premier mouvement. 2 essais.", r:"Améliorer son temps au 2e essai.", v:"Départ en course poursuite pour les élèves qui partent lentement." },
    { k:/bond|rythme|marque/, p:'appr', n:"La rivière des 5 bonds", o:"Plots ou cerceaux posés à des écarts croissants. Herbe ou piste, bande graduée tous les 50 cm.", c:"Enchaîner 5 bonds alternés sans s'arrêter, du départ pieds joints à la réception à deux pieds.", r:"5 bonds sans pause, réception équilibrée.", v:"Écarter les cerceaux de 10 cm quand c'est réussi." },
    { k:/vortex|lancer|trajectoire/, p:'appr', n:"Lancer au-dessus de la corde", o:"Corde ou élastique tendu à 2 m de haut, zones au sol à 5, 10, 15 et 20 m. Vortex, ou balle de tennis en attendant.", c:"Élan de 3 pas, bras armé derrière, lancer par-dessus la corde. On ramasse seulement au signal.", r:"Passer au-dessus de la corde et atteindre la zone visée 2 fois sur 3.", v:"Monter la corde pour travailler la trajectoire." },
    { k:/ateliers|strategie|points|blanc|reglage/, p:'appr', n:"Annoncer son total", o:"3 ateliers tournants, fiche de performances et table de points.", c:"Annoncer son total avant de passer, réaliser les 3 épreuves, comparer.", r:"Écart de moins de 2 points entre l'annonce et le total.", v:"Choisir l'épreuve où l'on fait un 3e essai." },
    { k:/evalue|evaluation/, p:'eval', n:"Combiné évalué", o:"3 ateliers, rôles tournants : athlète, juge, chronométreur, secrétaire.", c:"Réaliser les 3 épreuves. Chacun tient son rôle seul.", r:"Barème du combiné (épreuves, projet, rôle).", v:"" },
  ],
  basket: [
    { k:/decouverte|regle/, p:'diag', n:"10 passes en 4 contre 4", o:"Demi-terrain, équipes de 4, chasubles.", c:"Faire 10 passes sans perdre le ballon. Pas le droit de marcher avec le ballon.", r:"10 passes réussies au moins une fois par équipe.", v:"Plus simple : 4 contre 2. Plus dur : interdire de rendre au passeur." },
    { k:/passe|demarquage/, p:'appr', n:"Passe et va en triangle", o:"Groupes de 3 en triangle à 4 m. Puis 3 contre 1 dans un carré.", c:"Passer et aller remplacer celui à qui on a passé. En 3 contre 1 : se démarquer pour offrir une solution.", r:"10 passes de suite sans interception.", v:"Passe à terre ou passe à deux mains imposée." },
    { k:/dribble|protection|deplacement/, p:'appr', n:"Voleurs de ballons", o:"Rond central ou zone de 10 × 10 m. Chacun a un ballon, 2 voleurs sans ballon.", c:"Dribbler en protégeant le ballon avec le corps. Les voleurs essaient de le sortir de la zone.", r:"Garder son ballon 1 minute.", v:"Main faible imposée, ou plus de voleurs." },
    { k:/tir en course/, p:'appr', n:"Tir en course en 2 colonnes", o:"2 colonnes à 45° du panier, une avec ballon, une sans.", c:"Dribble, 2 appuis (droite-gauche à droite), tir contre la planche. Le rebondeur passe à la colonne suivante.", r:"3 paniers sur 5 essais.", v:"Concours : 1 point planche touchée, 2 points panier." },
    { k:/jeu|match|conservation|mini/, p:'appr', n:"3 contre 3 sur demi-terrain", o:"Demi-terrain, équipes de 3, un panier.", c:"Marquer après au moins 3 passes. On reprend au milieu après chaque panier.", r:"Au moins un panier après 3 passes par match.", v:"Panier après passe décisive = 2 points." },
    { k:/contre-attaque|contre attaque/, p:'appr', n:"2 contre 1 puis 3 contre 2", o:"Tout le terrain, vagues continues.", c:"Les attaquants doivent tirer en moins de 3 passes, avant que les défenseurs se replacent.", r:"Tir en moins de 8 secondes.", v:"Un défenseur part en retard pour aider l'attaque." },
    { k:/placee|lecture/, p:'appr', n:"4 contre 4 « passe et coupe »", o:"Demi-terrain, équipes de 4.", c:"Après une passe, couper vers le panier pour recevoir. Pas de dribble de plus de 3 rebonds.", r:"Un tir près du panier par attaque.", v:"Interdire le dribble pour les plus avancés." },
    { k:/tournoi|evaluation/, p:'eval', n:"Tournoi 4 contre 4", o:"Matchs de 6 min, équipes qui arbitrent et qui observent.", c:"Jouer, arbitrer et observer avec la fiche.", r:"Barème du basket.", v:"" },
  ],
  football: [
    { k:/decouverte|regle/, p:'diag', n:"Conservation à 4 contre 2", o:"Carré de 15 × 15 m.", c:"Faire 6 passes sans perdre le ballon. Les 2 défenseurs changent après une récupération.", r:"6 passes réussies.", v:"Agrandir ou réduire le carré." },
    { k:/conduite|dribble/, p:'appr', n:"Conduite et slalom", o:"Colonnes de 4, slalom de 6 plots puis frappe dans un petit but.", c:"Conduire le ballon près du pied, intérieur et extérieur.", r:"Slalom sans toucher de plot, ballon toujours à moins d'un pas.", v:"Course en relais entre colonnes." },
    { k:/passe|tir|jeu|match|tournoi/, p:'appr', n:"Match à 4 contre 4 sur petit terrain", o:"Petits terrains, buts sans gardien.", c:"Marquer après au moins 3 passes.", r:"Un but après 3 passes par match.", v:"Joker qui joue toujours avec l'équipe qui a le ballon." },
    { k:/evaluation/, p:'eval', n:"Tournoi", o:"Matchs courts, équipes qui arbitrent et qui observent.", c:"Jouer, arbitrer et observer.", r:"Barème du football.", v:"" },
  ],
  ultimate: [
    { k:/decouverte|prise en main|lancer|lancers|revers|coup droit/, p:'diag', n:"Passes à deux", o:"Binômes face à face à 5 m, puis 10 m.", c:"Revers puis coup droit. Réception à deux mains en « crocodile ».", r:"10 passes de suite sans chute.", v:"Reculer d'un pas après 5 réussites." },
    { k:/demarqu|recevoir|mouvement/, p:'appr', n:"4 contre 2 dans un carré", o:"Carré de 15 × 15 m.", c:"Le porteur ne bouge pas, les autres se démarquent. 10 passes = 1 point.", r:"5 passes de suite au moins une fois.", v:"Compte de 10 secondes du défenseur sur le porteur." },
    { k:/en-but|en but|progress|couloir|3v3|reduit/, p:'appr', n:"3 contre 3 avec en-buts", o:"Terrain de 25 × 15 m, en-buts de 4 m.", c:"Marquer en attrapant le disque dans l'en-but. Disque au sol = changement de possession.", r:"Un point marqué par équipe.", v:"Passe obligatoire vers l'avant pour les plus avancés." },
    { k:/defense|interception|transition|replacement/, p:'appr', n:"Défense individuelle", o:"Jeu à 4 contre 4, chaque défenseur suit un attaquant.", c:"Rester entre son attaquant et l'en-but. Le marqueur compte jusqu'à 10 à voix haute.", r:"2 interceptions par match.", v:"Défense de zone pour les plus avancés." },
    { k:/tournoi|spirit|arbitrage/, p:'appr', n:"Mini-tournoi auto-arbitré", o:"Matchs de 6 min, 5 contre 5. Une équipe observe.", c:"Jouer sans arbitre : on annonce ses fautes. Cercle de fin de match.", r:"Aucun litige non réglé.", v:"Note de « spirit » donnée à l'adversaire." },
    { k:/evaluation|final/, p:'eval', n:"Tournoi final", o:"Matchs de 6 min, équipes qui observent et notent le spirit.", c:"Jouer, s'auto-arbitrer et observer.", r:"Barème de l'ultimate.", v:"" },
  ],
  'ballon-prisonnier': [
    { k:/decouverte|lancer|precision/, p:'diag', n:"Chamboule-tout", o:"Plots ou quilles alignés à 8 m. 2 équipes face à face.", c:"Faire tomber les plots adverses avec des lancers à une main.", r:"3 plots tombés par lancer réussi sur 5.", v:"Reculer la ligne de lancer." },
    { k:/esquive|deplacement/, p:'appr', n:"Balle aux chasseurs", o:"Demi-terrain, 3 chasseurs avec 2 ballons.", c:"Les chasseurs se passent le ballon pour toucher les autres sous la taille. Touché = devient chasseur.", r:"Rester le dernier ou survivre 1 minute.", v:"Un seul ballon pour faciliter l'esquive." },
    { k:/organisation|role|strategie|liberation|tournoi/, p:'appr', n:"Ballon prisonnier à 2 ballons", o:"Terrain de volley, 2 équipes de 8, 2 ballons.", c:"Se répartir les rôles : lanceurs devant, passeurs vers les prisonniers.", r:"Libérer au moins 2 prisonniers par manche.", v:"Prisonnier libéré en attrapant un ballon de volée." },
  ],
  rugby: [
    { k:/decouverte|manipulation|ovale/, p:'diag', n:"Béret ovale", o:"2 équipes face à face, ballon au milieu, élèves numérotés.", c:"Au numéro, ramener le ballon dans son camp sans être touché.", r:"Ramener le ballon 2 fois.", v:"Appeler 2 numéros : 2 contre 2." },
    { k:/passe|progression/, p:'appr', n:"Passes en arrière en courant", o:"Groupes de 3 en ligne, couloir de 30 m.", c:"Avancer en se passant le ballon vers l'arrière. Interdit de le passer devant.", r:"Traverser le couloir avec 4 passes sans en-avant.", v:"Ajouter un défenseur passif." },
    { k:/toucher|plaquage|hors-jeu|hors jeu/, p:'appr', n:"Rugby toucher à 4 contre 4", o:"Terrain de 30 × 20 m. Toucher à deux mains = arrêt et passe.", c:"Marquer en aplatissant derrière la ligne. Après 4 touchers, le ballon change de camp.", r:"Un essai par équipe.", v:"Ceinture à flag pour éviter les contestations." },
    { k:/surnombre|jeu a 3|soutien/, p:'appr', n:"2 contre 1 puis 3 contre 2 en couloir", o:"Couloir de 10 m de large.", c:"Fixer le défenseur puis passer au partenaire libre au bon moment.", r:"Essai marqué 3 fois sur 5.", v:"Le défenseur démarre plus près." },
    { k:/defense|ligne|replacement/, p:'appr', n:"Défense en ligne", o:"3 défenseurs contre 4 attaquants, 20 m de large.", c:"Monter ensemble en gardant la ligne, chacun son vis-à-vis.", r:"Empêcher l'essai 2 fois sur 4.", v:"Ajouter un 4e défenseur." },
    { k:/tournoi|evaluation/, p:'eval', n:"Tournoi 5 contre 5", o:"Matchs de 6 min, équipes qui arbitrent et observent.", c:"Jouer, arbitrer et observer.", r:"Barème du rugby.", v:"" },
  ],
  badminton: [
    { k:/decouverte|prise en main|service|mise en jeu/, p:'diag', n:"Service dans les cerceaux", o:"4 terrains maximum, 2 cerceaux par demi-terrain (fond et devant).", c:"Servir dans le cerceau du fond (service long) puis devant (service court).", r:"3 services sur 5 dans le bon cerceau.", v:"Agrandir la cible avec des plots." },
    { k:/clear|frappe longue|longue|fond/, p:'appr', n:"Tenir le fond de court", o:"Par 2 sur un demi-terrain, zone arrière de 1 m marquée au sol.", c:"Échanger en envoyant le volant dans la zone arrière adverse.", r:"5 volants de suite dans la zone arrière.", v:"Un joueur fait long, l'autre fait court." },
    { k:/amorti|courte|smash/, p:'appr', n:"Long, puis court", o:"Par 2. Zone avant de 1,5 m derrière le filet.", c:"Envoyer l'adversaire au fond, puis faire tomber le volant dans la zone avant.", r:"Gagner le point en 2 frappes 3 fois sur 5.", v:"Le smash est autorisé quand le volant arrive haut et court." },
    { k:/replacement|deplacement/, p:'appr', n:"Retour au plot central", o:"Plot au centre du demi-terrain. Un lanceur, un joueur.", c:"Après chaque frappe, revenir toucher le plot avec le pied avant la frappe suivante.", r:"8 frappes de suite avec retour au plot.", v:"Le lanceur accélère le rythme." },
    { k:/echange|construire|point|tour du monde|match/, p:'appr', n:"Montante-descendante", o:"4 terrains maximum, matchs de 3 min. Gagnant monte, perdant descend.", c:"Gagner le point en déplaçant l'adversaire (long, court, côtés).", r:"Monter d'au moins un terrain.", v:"Le service compte double pour l'équipe qui monte." },
    { k:/double/, p:'appr', n:"Double côte à côte", o:"2 contre 2 sur un terrain.", c:"En défense, côte à côte. Celui qui frappe annonce « à moi ».", r:"Aucun volant tombé entre les deux joueurs.", v:"Passer à avant-arrière en attaque." },
    { k:/tournoi|evaluation/, p:'eval', n:"Tournoi par terrains", o:"4 terrains maximum, matchs chronométrés, arbitre et observateur à chaque terrain.", c:"Jouer, arbitrer, observer avec la fiche.", r:"Barème du badminton (terrain atteint, technique, arbitrage).", v:"" },
  ],
  'tennis-table': [
    { k:/decouverte|service|regle/, p:'diag', n:"Service dans la cible", o:"4 tables maximum, gobelet ou feuille posée sur la moitié adverse.", c:"Servir en faisant rebondir la balle de son côté puis du côté adverse, en visant la cible.", r:"3 services réglementaires sur 5.", v:"Viser le coin coup droit puis revers." },
    { k:/regularite|echange/, p:'appr', n:"10 échanges", o:"Par 2 à chaque table.", c:"Échanger en coup droit sans faute, puis en revers.", r:"10 échanges de suite.", v:"Imposer la diagonale." },
    { k:/variete|effet|direction|rythme/, p:'appr', n:"Viser les coins", o:"2 feuilles posées dans les coins de la table adverse.", c:"Alterner une balle à gauche, une balle à droite.", r:"5 balles de suite dans le bon coin.", v:"Le partenaire bloque toutes les balles au centre." },
    { k:/tournoi|match|evaluation/, p:'eval', n:"Montante-descendante", o:"4 tables maximum, matchs de 3 min, un arbitre par table.", c:"Gagnant monte, perdant descend. L'arbitre compte les points et le service.", r:"Barème du tennis de table.", v:"" },
  ],
  acrosport: [
    { k:/decouverte|figure|securite/, p:'diag', n:"Figures à 2 sur fiche", o:"Tapis, groupes de 3 (porteur, voltigeur, pareur), fiche de figures de niveau 1.", c:"Réaliser 3 figures de la fiche et les tenir 3 secondes, le pareur en place.", r:"3 figures tenues 3 s en sécurité.", v:"Passer aux figures de niveau 2 quand les 3 sont réussies." },
    { k:/parade|montee|descente/, p:'appr', n:"Monter et descendre en sécurité", o:"Groupes de 3 sur tapis.", c:"Monter sur les zones sûres (bassin, haut des cuisses), descendre en arrière accompagné par le pareur.", r:"Montée et descente sans saut ni chute.", v:"Le pareur annonce « je suis prêt » avant chaque montée." },
    { k:/enchainement|liaison|compte|synchron|composition/, p:'appr', n:"Enchaînement au compte de 8", o:"Groupes de 3 ou 4. Pas de musique : on compte à voix haute.", c:"Relier 3 figures par des liaisons (roulade, déplacement) au compte de 8, début et fin marqués.", r:"Enchaînement réalisé 2 fois de suite sans arrêt.", v:"Ajouter une figure dynamique." },
    { k:/jug|presentation|film|video/, p:'appr', n:"Présenter et juger", o:"Un groupe présente, un groupe juge avec la fiche de juge (tenue 3 s, parade, liaisons). Tablette si disponible.", c:"Présenter l'enchaînement. Les juges notent puis donnent un conseil.", r:"Le groupe améliore un point noté par les juges au passage suivant.", v:"En 3e : filmer, revoir et modifier une figure ou une liaison." },
    { k:/evaluation/, p:'eval', n:"Présentation évaluée", o:"Chaque groupe passe devant la classe, un groupe juge en parallèle.", c:"Présenter l'enchaînement, tenir son rôle de juge.", r:"Barème de l'acrosport (figures, exécution, sécurité, juge).", v:"" },
  ],
  renfo: [
    { k:/decouverte|technique|base/, p:'diag', n:"Postures en binôme correcteur", o:"Binômes, 4 ateliers : gainage, pompes, squats, abdos.", c:"L'un fait 30 s, l'autre corrige la posture avec la fiche (dos plat, genoux, nuque).", r:"Posture correcte sur les 4 exercices.", v:"Version facile : pompes sur les genoux, gainage sur les genoux." },
    { k:/test|repere/, p:'appr', n:"Test de repères", o:"Binômes, fiche de résultats.", c:"Maximum de répétitions correctes en 30 s, et tenue maximale en gainage.", r:"Résultats notés pour chaque exercice.", v:"" },
    { k:/programme|construction/, p:'appr', n:"Construire son circuit", o:"Groupes de 3, cartes d'exercices.", c:"Choisir 6 exercices : 2 haut du corps, 2 bas du corps, 2 tout le corps.", r:"Circuit équilibré et réalisable en sécurité.", v:"Ajouter une intensité (temps ou répétitions) par exercice." },
    { k:/circuit|autonomie/, p:'appr', n:"Circuit 30 / 30", o:"6 ateliers, 30 s de travail, 30 s de récupération.", c:"Réaliser le circuit 2 fois. Le binôme vérifie la posture.", r:"Posture correcte jusqu'à la fin du circuit.", v:"40 s / 20 s pour les plus avancés." },
    { k:/evalue|evaluation/, p:'eval', n:"Circuit évalué", o:"Binômes exécutant / observateur, fiche du circuit.", c:"Réaliser son circuit, l'observateur note les postures.", r:"Barème du renfo.", v:"" },
  ],
  'course-orientation': [
    { k:/carte|legende/, p:'diag', n:"Orienter la carte", o:"Cour du collège, plan simplifié. 8 plots posés par l'enseignant.", c:"Tourner la carte pour qu'elle corresponde au terrain, puis aller au plot montré.", r:"5 plots trouvés sur 8 en 10 min.", v:"Par 2 au début, seul ensuite." },
    { k:/plot|cour|repere|plan/, p:'appr', n:"Relais mémoire", o:"Plan de la cour au départ, équipes de 3.", c:"Regarder la position d'un plot sur le plan, aller le chercher sans le plan, revenir.", r:"Tous les plots trouvés par l'équipe.", v:"Chercher 2 plots par aller." },
    { k:/cache|itineraire|recherche/, p:'appr', n:"Parcours en étoile", o:"Balises autour d'un point central, chaque équipe part avec sa carte.", c:"Aller à une balise, revenir au centre, en prendre une autre.", r:"6 balises justes en 15 min.", v:"Balises plus loin du centre." },
    { k:/baton|pose|parc|decouverte des lieux/, p:'appr', n:"Poser pour les autres", o:"Équipes de 3 dans le parc, bâtons ou plots à poser.", c:"Poser ses bâtons et les placer précisément sur la carte. Une autre équipe doit les retrouver.", r:"L'autre équipe retrouve tous les bâtons.", v:"Imposer des postes plus éloignés." },
    { k:/meons|site/, p:'appr', n:"Course au score", o:"Parc de Méons, balises numérotées avec des points.", c:"Trouver le plus de balises en 30 min, retour à l'heure obligatoire.", r:"Retour à l'heure avec au moins la moitié des balises.", v:"Pénalité d'1 balise par minute de retard." },
    { k:/evaluation/, p:'eval', n:"Course d'orientation évaluée", o:"Parcours au score, durée fixée, heure de retour.", c:"Trouver un maximum de balises et revenir à l'heure.", r:"Barème de la course d'orientation.", v:"" },
  ],
  lutte: [
    { k:/decouverte|securite|saisie/, p:'diag', n:"Sumo à genoux", o:"Cercle de 3 m sur tapis, binômes de même gabarit.", c:"À genoux, sortir l'autre du cercle en poussant. Interdit de frapper ou de tirer les vêtements.", r:"Gagner 2 manches sur 3.", v:"Debout pour les plus avancés." },
    { k:/desequilibre|debout/, p:'appr', n:"Tirer-pousser", o:"Binômes debout, saisie bras-épaule.", c:"Faire poser un genou au sol à l'autre en le tirant puis en le poussant.", r:"Déséquilibrer 2 fois en 1 min.", v:"Imposer une seule saisie." },
    { k:/amener au sol|au sol|controle|immobilis/, p:'appr', n:"Retourner la tortue", o:"Binômes au sol, l'un à 4 pattes, l'autre à côté.", c:"Retourner la tortue sur le dos et la tenir 3 s.", r:"Immobiliser 3 s en 30 s.", v:"La tortue résiste davantage." },
    { k:/enchainement|tournoi|gabarit/, p:'appr', n:"Combats à thème", o:"Combats de 1 min par gabarit, un arbitre par combat.", c:"Marquer en enchaînant déséquilibre puis immobilisation.", r:"Un point marqué par combat.", v:"Points bonus pour l'enchaînement." },
    { k:/evaluation/, p:'eval', n:"Tournoi par gabarit", o:"Poules par gabarit, arbitres et juges.", c:"Combattre, arbitrer et juger.", r:"Barème de la lutte.", v:"" },
  ],
};

// Normalise un thème de séance pour la recherche (minuscules, sans accents).
function sitNorm(t){ return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }

// Choisit 1 ou 2 situations pour une séance (titre = thème, type = diag / appr / revision / eval, i = rang de la séance).
function situationsSeance(sportId, titre, type, i){
  const lib = SITUATIONS[sportId]; if(!lib || !lib.length) return [];
  const t = sitNorm(titre);
  if(type==='eval' || type==='revision') return lib.filter(s=>s.p==='eval').slice(0,1);
  const pool = lib.filter(s=>s.p!=='eval');
  const choix = pool.filter(s=>s.k.test(t));
  const phase = type==='diag' ? 'diag' : 'appr';
  const reste = pool.filter(s=>!choix.includes(s));
  const meme = reste.filter(s=>s.p===phase), autres = reste.filter(s=>s.p!==phase);
  const ordre = meme.concat(autres);
  // Pas de correspondance : on fait tourner les situations d'une séance à l'autre.
  const dec = ordre.length ? (i||0) % ordre.length : 0;
  const tourne = ordre.slice(dec).concat(ordre.slice(0,dec));
  return choix.concat(tourne).slice(0,2);
}
