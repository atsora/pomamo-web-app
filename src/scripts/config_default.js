// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var PULSE_DEFAULT_CONFIG = PULSE_DEFAULT_CONFIG || {};

/* 
 * ** Please keep this comment ** *
 * Global configuration : each next line overload previous ones
 * PULSE_DEFAULT_CONFIG.general -> def in PWC
 * PULSE_DEFAULT_CONFIG.pages
 * PULSE_DEFAULT_CONFIG.roles -> def in PWC
 * PULSE_DEFAULT_CONFIG.rolespages
 *
 */

/* ********** ********** ********** ********** ********** ********** */
// general : Specific web app - prepare use lem* module
/* ********** ********** ********** ********** ********** ********** */
var LEM_CONFIG_DEFAULT = LEM_CONFIG_DEFAULT || {};
LEM_CONFIG_DEFAULT.appName = "PulseWebApp";

/* ********** ********** ********** ********** */
// general : Specific pulse web app
/* ********** ********** ********** ********** */
PULSE_DEFAULT_CONFIG.general.rotation = 90;
PULSE_DEFAULT_CONFIG.general.row = 2;
PULSE_DEFAULT_CONFIG.general.column = 3;
PULSE_DEFAULT_CONFIG.general.canUseRowsToSetHeight = false;
PULSE_DEFAULT_CONFIG.general.cancelHorizontalSplitInBar = 'true'; // default is false
PULSE_DEFAULT_CONFIG.general.showlegend = 'dynamic'; // Can be 'true', 'false', 'dynamic'

PULSE_DEFAULT_CONFIG.general.enableGroups = false; // Can be 'true' to display machines by groups (including dynamic groups)
PULSE_DEFAULT_CONFIG.general.allowpagerotation = false;
PULSE_DEFAULT_CONFIG.general.allowproductionbar = false; // Default

/* menuType: can be overload by role
* - 'fullOrIcon': icon + text or just icon, factorization per title NOT possible
* - 'textOrNothing': text with possibly subelements or nothing, factorization per title possible
* titles and subtitles are defined in the translations
*/
PULSE_DEFAULT_CONFIG.general.menuType = 'fullOrIcon';
/* customTitle:
* - true if the title can be overriden
* - false if the title CANNOT be overriden
*/
PULSE_DEFAULT_CONFIG.general.customTitle = false;

PULSE_DEFAULT_CONFIG.general.showUnknownAlarm = true; // used in x-detailedalarmsat and currenticoncncalarm == default 

// Default range for all pages :
PULSE_DEFAULT_CONFIG.general.displayshiftrange = false;
PULSE_DEFAULT_CONFIG.general.displaydaysrange = 1;
PULSE_DEFAULT_CONFIG.general.displayhoursrange = 0;

// BARS - default == show few bars (only reasons)
PULSE_DEFAULT_CONFIG.general.showcoloredbar = {
  // top
  shift: false,
  machinestate: false,
  observationstate: true,
  // middle
  operation: true,
  isofile: false,
  cncalarm: false,
  redstacklight: true,
  cncvalue: false,
  // click on any bar
  click: {
    allbars: 'none' // each bar can be overloaded. Possible values: none, change, popup, details
  },
  showdetails: [ 
  ],
  showpopup: [ 
  ]
};

