# node-term
A NodeJS module providing features of a traditional terminal for applications

# Usage

`js
const Terminal = require( './node-term.js' );
const terminal = new Terminal( {
  command: input => {} // Command event
  close: () => {} // Ctrl+C event
  save: () => {} // Ctrl+S event
  completion: (input, suggest) => {
    // Input carries the user's current input
    suggest('Hello, world!');
    // suggest( ) provides the user with suggestions
  },
  tabAutoComplete: true // When a suggestion is correct, just press tab to auto-complete
} );
`
