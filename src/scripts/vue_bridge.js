// Copyright (C) 2009-2025 Atsora Solutions
// SPDX-License-Identifier: Apache-2.0

// --- Vue <-> Pulse integration (bridge) -------------------------------------
// All the glue that drives the embedded Vue app (atsora-vue) from Pulse, kept
// out of common_page.js so the generic page logic stays separate.
//
// The Vue app is mounted into #vue-app and exposes a bridge on window
// (see atsora-vue/src/pulse/bridges.ts + template.html):
//   window.__vueRouter              - Vue Router instance
//   window.__vueSetMachines(ids)    - push the selected machine ids to the Vue store
//   window.__vueSetSelection(sel)   - push the selection itself (groups or machines, with names)
//   window.__vueOpenExecDialog(id?) - open the task execution popup in the Vue app
//   window.__setLocale(locale)      - sync the Pulse language into Vue i18n
//   window.__loadVue()              - lazily import/mount the Vue bundle on demand
// and, the other way, Pulse exposes:
//   window.__pulseGetMachineSelection()  - current machine selection (as pushed by __vueSetSelection)
//   window.__pulseGetMachineDisplay(id)  - display name of a group or machine id
//   window.__pulseOpenMachineSelection() - open the machine selection dialog of the page
//   window.__pulseGetRole()              - web app key of the role of the user ('' when none)

import * as eventBus from 'eventBus';
import * as pulseLogin from 'pulseLogin';

function qs (sel) { return document.querySelector(sel); }

// Maps a Pulse nav page (vue-*) to its Vue router route.
var vuePageRoutes = {
  'vue-tasks': '/tasks',
  'vue-execution': '/execution'
};

// Accessor for the resolved machine-id cache owned by common_page (populated
// from machineListChanged). Injected so this module holds no selection state.
var _getResolvedMachines = function () { return []; };
function setResolvedMachinesGetter (fn) { _getResolvedMachines = fn; }

// Current machine id selection forwarded to Vue. Prefer the resolved cache
// (it expands group selections to their machine ids; getMachinesArray() only
// holds individually-picked machines and is empty for a group selection).
function getSelectedMachines () {
  var resolved = _getResolvedMachines();
  if (resolved && resolved.length > 0) {
    return [].concat(resolved);
  }
  var el = qs('x-machineselection');
  return (el && typeof el.getMachinesArray === 'function') ? el.getMachinesArray() : [];
}

// Current selection of x-machineselection as the user made it (groups, or
// individual machines), with the display names: shown by the Vue app (task form).
function getSelection () {
  var el = qs('x-machineselection');
  return (el && typeof el.getSelectionDisplays === 'function')
    ? el.getSelectionDisplays()
    : { kind: 'group', items: [] };
}

// Forward the machine selection (resolved ids + the selection itself) to Vue.
function pushSelectionToVue (ids) {
  if (window.__vueSetMachines) window.__vueSetMachines(ids);
  if (window.__vueSetSelection) window.__vueSetSelection(getSelection());
}

// x-machineselection loads its selection (and the names) after its first
// machineListChanged: forward it to Vue each time its display changes.
document.addEventListener('selectionDisplayChanged', function (event) {
  if (event.target && event.target.tagName === 'X-MACHINESELECTION' && window.__vueSetSelection) {
    window.__vueSetSelection(getSelection());
  }
});

// Vue -> Pulse: read the current selection (the push above may run before
// x-machineselection has loaded it).
window.__pulseGetMachineSelection = getSelection;

// Vue -> Pulse: display name of a group or machine id ('' when unknown)
window.__pulseGetMachineDisplay = function (id) {
  var el = qs('x-machineselection');
  return (el && typeof el.getDisplay === 'function') ? el.getDisplay(id) : '';
};

// Vue -> Pulse: open the machine selection dialog of the page, if it has one.
window.__pulseOpenMachineSelection = function () {
  var el = qs('x-machineselection');
  if (el && typeof el.changeMachineSelection === 'function') el.changeMachineSelection();
};

// Vue -> Pulse: role of the connected user (PulseRole cookie), so that the
// task execution lists the tasks of that role, not always the operator ones.
window.__pulseGetRole = function () {
  return pulseLogin.getRole();
};

// The Vue bundle is a deferred ES module, so the bridge may not be ready when a
// vue-* page is first prepared. Run cb as soon as window.__vueRouter exists.
function whenVueReady (cb) {
  if (window.__vueRouter) { cb(); return; }
  var attempts = 0;
  var timer = setInterval(function () {
    if (window.__vueRouter) { clearInterval(timer); cb(); }
    else if (++attempts > 100) clearInterval(timer); // give up after ~5s
  }, 50);
}

// Show the Vue container and navigate to the route for the given vue-* page.
function showVuePage (pageName) {
  var route = vuePageRoutes[pageName] || ('/' + pageName.replace('vue-', ''));
  var mainArea = qs('.pulse-mainarea');
  if (mainArea) mainArea.style.display = 'none';
  var container = qs('#vue-app-container');
  if (container) container.style.display = 'flex';
  whenVueReady(function () {
    pushSelectionToVue(getSelectedMachines());
    window.__vueRouter.push(route);
  });
}

// Forward the resolved machine ids to the Vue store while its container is
// visible. Called by common_page from the machineListChanged listener.
// The selection itself (only displayed) is always forwarded: at boot, the first
// machineListChanged may come before the container is shown.
function setMachines (ids) {
  var container = qs('#vue-app-container');
  if (window.__vueSetMachines && container && container.offsetParent !== null) {
    pushSelectionToVue(ids);
  }
  else if (window.__vueSetSelection) {
    window.__vueSetSelection(getSelection());
  }
}

// Open a task instance in the Vue execution popup (overlay over the current Pulse
// page). The Vue app is mounted lazily on first use (window.__loadVue). No nav.
function openTaskInstance (id) {
  if (id == null || id === '') return;
  if (window.__vueOpenExecDialog) {
    window.__vueOpenExecDialog(String(id));
    return;
  }
  if (window.__loadVue) window.__loadVue();
  whenVueReady(function () {
    pushSelectionToVue(getSelectedMachines());
    if (window.__vueOpenExecDialog) window.__vueOpenExecDialog(String(id));
  });
}

// Register the global 'openTaskInstance' listener — task components (x-task,
// x-taskslist, x-cycletask) dispatch it when a task is clicked.
function registerTaskClickListener (ctx) {
  eventBus.EventBus.addGlobalEventListener(ctx, 'openTaskInstance', function (event) {
    var id = (event.target && event.target.id) || event.id;
    openTaskInstance(id);
  });
}

// On a vue-* page loaded directly (e.g. vue-tasks.html): reveal the container,
// route to it, and open a task forwarded via ?openTask= once the bridge is ready.
function handleVuePageLoad (pageName, pendingTaskId) {
  showVuePage(pageName);
  if (pendingTaskId) {
    whenVueReady(function () {
      if (window.__vueOpenExecDialog) window.__vueOpenExecDialog(String(pendingTaskId));
    });
  }
}

export { setResolvedMachinesGetter };
export { getSelectedMachines };
export { whenVueReady };
export { showVuePage };
export { setMachines };
export { openTaskInstance };
export { registerTaskClickListener };
export { handleVuePageLoad };
