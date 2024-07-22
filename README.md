# node-term
A NodeJS module providing features of a traditional terminal for applications

### What is `node-term`?

Developed as a part of a bigger project, `node-term` aims to provide terminal-like behavior for you applications.

Many apps require some level of user input and often provide very limited experience, which is what `node-term` was designed for.

### Features

#### Command history

Allows the user to browse previously executed commands using `Arrow Up` and `Arrow Down` keys.

#### Suggestions & auto-completion

When command syntax gets a little more complicated, suggestions come to the rescue. The user is provided with a ghost text suggesting how they should continue writing their commands. If the suggestion is somewhat larger, or just out of pure laziness, the user can press `Tab` to have the suggested command automatically typed in for them.

#### Audio clues

When an incorrect input is provided the `ASCII Bell` character is sent, which often triggers and audio clue to get the user's attention.

#### Input override

Whenever you need specific input from the user, you can override the default input behavior and get the input directly

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

## Constructor options

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

## Methods

### `write( string : string ) : undefined`

* Writes text to the terminal
* Should be used to prevent CL & RF inconsistencies

### `question( callback : function ) : undefined`

* Overrides default input behavior
* Callback is called once `Enter` key pressed, carrying the user's input
