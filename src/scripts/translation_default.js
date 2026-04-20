// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

//var ATSORA_CATALOG = ATSORA_CATALOG || {};
// If do not exists, it IS an error. The file translation_pusecomponent_default.js is not included ?

// - Default translation

ATSORA_LOCALE_CATALOG.default.options = {
  title: 'Options',
  layoutSettings: 'Layout settings',
  defaultLayout: 'Use default layout (12)',
  rotationSettings: 'Rotation settings',
  machinesPerPage: 'Machines / page',
  rotationDelay: 'Delay (sec)',
  alarmsUnknown: 'show unknown alarms',
  alarmsWithDetails: 'with alarm details',
  currentDataSelection: 'Current...',
  pieUtilizationPeriod: 'Utilization pie period',
  deltaPart: 'delta part/target',
  displayShift: 'Display shift',
  displayUtilization: 'Display utilization',
  highlightPartCount: 'Highlight part count',
  openStopClassification: 'Automatically open stop classification pop-up',
  productionActualVsTarget: 'Production actual/target',
  productionDisplay: 'Operational pulse',
  gauge: 'Performance gauge',
  pie: 'Operation status',
  productiongauge: 'Production gauge',
  resetButton: 'Reset',
  showAlarms: 'Show alarms',
  showBar: 'Show bar',
  showClock: 'Show clock',
  showcurrentmachinestatuslogo: "show status logo",
  showcurrentmachinestatusletter: "show status",
  showCurrentAlarm: 'Show current alarm',
  showNcProgram: "Show NC program",
  showOperation: 'Show operation',
  showPartCount: 'Show part count',
  showPartCountInPie: 'Show part count in pie',
  showPercent: 'Show percent',
  showProductionbar: 'Show performance bar',
  showPie: 'Show pie',
  showRemainingCycles: 'Show remaining cycles',
  showReserveCapacity: 'Show reserve capacity',
  showSecondUtilizationBar: 'Show second utilization bar',
  showStackLights: 'Show stack lights',
  showUtilizationBar: 'Show machine utilization bar',
  showUtilizationTarget: 'Show utilization target',
  productionGauge: 'Production gauge',
  maximum: 'Maximum',
  minimum: 'Minimum',
  sizeBig: 'Big',
  sizeSmall: 'Small',
  stopClassificationReopenDelay: 'Reopen delay (seconds)',
  timeFrame: 'Time frame',
  timeFrameDays: 'Day(s)',
  timeFrameHours: 'Hour(s)',
  timeFrameSelection: 'Period: ',
  thresholdsColor: 'Thresholds color of production / target (%)',
  thresholdError: 'Target threshold must be greater than red threshold',
  thresholdMaxError: 'Percentage values cannot exceed 100',
  thresholdNaNError: 'Threshold values must be valid numbers',
  thresholdOrange: 'Orange',
  thresholdPositiveError: 'Target value must be positive',
  thresholdRed: 'Red',
  toolSelection:'Tool selection',
  toolsExpiring: 'Expiring tools',
  showChangedTools: 'Show tool information',
  showProductionGauge: 'Show performance gauge',
  showProductiontrackergraph: 'Show production tracker graph',
  thresholdMode: 'Threshold mode',
  target: 'Target'
}

ATSORA_LOCALE_CATALOG.default.parameters = {
  columns: 'Columns',
  copyUrl: 'Copy URL',
  customTitle: 'Custom title',
  darkTheme: 'Dark theme',
  displayUrl: 'Display URL',
  editButton: 'Edit',
  machines: 'Machines',
  page: 'Page',
  resetButton: "Reset",
  rotations: "Rotation(s)",
  rows: "Rows",
  showLegend: "Show legend"
}

ATSORA_LOCALE_CATALOG.default.content = {
  actual: 'actual',
  actualVsTarget: 'actual/target',
  bookmark: 'URL to bookmark',
  copyurl : 'Copy URL',
  currentColon: 'Current:',
  currentDay: 'Current day',
  currentShift: 'Current shift',
  currentWeek: 'Current week',
  days: '(7 days)',
  failure: 'failure',
  inProgress: 'in progress',
  last7days: 'Last 7 days',
  legend: 'Legend',
  overrides: 'overrides',
  part: 'part',
  percent: '%',
  productionState: 'production state',
  reason: 'reason',
  reports: 'Reports',
  sequence: 'sequence',
  time: 'time',
  today: 'Today',
  tool: 'tool',
  utilization: 'Utilization',
  week: 'Week',
  yesterday: 'Yesterday',
  reference: 'Reference',
  performance: 'Performance',
  changedtools: 'Tools',
  state: 'State',
  success: 'Success',
}

