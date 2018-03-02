# atom-outlet-manager

Uniformly manage outlets in workspace from keyboard.  
The outlet is special TextEditor created by [atom-outlet][atom-outlet] library.

```coffeescript
'atom-workspace.has-outlet atom-text-editor.vim-mode-plus.normal-mode':
  'cmd-f': 'outlet:focus'

'atom-workspace.has-visible-outlet atom-text-editor.vim-mode-plus.normal-mode':
  'ctrl-g': 'outlet:close'
  'ctrl-cmd-t': 'outlet:relocate'
  'cmd-h': 'outlet:hide'

'atom-text-editor[outlet]':
  'cmd-w': 'core:close'
```

[atom-outlet]: https://github.com/t9md/atom-outlet
