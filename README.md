# atom-outlet-manager

Uniformly manage outlets in workspace from keyboard.  
The outlet is special TextEditor created by [atom-outlet][atom-outlet] library.

[atom-outlet]: https://github.com/t9md/atom-outlet


# What's this?

Provide command to manager outlets in workspace uniformly via keyboard.

### What's the outlet?

- Just instance of TextEditor with special attribute and methods.
- Outlet can easily
  - `open`(dock, center at adjacent-pane),
  - `toggle`
  - `hide`
  - `relocate`: relocate from `bottom` dock to `center` or vise versa.

### Which package create outlet?

- [atom-narrow](https://atom.io/packages/narrow): `narrow-editor` is outlet.
- [atom-transformer](https://atom.io/packages/transformer): each transformer write output to outlet.
- And some my locally used package.

### Then what's benefit?

Without requiring pkg specific command/keymap.

- Can focus currently opened outlets by keyboard.
- Can close opened outlets by keyboard.
- Can relocate opened outlets by keyboard.

# keymap example

```coffeescript
'atom-workspace':
  'cmd-h': 'outlet:toggle'

'atom-text-editor[outlet]':
  'cmd-w': 'core:close'

'atom-workspace.has-outlet atom-text-editor.vim-mode-plus.normal-mode':
  'cmd-f': 'outlet:focus'

'atom-workspace.has-visible-outlet atom-text-editor.vim-mode-plus.normal-mode':
  'ctrl-g': 'outlet:close'
  'ctrl-cmd-t': 'outlet:relocate'
```
