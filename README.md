# node-term
A NodeJS module providing features of a traditional terminal for applications

# Usage

```js
const Terminal = require( './node-term.js' );
const terminal = new Terminal( {
  command: input => {},
  close: () => {},
  save: () => {},
  completion: (input, suggest) => {
    suggest('Hello, world!');
  },
  tabAutoComplete: true
} );
```

# Documentation

## Options

### `command( currentInput : string ) : boolean` *mandatory*

* Called upon the Enter key being read from the input stream
* Provides a single arguemnt - the user's current input
* Expects a Boolean return value - determines, whether the command is stored in command history

### `close( ) : undefined` *optional*

* Called upon `Control` + `C` key combination

### `save( ): undefined` *optional*

* Called upon `Control` + `S` key combination

### `completion( input : string, suggest: function )` *optional*

* Called when a change in input occurs and input is not empty
* `input` carries the user's current input
* `suggest` is a callback function expecting a string with the suggested input

### `tabAutoComplete : boolean` *optional*

* Defaults to `false`
* When set to `true`, user may press the `Tab` key to have the last suggested input auto-completed for them