ATSORA_LOCALE_CATALOG.default.dialog = {
  confirmation: 'Confirmation',
  details: 'Details',
  error: 'Error',
  information: 'Information',
  select: 'Select',
  wait: 'Please wait...',
  warning: 'Warning'
}

ATSORA_LOCALE_CATALOG.default.error = {
  machineRequired: 'Please select at least one machine',
  min1hour: 'Please select at least one hour'
}

ATSORA_LOCALE_CATALOG.default.pages = {
  index: {
    title: 'Index'
  },
  login: {
    title: 'Login'
  },
  home: {
    title: 'Home'
  },

  // Manager and operator views
  machines: {
    title: 'Machines'
  },
  machinespecification: {
    title: 'Machine display: day and week'
  },
  oeeview: {
    title: 'OEE view'
  },
  machinedashboard: {
    title: 'Dashboard'
  },
  productionmachining: {
    title: 'Production machining status'
  },
  running: {
    title: 'Running'
  },
  scheduledstatus: {
    title: 'Scheduled status'
  },
  toollife: {
    title: 'Tool life'
  },

  // Manager, operator and LIVE
  managementinformationterminal: {
    title: 'Management information terminal'
  },
  operationstatus: {
    title: 'Operation status'
  },

  // Add in plugin
  productiontracker: {
    title: 'Production tracker'
  },
  mpmilestones: {
    title: 'Milestones'
  },
  plant: {
    title: 'Plant'
  },
  reservecapacity: {
    title: 'Reserve capacity'
  },

  // LIVE display
  utilizationbar: {
    title: 'Utilization',
    subtitle: 'Bar'
  },
  utilizationpie: {
    title: 'Utilization',
    subtitle: 'Pie'
  },
  performancebar: {
    title: 'Performance',
    subtitle: 'Horizontal gauge'
  },
  performancegauge: {
    title: 'Performance',
    subtitle: 'Circular gauge'
  },
  combinedview: {
    title: 'Combined view',
    options: {
      title: 'Options',
      reset: 'Reset',

    }
  },
  machinestatus: {
    title: 'Machine status'
  },
  managerview: {
    title: 'Manager view'
  },
  motionsummary: {
    title: 'Motion summary'
  }
};

// - fr translations

ATSORA_LOCALE_CATALOG.fr.options = {
  title: 'Options',
  layoutSettings: 'Mise en page',
  defaultLayout: 'Utiliser la mise en page par defaut (12)',
  rotationSettings: 'Parametres de rotation',
  machinesPerPage: 'Machines / page',
  rotationDelay: 'Delai (sec)',
  alarmsUnknown: 'Montrer les alarmes inconnues',
  alarmsWithDetails: "avec détails d'alarmes",
  currentDataSelection: 'Courantes...',
  pieUtilizationPeriod: 'Periode du camembert d\'utilisation',
  deltaPart: "Delta pièces/objectif",
  displayShift: "Afficher l'équipe",
  displayUtilization: "Afficher l'utilisation",
  highlightPartCount: 'Mettre en avant le nombre de pièces',
  openStopClassification: 'Ouvrir automatiquement la fenêtre de classification des arrêts',
  productionActualVsTarget: 'Production courante/objectif',
  productionDisplay: "Pouls opérationnel",
  gauge: 'Jauge de performance',
  pie: 'Statut d\'opération',
  productiongauge: 'Jauge de production',
  resetButton: 'Réinitialiser',
  showAlarms: 'Afficher les alarmes',
  showBar: 'Afficher la barre',
  showcurrentmachinestatuslogo: "Afficher le logo de l'état machine",
  showcurrentmachinestatusletter: "Afficher l'état de la machine",
  showProductionbar: 'Afficher la barre de performance',
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
  productionGauge: 'Jauge de production',
  maximum: 'Maximum',
  minimum: 'Minimum',
  sizeBig: "Grand",
  sizeSmall: "Petit",
  stopClassificationReopenDelay: 'Délai de réouverture (secondes)',
  timeFrame:"Période",
  timeFrameDays: "Jour(s)",
  timeFrameHours: 'Heure(s)',
  timeFrameSelection: 'Période : ',
  thresholdsColor: 'Couleur des seuils de la production / objectif en %',
  thresholdError: 'Objectif doit être supérieur à Rouge',
  thresholdMaxError: 'Les valeurs en pourcentage doivent être inférieures à 100',
  thresholdNaNError: 'Les seuils doivent être des nombres',
  thresholdOrange: 'Orange',
  thresholdPositiveError: 'Les seuils doivent être positifs',
  thresholdRed: 'Rouge',
  toolsExpiring: 'Outils expirés',
  toolSelection: 'Sélection d\'outils',
  showChangedTools: 'Afficher les informations d\'outils',
  showProductionGauge: 'Afficher la jauge de performance',
  showProductiontrackergraph: 'Afficher le graphique de suivi de production',
  thresholdMode: 'Mode de seuil',
  target: 'Objectif'
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
  showLegend: "Afficher la légende"
}

