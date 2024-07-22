class Terminal {
	constructor( options ) {
		this.command = options.command;
		this.close = options.close;
		this.input = options.input || process.stdin;
		this.output = options.output || process.stdout;
		this.completion = options.completion;
		this.save = options.save;
		this.prefix = options.prefix || '';
		this.tabAutoComplete = options.tabAutoComplete || false;

		this.input.setRawMode( true );
		this.input.setEncoding( 'utf8' );

		this.historyIterator = 0;
		this.inputHistory = [ ];

		this.lastSuggestion = undefined;
		this.currentInput = '';
		this.cursorIndex = 0;

		this.input.on( 'data', this.processInput );

		this.write = this.write.bind( this );
		this.processInput = this.processInput.bind( this );
	}
	clearInput = ( ) => {
		this.output.write( '\u001b[2K\u001b[G' );
	}
	bell( ) {
		this.output.write( '\u0007' );
	}
	moveCursor( index ) {
		if( this.cursorIndex < 0 || this.cursorIndex == this.currentInput.length ) {
			this.bell( );
			return;
		}
		this.cursorIndex = index;
		this.output.write(`\u001b[${ this.cursorIndex + 1 }G`);
	}
	write( string ) {
		this.clearInput( );
		this.output.write( string + '\n' );
		this.output.write( this.currentInput );
	}
	completions( ) {
		if( !this.completion ) return;
		this.completion( this.currentInput, suggestion => {
			this.lastSuggestion = suggestion;
			this.output.write( '\x1b[90m' + suggestion + '\x1b[0m' );
			this.output.write(`\u001b[${ this.cursorIndex + 1 }G`);
		} );
	}
	processInput = ( key ) => {
		switch( key ) {
			// Enter
			case '\n':
			case '\r':
				this.historyIterator = 0;
				this.write( this.currentInput );
				const save = this.command( this.currentInput );
				if( save != false ) this.inputHistory.push( this.currentInput ); 
				this.currentInput = '';
				this.cursorIndex = 0;
				this.clearInput( );
				break;
			// Arrow up
			case '\u001b[A': {
				this.historyIterator++;
				if( this.historyIterator > this.inputHistory.length ) {
					this.historyIterator--;
					this.bell( );
					break;
				}
				this.clearInput( );
				const previousCommand = this.inputHistory[ this.inputHistory.length - this.historyIterator ];
				this.output.write( previousCommand );
				this.currentInput = previousCommand;
				this.cursorIndex = previousCommand.length;
				break;
			}
			// Arrow down
			case '\u001b[B': {
				this.clearInput( );
				this.historyIterator--;
				if( this.historyIterator < 0 ) {
					this.historyIterator = 0;
					this.currentInput = '';
					this.cursorIndex = 0;
					this.bell( );
					break;
				}
				const previousCommand = this.inputHistory[ this.inputHistory - this.historyIterator ];
				this.output.write( this.previousCommand );
				this.currentInput = previousCommand;
				this.cursorIndex = previousCommand.length;
				break;
			}
			// Arrow right
			case '\u001b[C':
				this.moveCursor( this.currentInput + 1 );
				break;
			// Arrow left
			case '\u001b[D':
				this.moveCursor( this.currentInput - 1 );
				break;
			// Backspace
			case '\u0008':
			case '\u007f':
				if( this.cursorIndex > 0 ) {
					this.cursorIndex--;
					this.output.write(`\u001b[${ this.cursorIndex + 1 }G`);
					this.currentInput = this.currentInput.slice( 0, -1 );
					this.output.write( '\u001b[2K\u001b[G' );
					this.output.write( this.currentInput );
					if( this.cursorIndex != 0 ) this.completions( );
				} else {
					this.bell( );
				}
				break;
			// Ctrl+C
			case '\u0003':
				if( !this.close ) {
					this.output.write( '\n' );
					process.exit( );
				} else {
					this.close( );
				}
				break;
			// Ctrl+S
			case '\u0013':
				if( this.save ) this.save( );
				break;
			// Tab
			case '\t':
				if( !this.tabAutoComplete || !this.lastSuggestion ) return;
				this.currentInput += this.lastSuggestion;
				this.output.write( this.lastSuggestion );
				this.moveCursor( this.cursorIndex + this.lastSuggestion.length );
				this.lastSuggestion = undefiend;
				break;
			default:
				this.output.write( key );
				this.output.write( '\u001b[G' );
				this.currentInput = this.currentInput.slice( 0, this.cursorIndex ) + key + this.currentInput.slice( this.cursorIndex );
				this.output.write( this.currentInput );
				this.cursorIndex++;
				this.output.write(`\u001b[${ this.cursorIndex + 1 }G`);
				this.completions( );
				break;
		}
	}
}

module.exports = Terminal;
