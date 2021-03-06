const {CompositeDisposable} = require('atom')
let OutletManager

module.exports = {
  activate (state) {
    if (state.outletIds) {
      const {outletIds} = state
      for (const editor of atom.workspace.getTextEditors()) {
        if (outletIds.includes(editor.id)) {
          editor.destroy()
        }
      }
    }

    this.disposable = atom.commands.add('atom-text-editor:not([mini])', {
      'outlet:close': () => this.OutletManager.close(),
      'outlet:relocate': () => this.OutletManager.relocate(),
      'outlet:focus': () => this.OutletManager.focus(),
      'outlet:toggle-focus': () => this.OutletManager.toggleFocus(),
      'outlet:toggle': () => this.OutletManager.toggle(),
      'outlet:hide': () => this.OutletManager.hide()
    })

    this.observeDockVisibilityChange()
    this.observeActivePaneItem()
  },

  deactivate () {
    this.disposable.dispose()
  },

  serialize () {
    const outlets = atom.workspace.getTextEditors().filter(isOutlet)
    return {outletIds: outlets.map(editor => editor.id)}
  },

  get OutletManager () {
    if (!OutletManager) {
      OutletManager = require('./outlet-manager')
      OutletManager.init({getVisibleEditors, isOutlet, updateWorkspaceClass})
    }
    return OutletManager
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
