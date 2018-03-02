const {CompositeDisposable} = require('atom')

module.exports = {
  activate () {
    this.disposables = new CompositeDisposable(
      atom.commands.add('atom-text-editor:not([mini])', {
        'outlet:close': () => withFirstVisibleOutlet(outlet => outlet.destroy()),
        'outlet:relocate': () => withFirstVisibleOutlet(outlet => outlet.relocate()),
        'outlet:toggle': () =>
          withFirstVisibleOutlet(outlet => {
            outlet.toggle()
            updateWorkspaceClass()
          }),
        'outlet:hide': () =>
          withFirstVisibleOutlet(outlet => {
            outlet.hide()
            updateWorkspaceClass()
          }),
        'outlet:focus': () => withFirstOutlet(outlet => outlet.element.focus())
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

function withFirstOutlet (fn) {
  const visibleOutlet = getVisibleEditors().find(isOutlet)
  if (visibleOutlet) {
    fn(visibleOutlet)
  } else {
    const outlet = atom.workspace.getTextEditors().find(isOutlet)
    if (outlet) {
      fn(outlet)
    }
  }
}

function withFirstVisibleOutlet (fn) {
  const outlet = getVisibleEditors().find(isOutlet)
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
      console.log(classList)
    }
  })
}