ATSORA_LOCALE_CATALOG.fr.content = {
  actual: 'données courantes',
  actualVsTarget: 'données courantes/objectif',
  bookmark: 'URL à enregistrer',
  copyurl : 'Copier URL',
  currentColon: 'Actuellement :',
  currentDay: 'Jour courant',
  currentShift: 'Équipe courante',
  currentWeek: 'Semaine courante',
  days: '(7 jours)',
  failure: 'Échec',
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
  utilization: 'Utilisation',
  week: 'Semaine',
  yesterday: 'Hier',
  reference: 'Référence',
  performance: 'Performance',
  changedtools: 'Outils',
  state: 'État',
  success: 'Succès',
}

ATSORA_LOCALE_CATALOG.fr.dialog = {
  confirmation: 'Confirmation',
  details: 'Détails',
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
  oeeview: {
    title: 'Vue TRS'
  },
  machinedashboard: {
    title: 'Tableau de bord'
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
  plant: {
    title: 'Vue atelier'
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
  }
};

// - de translations

ATSORA_LOCALE_CATALOG.de.options = {
  title: 'Optionen',
  layoutSettings: 'Layout-Einstellungen',
  defaultLayout: 'Standardlayout verwenden (12)',
  rotationSettings: 'Rotationseinstellungen',
  machinesPerPage: 'Maschinen / Seite',
  rotationDelay: 'Verzoegerung (Sek.)',
  alarmsUnknown: 'Unbekannte Alarme anzeigen',
  alarmsWithDetails: 'mit Alarmdetails',
  currentDataSelection: 'Aktuell...',
  pieUtilizationPeriod: 'Zeitraum Auslastungsdiagramm',
  deltaPart: 'Delta Teile/Ziel',
  displayShift: 'Schicht anzeigen',
  displayUtilization: 'Auslastung anzeigen',
  highlightPartCount: 'Teileanzahl hervorheben',
  openStopClassification: 'Stillstandsklassifizierungs-Fenster automatisch öffnen',
  productionActualVsTarget: 'Ist-/Soll-Produktion',
  productionDisplay: 'Betrieblicher Puls',
  gauge: 'Leistungsanzeige',
  pie: 'Betriebsstatus',
  productiongauge: 'Produktionsanzeige',
  resetButton: 'Zurücksetzen',
  showAlarms: 'Alarme anzeigen',
  showBar: 'Balken anzeigen',
  showClock: 'Uhr anzeigen',
  showcurrentmachinestatuslogo: 'Statuslogo anzeigen',
  showcurrentmachinestatusletter: 'Maschinenstatus anzeigen',
  showCurrentAlarm: 'Aktuellen Alarm anzeigen',
  showNcProgram: 'NC-Programm anzeigen',
  showOperation: 'Vorgang anzeigen',
  showPartCount: 'Teileanzahl anzeigen',
  showPartCountInPie: 'Teileanzahl im Diagramm anzeigen',
  showPercent: 'Prozent anzeigen',
  showProductionbar: 'Leistungsbalken anzeigen',
  showPie: 'Diagramm anzeigen',
  showRemainingCycles: 'Verbleibende Zyklen anzeigen',
  showReserveCapacity: 'Reservekapazität anzeigen',
  showSecondUtilizationBar: 'Zweiten Auslastungsbalken anzeigen',
  showStackLights: 'Signalleuchte anzeigen',
  showUtilizationBar: 'Maschinenauslastungsbalken anzeigen',
  showUtilizationTarget: 'Auslastungsziel anzeigen',
  productionGauge: 'Produktionsanzeige',
  maximum: 'Maximum',
  minimum: 'Minimum',
  sizeBig: 'Groß',
  sizeSmall: 'Klein',
  stopClassificationReopenDelay: 'Verzögerung beim Wiederöffnen (Sekunden)',
  timeFrame: 'Zeitrahmen',
  timeFrameDays: 'Tag(e)',
  timeFrameHours: 'Stunde(n)',
  timeFrameSelection: 'Zeitraum: ',
  thresholdsColor: 'Schwellenwertfarben Produktion / Ziel (%)',
  thresholdError: 'Zielwert muss größer als der rote Schwellenwert sein',
  thresholdMaxError: 'Prozentwerte dürfen 100 nicht überschreiten',
  thresholdNaNError: 'Schwellenwerte müssen gültige Zahlen sein',
  thresholdOrange: 'Orange',
  thresholdPositiveError: 'Zielwert muss positiv sein',
  thresholdRed: 'Rot',
  toolSelection: 'Werkzeugauswahl',
  toolsExpiring: 'Ablaufende Werkzeuge',
  showChangedTools: 'Werkzeuginformationen anzeigen',
  showProductionGauge: 'Leistungsanzeige anzeigen',
  showProductiontrackergraph: 'Produktionsverfolgungsdiagramm anzeigen',
  thresholdMode: 'Schwellenwertmodus',
  target: 'Zielwert'
}

ATSORA_LOCALE_CATALOG.de.parameters = {
  columns: 'Spalten',
  copyUrl: 'URL kopieren',
  customTitle: 'Benutzerdefinierter Titel',
  darkTheme: 'Dunkles Design',
  displayUrl: 'URL anzeigen',
  editButton: 'Bearbeiten',
  machines: 'Maschinen',
  page: 'Seite',
  resetButton: 'Zurücksetzen',
  rotations: 'Rotation(en)',
  rows: 'Zeilen',
  showLegend: 'Legende anzeigen'
}

ATSORA_LOCALE_CATALOG.de.content = {
  actual: 'Ist-Wert',
  actualVsTarget: 'Ist/Soll',
  bookmark: 'URL als Lesezeichen',
  copyurl: 'URL kopieren',
  currentColon: 'Aktuell:',
  currentDay: 'Aktueller Tag',
  currentShift: 'Aktuelle Schicht',
  currentWeek: 'Aktuelle Woche',
  days: '(7 Tage)',
  failure: 'Fehler',
  inProgress: 'in Bearbeitung',
  last7days: 'Letzte 7 Tage',
  legend: 'Legende',
  overrides: 'Überschreibungen',
  part: 'Teil',
  percent: '%',
  productionState: 'Produktionsstatus',
  reason: 'Stillstandsgrund',
  reports: 'Berichte',
  sequence: 'Sequenz',
  time: 'Uhrzeit',
  today: 'Heute',
  tool: 'Werkzeug',
  utilization: 'Auslastung',
  week: 'Woche',
  yesterday: 'Gestern',
  reference: 'Referenz',
  performance: 'Leistung',
  changedtools: 'Werkzeuge',
  state: 'Zustand',
  success: 'Erfolg',
}

ATSORA_LOCALE_CATALOG.de.dialog = {
  confirmation: 'Bestätigung',
  details: 'Details',
  error: 'Fehler',
  information: 'Information',
  select: 'Auswählen',
  wait: 'Bitte warten...',
  warning: 'Warnung'
}

ATSORA_LOCALE_CATALOG.de.error = {
  machineRequired: 'Bitte mindestens eine Maschine auswählen',
  min1hour: 'Bitte mindestens eine Stunde auswählen'
}

ATSORA_LOCALE_CATALOG.de.pages = {
  index: {
    title: 'Index'
  },
  login: {
    title: 'Anmelden'
  },
  home: {
    title: 'Startseite'
  },

  // Manager and operator views
  machines: {
    title: 'Maschinen'
  },
  machinespecification: {
    title: 'Maschinenansicht: Tag und Woche'
  },
  oeeview: {
    title: 'OEE-Ansicht'
  },
  machinedashboard: {
    title: 'Dashboard'
  },
  productionmachining: {
    title: 'Fertigungsstatus'
  },
  running: {
    title: 'Aktueller Betrieb'
  },
  scheduledstatus: {
    title: 'Planungsstatus'
  },
  toollife: {
    title: 'Werkzeugstandzeit'
  },

  // Manager, operator and LIVE
  managementinformationterminal: {
    title: 'Betriebsinformationsterminal'
  },
  operationstatus: {
    title: 'Betriebsstatus'
  },

  // Add in plugin
  productiontracker: {
    title: 'Produktionsverfolgung'
  },
  mpmilestones: {
    title: ''
  },
  plant: {
    title: 'Werksübersicht'
  },
  reservecapacity: {
    title: 'Reservekapazität'
  },

  // LIVE display
  utilizationbar: {
    title: 'Auslastung',
    subtitle: 'Balken'
  },
  utilizationpie: {
    title: 'Auslastung',
    subtitle: 'Kreisdiagramm'
  },
  performancebar: {
    title: 'Leistung',
    subtitle: 'Horizontale Anzeige'
  },
  performancegauge: {
    title: 'Leistung',
    subtitle: 'Kreisanzeige'
  },
  combinedview: {
    title: 'Kombinierte Ansicht',
    options: {
      title: 'Optionen',
      reset: 'Zurücksetzen',
    }
  },
  machinestatus: {
    title: 'Maschinenstatus'
  },
  managerview: {
    title: 'Schichtleiteransicht'
  },
  motionsummary: {
    title: 'Betriebsübersicht'
  }
};

// setAtsoraLocale is defined in translation_component_default.js
// Re-apply default locale to pick up app-level catalog entries added above
setAtsoraLocale('default');
