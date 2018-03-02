const {CompositeDisposable} = require('atom')

function invokeVisible (name, updateElement) {
  findOutlet(true, outlet => {
    outlet[name]()
    if (updateElement) {
      updateWorkspaceClass()
    }
  })
}

function invoke (name, updateElement) {
  findOutlet(false, outlet => {
    outlet[name]()
    if (updateElement) updateWorkspaceClass()
  })
}

module.exports = {
  activate () {
    this.disposables = new CompositeDisposable(
      atom.commands.add('atom-text-editor:not([mini])', {
        'outlet:close': () => invokeVisible('destroy'),
        'outlet:relocate': () => invokeVisible('relocate'),
        'outlet:focus': () => invoke('focus'),
        'outlet:toggle': () => invoke('toggle', true),
        'outlet:hide': () => invokeVisible('hide', true)
      })
    )
    this.observeDockVisibilityChange()
    this.observeActivePaneItem()
  },

  deactivate () {
    this.disposables.dispose()
  },

  observeActivePaneItem () {
    atom.workspace.observePanes(pane => {
      pane.observeActiveItem(item => {
        updateWorkspaceClass(() => (isOutlet(item) ? true : hasVisibleOutlet()))
      })
    })
  },

  observeDockVisibilityChange () {
    const docks = [atom.workspace.getLeftDock(), atom.workspace.getRightDock(), atom.workspace.getBottomDock()]
    docks.forEach(dock => {
      dock.onDidChangeVisible(visible => {
        updateWorkspaceClass()
      })
    })
  }
}

function getVisibleEditors () {
  return atom.workspace
    .getVisiblePanes()
    .map(pane => pane.getActiveEditor())
    .filter(v => v)
}

function isOutlet (item) {
  return item && atom.workspace.isTextEditor(item) && item.element.hasAttribute('outlet')
}

// Call callback for first found outlet in following order
// 1. active
// 2. visible
// 3. invisible
function findOutlet (visibleOnly, fn) {
  const activeItem = atom.workspace.getActivePane().getActiveItem()
  if (isOutlet(activeItem)) {
    fn(activeItem)
    return
  }

  let outlet = getVisibleEditors().find(isOutlet)
  if (outlet) {
    fn(outlet)
    return
  }
  if (visibleOnly) {
    return
  }

  outlet = atom.workspace.getTextEditors().find(isOutlet)
  if (outlet) {
    fn(outlet)
  }
}

function hasVisibleOutlet () {
  return getVisibleEditors().some(isOutlet)
}

function hasOutlet () {
  return atom.workspace.getTextEditors().some(isOutlet)
}

let lastUpdateRequest
function updateWorkspaceClass (fn = hasVisibleOutlet) {
  lastUpdateRequest = fn

  atom.views.getNextUpdatePromise().then(() => {
    if (lastUpdateRequest) {
      const state = lastUpdateRequest()
      lastUpdateRequest = null

      const classList = atom.workspace.getElement().classList
      classList.toggle('has-visible-outlet', state)
      classList.toggle('has-outlet', state || hasOutlet())
    }
  })
}