/* ********** ********** ********** ********** */
// Configuration per page for pulse web app
/* ********** ********** ********** ********** */
PULSE_DEFAULT_CONFIG.pages = {
  combinedview: {
    enableGroups: true,
    showtarget: true, // Beurk !
    showalarm: false,
    showstacklight: false
  },
  machines: {
    enableGroups: true, // BUT static ! Re-load is disabled
    displayshiftrange: true,
    componentsToDisplay: [
    ],
    showcoloredbar: {
      // middle
      cncvalue: true,
      // click on any bar
      click: {
        allbars: 'change' // each bar can be overloaded. Possible values: none, change, popup, details
      },
    }
  },
  machinespecification: {
    enableGroups: true,
    row: 1,
    column: 1
  },
  machinestatus: {
    enableGroups: true,
    showworkinfo: false,
    showtarget: true,
    showcurrenttool: false,
    showcurrentsequence: false,
    showalarm: true,
    showstacklight: true,
    showweeklybar: true,
    weeklyshowcurrentweek: false, // = last 7 days
    displayshiftrange: false,
    displaymotiontime: false
  },
  managerview: {
    enableGroups: true,
    row: 6, // overload
    column: 1, // overload
    displayshiftrange: false,
    displaydaysrange: 1, // todo : use direct config
    displayhoursrange: 0, // todo : use direct config

    currentdisplay: {
      displayjob: false
    },
    showcoloredbar: {
      // middle
      cncvalue: true,
      // click on any bar
      /*click: {
        allbars: 'none' // each bar can be overloaded. Possible values: none, change, popup, details
      },*/
    }
  },
  motionsummary: {
    enableGroups: true,
    row: 10
    //showoverwriterequired: false // == default LIVE
  },
  managementinformationterminal: {
    enableGroups: true,
    productionpercentinpie: 'actualtarget', // 'true' or 'actualonly' or 'actualtarget'
    showRunningButton: false,
    showworkinfo: true,
    currentdisplay: {
      displayjobshiftpartcount: true,
      displayjob: false,
      displayshift: false,
      displaycncvalue: true
    }
  },
  mpmilestones: {
    enableGroups: true,
  },
  operationstatus: {
    enableGroups: true,
    showworkinfo: true,
    showworkinfobig: false,
    showproduction: true,
    productionpercent: 'actualtarget', // 'true' or 'actualonly' or 'actualtarget'
    productionpercentinpie: 'true',    // 'true' or 'actualonly' or 'actualtarget'
    showpie: true,
    showstacklight: true,
    showisofile: false,
    showcurrenttool: false,
    showcurrentsequence: false,
    showcurrentoverride: false,
    showalarm: false,
    showtool: true,
    showbar: true,
    barshowpercent: false,
    displayshiftrange: true,
    showcoloredbar: {
      // middle
      cncalarm: false, //true, // Removed because too slow (cf NR-2019-05)
      // click on any bar
      /*click: {
        allbars: 'none' // each bar can be overloaded. Possible values: none, change, popup, details
      },*/
    }
  },
  plant: {
    enableGroups: false
  },
  productionmachining: {
    enableGroups: true
  },
  productiontracker: {
    enableGroups: true,
    row: 1,
    showreservecapacity: false
  },
  performancebar: {
    enableGroups: true
  },
  performancegauge: {
    enableGroups: true
  },
  reservecapacity: {
    enableGroups: true,
    minchartvalue: '', // No value = default
    maxchartvalue: ''  // No value = default
  },
  running: {
    enableGroups: true,
    displayshiftrange: true,
    showproductionbar: false,
    currentdisplay: {
      displayjobshiftpartcount: true,
      displayjob: false,
      displayshift: false,
      displaycncvalue: true
    }
  },
  scheduledstatus: {
    enableGroups: true,
    setupmachine: {
      thresholdinseconds: 60
    }
  },
  toollife: {
    enableGroups: true,
  },
  utilizationbar: {
    enableGroups: true,
    showclock: false,
    displayshiftrange: false,
    displaydaysrange: 1,
    displayhoursrange: 0
  },
  utilizationpie: {
    enableGroups: true,
    displayshiftrange: false
  }
};


/* ********** ********** ********** ********** */
// roles config - for pulse web app
/* ********** ********** ********** ********** */

/* displayedPages: array containing the pages available for the role, in the right order */
PULSE_DEFAULT_CONFIG.roles.operator.displayedPages = [
];
PULSE_DEFAULT_CONFIG.roles.manager.displayedPages = [
];
PULSE_DEFAULT_CONFIG.roles.support.displayedPages = [
];
PULSE_DEFAULT_CONFIG.roles.live.displayedPages = [
];
PULSE_DEFAULT_CONFIG.roles.dev.displayedPages = [
];

// TOOLS
PULSE_DEFAULT_CONFIG.roles.manager.toollifemachine = {
  toolReport: 'Tool/ToolLifeEvents'
};
PULSE_DEFAULT_CONFIG.roles.support.toollifemachine = {
  toolReport: 'Tool/ToolLifeEvents'
};

// allowproductionbar
PULSE_DEFAULT_CONFIG.roles.manager.allowproductionbar = true;
PULSE_DEFAULT_CONFIG.roles.support.allowproductionbar = true;
PULSE_DEFAULT_CONFIG.roles.dev.allowproductionbar = true;

// Special for LIVE pages. These config will overload role config
PULSE_DEFAULT_CONFIG.roles.live.showlegend = 'true';
PULSE_DEFAULT_CONFIG.roles.live.menuType = 'textOrNothing';
PULSE_DEFAULT_CONFIG.roles.live.allowpagerotation = true;
PULSE_DEFAULT_CONFIG.roles.live.customTitle = true;
PULSE_DEFAULT_CONFIG.roles.live.showoverwriterequired = 'false';

// Special for Support
PULSE_DEFAULT_CONFIG.roles.support.cancelHorizontalSplitInBar = 'false';

// Special for DEV
PULSE_DEFAULT_CONFIG.roles.dev.allowpagerotation = false;
PULSE_DEFAULT_CONFIG.roles.dev.customTitle = true;

