const escapeCodes = {
	Reset: '\x1b[0m',
	Black: '\x1b[30m',
	Red: '\x1b[31m',
	Green: '\x1b[32m',
	Yellow: '\x1b[33m',
	Blue: '\x1b[34m',
	Magenta: '\x1b[35m',
	Cyan: '\x1b[36m',
	White: '\x1b[37m',
	BrightBlack: '\x1b[90m',
	BrightRed: '\x1b[91m',
	BrightGreen: '\x1b[92m',
	BrightYellow: '\x1b[93m',
	BrightBlue: '\x1b[94m',
	BrightMagenta: '\x1b[95m',
	BrightCyan: '\x1b[96m',
	BrightWhite: '\x1b97m',
	Bell: '\u0007',
	ClearLine: '\u001b[2K',
	LineFeed: '\u001b[G',
	NewLine: '\n',
	ResetBasic: '\r',
	Tab: '\t',
	ArrowUp: '\u001b[A',
	ArrowDown: '\u001b[B',
	ArrowRight: '\u001b[C',
	ArrowLeft: '\u001b[D',
	ControlC: '\u0003',
	ControlS: '\u0013',
	Backspace: '\u0008',
	Delete: '\u007f'
}

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

		this.escapeCodes = escapeCodes;

		this.input.setRawMode( true );
		this.input.setEncoding( 'utf8' );

		this.historyIterator = 0;
		this.inputHistory = [ ];

		this.inputOverride = undefined;
		this.lastSuggestion = undefined;
		this.currentInput = '';
		this.cursorIndex = 0;

		this.input.on( 'data', this.processInput );

		this.write = this.write.bind( this );
		this.processInput = this.processInput.bind( this );
		this.question = this.question.bind( this );
	}
	clearInput = ( ) => {
		this.output.write( this.escapeCodes.ClearLine + this.escapeCodes.LineFeed );
	}
	bell( ) {
		this.output.write( this.escapeCodes.Bell );
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
			case this.escapeCodes.NewLine:
			case this.escapeCodes.ResetBasic:
				this.historyIterator = 0;
				this.write( this.currentInput );
				const receiver = this.inputOverride || this.command;
				const save = receiver( this.currentInput );
				if( save != false ) this.inputHistory.push( this.currentInput ); 
				this.currentInput = '';
				this.cursorIndex = 0;
				this.clearInput( );
				break;
			case this.escapeCodes.ArrowUp: {
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
			case this.escapeCodes.ArrowDown: {
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
			case this.escapeCodes.ArrowRight:
				this.moveCursor( this.currentInput + 1 );
				break;
			case this.escapeCodes.ArrowLeft:
				this.moveCursor( this.currentInput - 1 );
				break;
			// Backspace
			case this.escapeCodes.Backspace:
			case this.escapeCodes.Delete:
				if( this.cursorIndex > 0 ) {
					this.cursorIndex--;
					this.output.write(`\u001b[${ this.cursorIndex + 1 }G`);
					this.currentInput = this.currentInput.slice( 0, -1 );
					this.clearInput( );
					this.output.write( this.currentInput );
					if( this.cursorIndex != 0 ) this.completions( );
				} else {
					this.bell( );
				}
				break;
			case this.escapeCodes.ControlC:
				if( !this.close ) {
					this.output.write( '\n' );
					process.exit( );
				} else {
					this.close( );
				}
				break;
			case this.escapeCodes.ControlS:
				if( this.save ) this.save( );
				break;
			case this.escapeCodes.Tab:
				if( !this.tabAutoComplete || !this.lastSuggestion ) return;
				this.currentInput += this.lastSuggestion;
				this.output.write( this.lastSuggestion );
				this.moveCursor( this.cursorIndex + this.lastSuggestion.length );
				break;
			default:
				this.output.write( key );
				this.output.write( this.escapeCodes.LineFeed );
				this.currentInput = this.currentInput.slice( 0, this.cursorIndex ) + key + this.currentInput.slice( this.cursorIndex );
				this.output.write( this.currentInput );
				this.cursorIndex++;
				this.output.write(`\u001b[${ this.cursorIndex + 1 }G`);
				this.completions( );
				break;
		}
	}
	// Overrides default input behavior
	question = callback => {
		this.inputOverride = input => {
			callback( input );
			this.inputOverride = undefined;
		}
	}
}

module.exports = Terminal;
