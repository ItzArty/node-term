( async ( ) => {

	const Terminal = require( './node-term.js' );

	const terminal = new Terminal( {
		command: ( input, callback ) => {
			terminal.write( 'Hell yeah' );
		}
	} );

	setTimeout( ( ) => {

		terminal.question( input => {
			terminal.write( 'You answered: ' + input );
			return false;
		} );

	}, 5_000 );

} )( );