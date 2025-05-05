// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

//var ATSORA_CATALOG = ATSORA_CATALOG || {};
// If do not exists, it IS an error. The file translation_pusecomponent_default.js is not included ?

ATSORA_CATALOG.options = {
  title: 'Options',
  alarmsUnknown: 'show unknown alarms',
  alarmsWithDetails: 'with alarm details',
  currentDataSelection: 'Current...',
  displayShift: 'Display shift',
  displayUtilization: 'Display utilization',
  highlightPartCount: 'Highlight part count',
  resetButton: 'reset',
  showAlarms: 'Show alarms',
  showClock: 'Show clock',
  showCurrentAlarm: 'Show current alarm',
  showNcProgram: "Show NC program",
  showOperation: 'Show operation',
  showPartCount: 'Show part count',
  showPartCountInPie: 'Show part count in pie',
  showPercent: 'Show percent',
  showPie: 'Show pie',
  showRemainingCycles: 'Show remaining cycles',
  showReserveCapacity: 'Show reserve capacity',
  showSecondUtilizationBar: 'Show second utilization bar',
  showStackLights: 'Show stack lights',
  showUtilizationBar: 'Show machine utilization bar',
  showUtilizationTarget: 'Show utilization target',
  sizeBig: 'Big',
  sizeSmall: 'Small',
  timeFrameDays: 'Day(s)',
  timeFrameHours: 'Hour(s)',
  timeFrameSelection: 'Period: ',
  thresholdOrange: 'Orange',
  thresholdRed: 'Red',
  toolsExpiring: 'Expiring tools'
}

ATSORA_CATALOG.content = {
  actual: 'actual',
  actualVsTarget: 'actual/target',
  currentDay: 'Current day',
  currentShift: 'Current shift',
  currentWeek: 'Current week',
  last7days: 'Last 7 days',
  overrides: 'overrides',
  part: 'part',
  percent: '%',
  productionState: 'production state',
  reason: 'reason',
  sequence: 'sequence',
  time: 'time',
  today: 'Today',
  tool: 'tool',
  yesterday: 'Yesterday'
}

ATSORA_CATALOG.error = {
  machineRequired: 'Please select at least one machine',
  min1hour: 'Please select at least one hour'
}

ATSORA_CATALOG.pages = {
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
    title: 'Machine display'
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
  plant:{
    title: 'Plant'
  }
};