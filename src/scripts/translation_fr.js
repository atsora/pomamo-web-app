// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

//var ATSORA_CATALOG = ATSORA_CATALOG || {};
// If do not exists, it IS an error. The file translation_pusecomponent_default.js is not included ?

ATSORA_CATALOG.options = {
  title: 'Options',
  alarmsUnknown: 'montrer les alarmes inconnues',
  alarmsWithDetails: "avec détails d'alarmes",
  currentDataSelection: 'Courantes...',
  displayShift: "Afficher l'équipe",
  displayUtilization: "Afficher l'utilisation",
  highlightPartCount: 'Mettre en avant le nombre de pièces',
  resetButton: 'remise à zéro',
  showAlarms: 'Afficher les alarmes',
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

ATSORA_CATALOG.content = {
  actual: 'données courantes',
  actualVsTarget: 'données courantes/objectif',
  currentDay: 'Jour courant',
  currentShift: 'Équipe courante',
  currentWeek: 'Semaine courante',
  last7days: '7 derniers jours',
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

ATSORA_CATALOG.error = {
  machineRequired: 'Prière de sélectionner au-moins une machine',
  min1hour: 'Prière de sélectionner au-moins une heure'
}

ATSORA_CATALOG.pages = {
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
    title: 'Vue exploratrice manager'
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
      reset: 'Remise à zéro',

    }
  },
  machinestatus: {
    title: 'État des machines'
  },
  managerview: {
    title: 'Vue manager'
  },
  motionsummary: {
    title: 'Statut courant'
  },
  plant:{
    title: 'Vue atelier'
  }
};