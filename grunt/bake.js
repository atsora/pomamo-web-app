module.exports = {
  base: {
    files: [{
      expand: true,
      src: 'src/*.html',
      dest: 'dist-es2015/',
      flatten: true
    }]
  },
  index: {
    options: {
      content: { pagename: 'index' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/index.html'
    }]
  },
  login: {
    options: {
      content: { pagename: 'login' }
    },
    files: [{
      src: 'src/pages/template_login.html',
      dest: 'dist-es2015/login.html'
    }]
  },
  home: {
    options: {
      content: { pagename: 'home' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/home.html'
    }]
  },
  combinedview: {
    options: {
      content: { pagename: 'combinedview' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/combinedview.html'
    }]
  },
  machines: {
    options: {
      content: { pagename: 'machines' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/machines.html'
    }]
  },
  machinespecification: {
    options: {
      content: { pagename: 'machinespecification' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/machinespecification.html'
    }]
  },
  machinestatus: {
    options: {
      content: { pagename: 'machinestatus' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/machinestatus.html'
    }]
  },
  managerview: {
    options: {
      content: { pagename: 'managerview' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/managerview.html'
    }]
  },
  motionsummary: {
    options: {
      content: { pagename: 'motionsummary' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/motionsummary.html'
    }]
  },
  managementinformationterminal: {
    options: {
      content: { pagename: 'managementinformationterminal' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/managementinformationterminal.html'
    }]
  },
  mpmilestones:{
    options: {
      content: { pagename: 'mpmilestones' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/mpmilestones.html'
    }]

  },
  oeeview: {
    options: {
      content: { pagename: 'oeeview' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/oeeview.html'
    }]
  },
  operationstatus: {
    options: {
      content: { pagename: 'operationstatus' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/operationstatus.html'
    }]
  },
  operatordashboard: {
    options: {
      content: { pagename: 'operatordashboard' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/operatordashboard.html'
    }]
  },
  performancebar: {
    options: {
      content: { pagename: 'performancebar' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/performancebar.html'
    }]
  },
  performancegauge: {
    options: {
      content: { pagename: 'performancegauge' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/performancegauge.html'
    }]
  },
  plant: {
    options: {
      content: { pagename: 'plant' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/plant.html'
    }]
  },
  productionmachining: {
    options: {
      content: { pagename: 'productionmachining' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/productionmachining.html'
    }]
  },
  productiontracker: {
    options: {
      content: { pagename: 'productiontracker' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/productiontracker.html'
    }]
  },
  reservecapacity: {
    options: {
      content: { pagename: 'reservecapacity' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/reservecapacity.html'
    }]
  },
  running: {
    options: {
      content: { pagename: 'running' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/running.html'
    }]
  },
  scheduledstatus: {
    options: {
      content: { pagename: 'scheduledstatus' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/scheduledstatus.html'
    }]
  },
  toollife: {
    options: {
      content: { pagename: 'toollife' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/toollife.html'
    }]
  },
  utilizationbar: {
    options: {
      content: { pagename: 'utilizationbar' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/utilizationbar.html'
    }]
  },
  utilizationpie: {
    options: {
      content: { pagename: 'utilizationpie' }
    },
    files: [{
      src: 'src/pages/template.html',
      dest: 'dist-es2015/utilizationpie.html'
    }]
  },
  validatetoken: {
    options: {
      content: { pagename: 'validate' }
    },
    files: [{
      src: 'src/pages/template_login.html',
      dest: 'dist-es2015/validate.html'
    }]
  }
}
