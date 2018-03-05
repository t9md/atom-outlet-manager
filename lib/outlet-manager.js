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

  static toggleFocus () {
    findOutlet(outlet => outlet.toggleFocus())
  }

  static hide () {
    findVisibleOutlet(outlet => {
      outlet.hide()
      updateWorkspaceClass()
    })
  }

  static toggle () {
    const outlet = getActiveOutlet() || getVisibleEditors().find(isOutlet)
    if (outlet) {
      outlet.hide()
      updateWorkspaceClass()
    } else {
      // If hidden, it alwasy should be item in dock.
      // Since item cannot be hidden in center container.
      const outlet = atom.workspace.getTextEditors().find(isOutlet)
      if (outlet) {
        const dock = getDockForLocation(getLocationForItem(outlet))
        if (isOutlet(dock.getActivePaneItem())) {
          dock.getActivePaneItem().show()
        } else {
          outlet.show()
        }
        updateWorkspaceClass()
      }
    }
  }
}

function getActiveOutlet () {
  const activeItem = atom.workspace.getActivePane().getActiveItem()
  if (isOutlet(activeItem)) {
    return activeItem
  }
}

// Call callback for first found outlet in following order
// 1. active
// 2. visible
// 3. invisible
function _findOutlet (visibleOnly = false, fn) {
  let outlet = getActiveOutlet()
  if (outlet) {
    fn(outlet)
    return
  }

  outlet = getVisibleEditors().find(isOutlet)
  if (outlet) {
    fn(outlet)
    return
  }

  if (visibleOnly) {
    return
  }

  const outlets = atom.workspace.getTextEditors().filter(isOutlet)
  outlets.sort((a, b) => sortScoreForOutlet(b) - sortScoreForOutlet(a))
  outlet = outlets[0]
  if (outlet) {
    fn(outlet)
  }
}

const POINT_BY_LOCATION = {
  center: 2000,
  bottom: 400,
  left: 300,
  right: 300
}

function sortScoreForOutlet (outlet) {
  let point = 0

  const location = getLocationForItem(outlet)
  point += POINT_BY_LOCATION[location]

  if (location !== 'center') {
    if (getDockForLocation(location).getActivePaneItem() === outlet) {
      point += 1000
    }
  }
  return point
}

function findVisibleOutlet (fn) {
  _findOutlet(true, fn)
}

function findOutlet (fn) {
  _findOutlet(false, fn)
}

function getLocationForItem (item) {
  return atom.workspace
    .paneForItem(item)
    .getContainer()
    .getLocation()
}

function getDockForLocation (location) {
  switch (location) {
    case 'left':
      return atom.workspace.getLeftDock()
    case 'right':
      return atom.workspace.getRightDock()
    case 'bottom':
      return atom.workspace.getBottomDock()
  }
}