PULSE_DEFAULT_CONFIG.roles.dev.cancelHorizontalSplitInBar = 'false';
PULSE_DEFAULT_CONFIG.roles.dev.showAutoReasonsWhenMotion = true;
PULSE_DEFAULT_CONFIG.roles.dev.showUnknownAlarm = true; // used in x-detailedalarmsat and currenticoncncalarm
PULSE_DEFAULT_CONFIG.roles.dev.showIgnoredAlarm = true; // used in x-detailedalarmsat and currenticoncncalarm

// BARS - clicks on bar
PULSE_DEFAULT_CONFIG.roles.operator.showcoloredbar = {
  click: {
    allbars: 'change',
    cncvalue: 'popup'
  },
  showdetails: [
  ],
  showpopup: [
  ]
};
PULSE_DEFAULT_CONFIG.roles.manager.showcoloredbar = {
  click: {
    allbars: 'details'
  },
  showdetails: [ // == general + detailedproductionstateat
  ],
  showpopup: [ //clickDisplayedPopup: [  == same as default - mandatory to allow single change
  ]
};

// BARS - Show ALL + click on any bar
PULSE_DEFAULT_CONFIG.roles.dev.showcoloredbar = {
  shift: true,
  machinestate: true,
  observationstate: true,
  // middle
  cycle: true,
  operation: true,
  isofile: true,
  cncalarm: false, //true, // Removed because too slow (cf NR-2019-05)
  redstacklight: true,
  cncvalue: true,
  click: {
    allbars: 'details', // each bar can be overloaded. Possible values: none, change, popup, details
    //redstacklight: 'details',
    reason: 'change',
    cncvalue: 'popup'
  },
  showdetails: [
  ],
  showpopup: [
  ]
};

// BARS - for support = default + detailedmachinestateat (overloaded for)
PULSE_DEFAULT_CONFIG.roles.support.showcoloredbar = {
  click: {
    allbars: 'details'
  },
  showdetails: [
  ],
  showpopup: [
  ]
};

/* ********** ********** ********** ********** */
// roles / pages config - for pulse web app
// CAN be overload in custom config
/* ********** ********** ********** ********** */
PULSE_DEFAULT_CONFIG.rolespages = {
  // EVERYTHING CAN BE OVERLOADED here in CUSTOM file !  
  live: {
    operationstatus: {
      canUseRowsToSetHeight: true
    },
    performancegauge: {
      canUseRowsToSetHeight: true
    },
    utilizationpie: {
      canUseRowsToSetHeight: true
    },
    combinedview: {
      canUseRowsToSetHeight: true
    },
    machinestatus: {
      canUseRowsToSetHeight: true
    },
    machinespecification: {
      showoverwriterequired: false // Define default to allow overload
    }
  },
  manager: {
    machines: {
      componentsToDisplay: [
      ]
    },
    machinespecification: {
      showcoloredbar: {
        cncvalue: true
      },
      showoverwriterequired: true // Define default to allow overload
    },
    managementinformationterminal: {
      showRunningButton: true
    },
    running: {
      showcoloredbar: {
        cncvalue: true
      }
    }
  },
  support: {
    machines: {
      componentsToDisplay: [
      ]
    },
    machinespecification: {
      showcoloredbar: {
        cncvalue: true
      },
      showoverwriterequired: true // Define default to allow overload
    },
    managementinformationterminal: {
      showRunningButton: true
    },
    operationstatus: {
      showUnknownAlarm: false, // used in x-detailedalarmsat and currenticoncncalarm
      showIgnoredAlarm: false, // used in x-detailedalarmsat and currenticoncncalarm
    },
    running: {
      showcoloredbar: {
        cncvalue: true
      }
    }
  },
  operator: {
    machines: {
      // Yes. Keep it empty to allow modifications
    },
    running: {
      // Yes. Keep it empty to allow modifications
    },
    machinespecification: {
      showoverwriterequired: true // Define default to allow overload
    }
  },
  dev: {
    machines: {
      componentsToDisplay: [
      ],
      showIgnoredAlarm: true // used in x-detailedalarmsat and currenticoncncalarm
    },
    managementinformationterminal: {
      showRunningButton: true,
      currentdisplay: {
        displayjobshiftpartcount: true,
        displayjob: true,
        displayshift: true,
        displaycncvalue: true
      }
    },
    running: {
      showUnknownAlarm: true, // used in x-detailedalarmsat and currenticoncncalarm
      showIgnoredAlarm: true, // used in x-detailedalarmsat and currenticoncncalarm

      currentdisplay: {
        displayjobshiftpartcount: true,
        displayjob: true,
        displayshift: true,
        displaycncvalue: true
      },

      showcoloredbar: {
        click: { // overload for dev
          reason: 'change',
          cncvalue: 'details'
        }
      }
    }
  }
};
