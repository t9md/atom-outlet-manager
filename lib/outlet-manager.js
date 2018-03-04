let getVisibleEditors, isOutlet, updateWorkspaceClass

module.exports = class OutletManager {
  static init (utils) {
    getVisibleEditors = utils.getVisibleEditors
    isOutlet = utils.isOutlet
    updateWorkspaceClass = utils.updateWorkspaceClass
  }

  static close () {
    findVisibleOutlet(outlet => outlet.destroy())
  }

  static relocate () {
    findVisibleOutlet(outlet => outlet.relocate())
  }

  static focus () {
    findOutlet(outlet => outlet.focus())
  }

  static hide () {
    findVisibleOutlet(outlet => {
      outlet.hide()
      updateWorkspaceClass()
    })
  }

  static toggle () {
    const outlet = getVisibleEditors().find(isOutlet)
    if (outlet) {
      outlet.hide()
      updateWorkspaceClass()
    } else {
      // If hidden, it alwasy should be item in dock.
      // Since item cannot be hidden in center container.
      const outlet = atom.workspace.getTextEditors().find(isOutlet)
      if (outlet) {
        const dock = getDockForOutlet(outlet)
        dock.show()
        if (!isOutlet(dock.getActivePaneItem())) {
          dock.getActivePane().activateItem(outlet)
        }
        updateWorkspaceClass()
      }
    }
  }
}

// Call callback for first found outlet in following order
// 1. active
// 2. visible
// 3. invisible
function _findOutlet (visibleOnly = false, fn) {
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

function findVisibleOutlet (fn) {
  _findOutlet(true, fn)
}

function findOutlet (fn) {
  _findOutlet(false, fn)
}

function getDockForOutlet (outlet) {
  const location = atom.workspace
    .paneForItem(outlet)
    .getContainer()
    .getLocation()

  switch (location) {
    case 'left':
      return atom.workspace.getLeftDock()
    case 'right':
      return atom.workspace.getRightDock()
    case 'bottom':
      return atom.workspace.getBottomDock()
  }
}
