# atom-outlet-manager

Uniformly manage outlets in workspace from keyboard.  
The outlet is special TextEditor created by [atom-outlet][atom-outlet] library.

[atom-outlet]: https://github.com/t9md/atom-outlet

### keymap example

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
