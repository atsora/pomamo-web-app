// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

//var ATSORA_CATALOG = ATSORA_CATALOG || {};
// If do not exists, it IS an error. The file translation_pusecomponent_default.js is not included ?

ATSORA_LOCALE_CATALOG.fr.options = {
  title: 'Options',
  alarmsUnknown: 'montrer les alarmes inconnues',
  alarmsWithDetails: "avec détails d'alarmes",
  currentDataSelection: 'Courantes...',
  displayShift: "Afficher l'équipe",
  displayUtilization: "Afficher l'utilisation",
  highlightPartCount: 'Mettre en avant le nombre de pièces',
  resetButton: 'remise à zéro',
  showAlarms: 'Afficher les alarmes',
  showBar: 'Afficher la barre',
  showClock: "Afficher l'horloge",
  showCurrentAlarm: "Afficher l'alarme courante",
  showNcProgram: "Afficher le programme d'usinage",
  showOperation: "Afficher l'opération",
  showPartCount: "Afficher le nombre de pièces",
  showPartCountInPie: "Afficher le nombre de pièces dans le graphique",
  showPercent: "Afficher le pourcentage",
  showPie: "Afficher le graphique",
  showRemainingCycles: "Afficher le nombre de cycles restants",
  showReserveCapacity: "Afficher la capacité de réserve",
  showSecondUtilizationBar: "Afficher la seconde barre d'utilisation",
  showStackLights: "Afficher la verrine lumineuse",
  showUtilizationBar: "Afficher la barre d'utilisation des machines",
  showUtilizationTarget: "Afficher l'objectif d'utilisation",
  sizeBig: "Grand",
  sizeSmall: "Petit",
  timeFrameDays: "Jour(s)",
  timeFrameHours: 'Heure(s)',
  timeFrameSelection: 'Période : ',
  thresholdOrange: 'Orange',
  thresholdRed: 'Rouge',
  toolsExpiring: 'Outils expirés'
}

ATSORA_LOCALE_CATALOG.fr.parameters = {
  columns: 'Colonnes',
  copyUrl: "Copier l'URL",
  customTitle: 'Titre personnalisé',
  darkTheme: 'Thème sombre',
  displayUrl: "Afficher l'URL",
  editButton: 'Éditer',
  machines: 'Machines',
  page: 'Page',
  resetButton: "Réinitialiser",
  rotations: "Rotation(s)",
  rows: "Lignes",
  showLegend: "Afficher la légende",
  webAppVersion: "Version de la web app"
}

ATSORA_LOCALE_CATALOG.fr.content = {
  actual: 'données courantes',
  actualVsTarget: 'données courantes/objectif',
  currentColon: 'Actuellement :',
  currentDay: 'Jour courant',
  currentShift: 'Équipe courante',
  currentWeek: 'Semaine courante',
  inProgress: 'en cours',
  last7days: '7 derniers jours',
  legend: 'Légende',
  overrides: 'potentiomètres',
  part: 'pièce',
  percent: '%',
  productionState: 'état de production',
  reason: "raison d'arrêt",
  reports: 'Rapports',
  sequence: 'séquence',
  time: 'heure',
  today: "Aujourd'hui",
  tool: 'outil',
  yesterday: 'Hier'
}

ATSORA_LOCALE_CATALOG.fr.dialog = {
  confirmation: 'Confirmation',
  error: 'Erreur',
  information: 'Information',
  select: 'Sélectionner',
  wait: "Prière d'attendre...",
  warning: 'Attention'
}

ATSORA_LOCALE_CATALOG.fr.error = {
  machineRequired: 'Prière de sélectionner au-moins une machine',
  min1hour: 'Prière de sélectionner au-moins une heure'
}

ATSORA_LOCALE_CATALOG.fr.pages = {
  index: {
    title: 'Index'
  },
  login: {
    title: 'Login'
  },
  home: {
    title: 'Accueil'
  },

  // Manager and operator views
  machines: {
    title: 'Machines'
  },
  machinespecification: {
    title: 'Affichage jour/semaine par machine'
  },
  productionmachining: {
    title: 'État de production'
  },
  running: {
    title: 'État courant'
  },
  scheduledstatus: {
    title: 'Production planifiée'
  },
  toollife: {
    title: "Durée de vie d'outils"
  },

  // Manager, operator and LIVE
  managementinformationterminal: {
    title: "Vue exploratrice"
  },
  operationstatus: {
    title: "État des opérations"
  },

  // Add in plugin
  productiontracker: {
    title: 'Suivi de production'
  },
  mpmilestones: {
    title: ''
  },
  reservecapacity: {
    title: 'Capacité de réserve'
  },

  // LIVE display
  utilizationbar: {
    title: 'Utilisation',
    subtitle: 'Barre'
  },
  utilizationpie: {
    title: 'Utilisation',
    subtitle: 'Camembert'
  },
  performancebar: {
    title: 'Performance',
    subtitle: 'Jauge horizontale'
  },
  performancegauge: {
    title: 'Performance',
    subtitle: 'Jauge circulaire'
  },
  combinedview: {
    title: 'Vue combinée',
    options: {
      title: 'Options',
      reset: 'Réinitialiser'
    }
  },
  machinestatus: {
    title: 'État des machines'
  },
  managerview: {
    title: "Vue responsable d'atelier"
  },
  motionsummary: {
    title: 'Statut courant'
  },
  plant:{
    title: 'Vue atelier'
  }
};

// Force the locale of the catalog
ATSORA_LOCALE_CATALOG = ATSORA_CATALOG.default;
