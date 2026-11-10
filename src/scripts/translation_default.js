// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
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
  showNextTask: 'Show next task',
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
  showTaskList: 'Show task list',
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
  showCncAlarmIcon: 'Show CNC alarm icon',
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
  installationLanguage: 'Default language',
  language: 'Language',
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
  maintenance: 'The system is currently under maintenance',
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
  min1hour: 'Please select at least one hour',
  // Keyed by XMLHttpRequest status, read by pulseService.getAjaxErrorMessage.
  // 0 means the browser got no response at all, not that the network is down.
  ajax: {
    0: 'No response from the server',
    400: 'Bad request',
    401: 'Unauthorised access',
    403: 'Forbidden resource, cannot be accessed',
    404: 'Requested page not found',
    500: 'Internal Server Error',
    501: 'Not implemented',
    502: 'Bad Gateway or Proxy Error',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    520: 'Unknown Error'
  }
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
  machinestatusdashboard: {
    title: 'Status dashboard'
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
  },
  'vue-tasks': {
    title: 'Tasks'
  },
  'vue-execution': {
    title: 'Execution'
  },
  'vue-operationexplorer': {
    title: 'Operation explorer'
  },
  configuration: {
    title: 'Configuration'
  },
  'vue-reasonconfig': {
    title: 'Reasons configuration',
    description: 'Reasons of the machine stops and their groups'
  },
  'vue-scheduledconfigtemplate': {
    title: 'Planning',
    description: 'Day and week templates of the planning, to apply on the machines'
  },
  'vue-scheduledconfig': {
    title: 'Machine planning',
    description: 'Templates applied on the machines, on a calendar'
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
  showNextTask: "Afficher la tâche suivante",
  showOperation: "Afficher l'opération",
  showPartCount: "Afficher le nombre de pièces",
  showPartCountInPie: "Afficher le nombre de pièces dans le graphique",
  showPercent: "Afficher le pourcentage",
  showPie: "Afficher le graphique",
  showRemainingCycles: "Afficher le nombre de cycles restants",
  showReserveCapacity: "Afficher la capacité de réserve",
  showSecondUtilizationBar: "Afficher la seconde barre d'utilisation",
  showStackLights: "Afficher la verrine lumineuse",
  showTaskList: "Afficher la liste des tâches",
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
  showCncAlarmIcon: 'Afficher l\'icône d\'alarme CNC',
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
  installationLanguage: 'Langue par défaut',
  language: 'Langue',
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
  maintenance: 'Le système est actuellement en maintenance',
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
  reason: "raison",
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
  min1hour: 'Prière de sélectionner au-moins une heure',
  ajax: {
    0: 'Pas de réponse du serveur',
    400: 'Requête incorrecte',
    401: 'Accès non autorisé',
    403: 'Ressource interdite, accès impossible',
    404: 'Page demandée introuvable',
    500: 'Erreur interne du serveur',
    501: 'Non implémenté',
    502: 'Erreur de passerelle ou de proxy',
    503: 'Service indisponible',
    504: "Délai d'attente de la passerelle dépassé",
    520: 'Erreur inconnue'
  }
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
  machinestatusdashboard: {
    title: 'Tableau de bord des états'
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
  },
  'vue-tasks': {
    title: 'Tâches'
  },
  'vue-execution': {
    title: 'Exécution'
  },
  'vue-operationexplorer': {
    title: 'Explorateur d\'opérations'
  },
  configuration: {
    title: 'Configuration'
  },
  'vue-reasonconfig': {
    title: 'Configuration des raisons',
    description: 'Raisons des arrêts des machines et leurs groupes'
  },
  'vue-scheduledconfigtemplate': {
    title: 'Planning',
    description: 'Templates de jour et de semaine du planning, à appliquer sur les machines'
  },
  'vue-scheduledconfig': {
    title: 'Planification des machines',
    description: 'Templates appliqués sur les machines, sur un calendrier'
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
  showNextTask: 'Nächste Aufgabe anzeigen',
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
  showTaskList: 'Aufgabenliste anzeigen',
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
  showCncAlarmIcon: 'CNC-Alarmsymbol anzeigen',
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
  installationLanguage: 'Standardsprache',
  language: 'Sprache',
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
  maintenance: 'Das System wird derzeit gewartet',
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
  reason: 'Grund',
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
  min1hour: 'Bitte mindestens eine Stunde auswählen',
  ajax: {
    0: 'Keine Antwort vom Server',
    400: 'Ungültige Anfrage',
    401: 'Nicht autorisierter Zugriff',
    403: 'Gesperrte Ressource, Zugriff nicht möglich',
    404: 'Angeforderte Seite nicht gefunden',
    500: 'Interner Serverfehler',
    501: 'Nicht implementiert',
    502: 'Gateway- oder Proxy-Fehler',
    503: 'Dienst nicht verfügbar',
    504: 'Gateway-Zeitüberschreitung',
    520: 'Unbekannter Fehler'
  }
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
  machinestatusdashboard: {
    title: 'Status-Dashboard'
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
  },
  'vue-tasks': {
    title: 'Aufgaben'
  },
  'vue-execution': {
    title: 'Ausführung'
  },
  'vue-operationexplorer': {
    title: 'Arbeitsgang-Explorer'
  },
  configuration: {
    title: 'Konfiguration'
  },
  'vue-reasonconfig': {
    title: 'Gründe-Konfiguration',
    description: 'Gründe der Maschinenstillstände und ihre Gruppen'
  },
  'vue-scheduledconfigtemplate': {
    title: 'Planung',
    description: 'Tages- und Wochenvorlagen der Planung, auf die Maschinen anzuwenden'
  },
  'vue-scheduledconfig': {
    title: 'Maschinenplanung',
    description: 'Auf die Maschinen angewendete Vorlagen, in einem Kalender'
  }
};

// - ja translations

ATSORA_LOCALE_CATALOG.ja.options = {
  title: 'オプション',
  layoutSettings: 'レイアウト設定',
  defaultLayout: '既定のレイアウトを使用（12）',
  rotationSettings: 'ローテーション設定',
  machinesPerPage: '設備数／ページ',
  rotationDelay: '間隔（秒）',
  alarmsUnknown: '不明なアラームを表示',
  alarmsWithDetails: 'アラームの詳細付き',
  currentDataSelection: '現在…',
  pieUtilizationPeriod: '稼働率円グラフの期間',
  deltaPart: '個数と目標の差',
  displayShift: 'シフトを表示',
  displayUtilization: '稼働率を表示',
  highlightPartCount: '生産数を強調表示',
  openStopClassification: '停止分類のポップアップを自動的に開く',
  productionActualVsTarget: '生産 実績／目標',
  productionDisplay: '稼働パルス',
  gauge: 'パフォーマンスゲージ',
  pie: '工程ステータス',
  productiongauge: '生産ゲージ',
  resetButton: 'リセット',
  showAlarms: 'アラームを表示',
  showBar: 'バーを表示',
  showClock: '時計を表示',
  showcurrentmachinestatuslogo: 'ステータスのロゴを表示',
  showcurrentmachinestatusletter: 'ステータスを表示',
  showCurrentAlarm: '現在のアラームを表示',
  showNcProgram: 'NC プログラムを表示',
  showNextTask: '次のタスクを表示',
  showOperation: '工程を表示',
  showPartCount: '生産数を表示',
  showPartCountInPie: '円グラフに生産数を表示',
  showPercent: 'パーセントを表示',
  showProductionbar: 'パフォーマンスバーを表示',
  showPie: '円グラフを表示',
  showRemainingCycles: '残りサイクルを表示',
  showReserveCapacity: '余力を表示',
  showSecondUtilizationBar: '2つ目の稼働率バーを表示',
  showStackLights: '積層表示灯を表示',
  showTaskList: 'タスク一覧を表示',
  showUtilizationBar: '設備稼働率バーを表示',
  showUtilizationTarget: '稼働率目標を表示',
  productionGauge: '生産ゲージ',
  maximum: '最大',
  minimum: '最小',
  sizeBig: '大',
  sizeSmall: '小',
  stopClassificationReopenDelay: '再表示までの時間（秒）',
  timeFrame: '時間枠',
  timeFrameDays: '日',
  timeFrameHours: '時間',
  timeFrameSelection: '期間：',
  thresholdsColor: '生産／目標のしきい値の色（%）',
  thresholdError: '目標のしきい値は赤のしきい値より大きくする必要があります',
  thresholdMaxError: 'パーセント値は100を超えられません',
  thresholdNaNError: 'しきい値には有効な数値を入力してください',
  thresholdOrange: 'オレンジ',
  thresholdPositiveError: '目標値は正の数である必要があります',
  thresholdRed: '赤',
  toolSelection: '工具の選択',
  toolsExpiring: '期限切れ間近の工具',
  showChangedTools: '工具情報を表示',
  showCncAlarmIcon: 'CNC アラームアイコンを表示',
  showProductionGauge: 'パフォーマンスゲージを表示',
  showProductiontrackergraph: '生産トラッカーのグラフを表示',
  thresholdMode: 'しきい値モード',
  target: '目標'
}

ATSORA_LOCALE_CATALOG.ja.parameters = {
  columns: '列',
  copyUrl: 'URL をコピー',
  customTitle: 'カスタムタイトル',
  darkTheme: 'ダークテーマ',
  installationLanguage: '既定の言語',
  language: '言語',
  displayUrl: 'URL を表示',
  editButton: '編集',
  machines: '設備',
  page: 'ページ',
  resetButton: 'リセット',
  rotations: 'ローテーション',
  rows: '行',
  showLegend: '凡例を表示'
}

ATSORA_LOCALE_CATALOG.ja.content = {
  maintenance: '現在システムはメンテナンス中です',
  actual: '実績',
  actualVsTarget: '実績／目標',
  bookmark: 'ブックマーク用 URL',
  copyurl: 'URL をコピー',
  currentColon: '現在：',
  currentDay: '当日',
  currentShift: '現在のシフト',
  currentWeek: '今週',
  days: '（7日間）',
  failure: '失敗',
  inProgress: '進行中',
  last7days: '過去7日間',
  legend: '凡例',
  overrides: '上書き',
  part: '個',
  percent: '%',
  productionState: '生産状態',
  reason: '理由',
  reports: 'レポート',
  sequence: 'シーケンス',
  time: '時間',
  today: '今日',
  tool: '工具',
  utilization: '稼働率',
  week: '週',
  yesterday: '昨日',
  reference: '基準',
  performance: 'パフォーマンス',
  changedtools: '工具',
  state: '状態',
  success: '成功',
}

ATSORA_LOCALE_CATALOG.ja.dialog = {
  confirmation: '確認',
  details: '詳細',
  error: 'エラー',
  information: '情報',
  select: '選択',
  wait: 'お待ちください…',
  warning: '警告'
}

ATSORA_LOCALE_CATALOG.ja.error = {
  machineRequired: '設備を1台以上選択してください',
  min1hour: '1時間以上を選択してください',
  ajax: {
    0: 'サーバーから応答がありません',
    400: '不正なリクエスト',
    401: '認証されていないアクセス',
    403: 'アクセスが禁止されているリソースです',
    404: '要求されたページが見つかりません',
    500: 'サーバー内部エラー',
    501: '実装されていません',
    502: 'ゲートウェイまたはプロキシのエラー',
    503: 'サービスを利用できません',
    504: 'ゲートウェイのタイムアウト',
    520: '不明なエラー'
  }
}

ATSORA_LOCALE_CATALOG.ja.pages = {
  index: {
    title: 'インデックス'
  },
  login: {
    title: 'ログイン'
  },
  home: {
    title: 'ホーム'
  },

  // Manager and operator views
  machines: {
    title: '設備'
  },
  machinespecification: {
    title: '設備表示：日と週'
  },
  oeeview: {
    title: 'OEE ビュー'
  },
  machinedashboard: {
    title: 'ダッシュボード'
  },
  machinestatusdashboard: {
    title: 'ステータスダッシュボード'
  },
  productionmachining: {
    title: '加工生産ステータス'
  },
  running: {
    title: '稼働'
  },
  scheduledstatus: {
    title: '予定ステータス'
  },
  toollife: {
    title: '工具寿命'
  },

  // Manager, operator and LIVE
  managementinformationterminal: {
    title: '管理情報端末'
  },
  operationstatus: {
    title: '工程ステータス'
  },

  // Add in plugin
  productiontracker: {
    title: '生産トラッカー'
  },
  mpmilestones: {
    title: 'マイルストーン'
  },
  plant: {
    title: '工場'
  },
  reservecapacity: {
    title: '余力'
  },

  // LIVE display
  utilizationbar: {
    title: '稼働率',
    subtitle: 'バー'
  },
  utilizationpie: {
    title: '稼働率',
    subtitle: '円グラフ'
  },
  performancebar: {
    title: 'パフォーマンス',
    subtitle: '横型ゲージ'
  },
  performancegauge: {
    title: 'パフォーマンス',
    subtitle: '円形ゲージ'
  },
  combinedview: {
    title: '統合ビュー',
    options: {
      title: 'オプション',
      reset: 'リセット',
    }
  },
  machinestatus: {
    title: '設備ステータス'
  },
  managerview: {
    title: 'マネージャービュー'
  },
  motionsummary: {
    title: '稼働サマリー'
  },
  'vue-tasks': {
    title: 'タスク'
  },
  'vue-execution': {
    title: '実行'
  },
  'vue-operationexplorer': {
    title: 'オペレーションエクスプローラー'
  },
  configuration: {
    title: '設定'
  },
  'vue-reasonconfig': {
    title: '理由の設定',
    description: '設備の停止理由とそのグループ'
  },
  'vue-scheduledconfigtemplate': {
    title: '計画',
    description: '設備に適用する、計画の日テンプレートと週テンプレート'
  },
  'vue-scheduledconfig': {
    title: '設備の計画',
    description: '設備に適用されたテンプレート（カレンダー表示）'
  }
};

// setAtsoraLocale is defined in translation_component_default.js
// Re-apply default locale to pick up app-level catalog entries added above
setAtsoraLocale('default');
