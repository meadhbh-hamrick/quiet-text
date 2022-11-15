const lexxer_class = require( "../lexxer" );

let lexxer;

test( "Instantiation and Consistency", () => {
  lexxer = new lexxer_class();

  // Test to make sure we imported a function here.

  expect( typeof lexxer_class ).toBe( "function" );

  // Did we return an object when instantiating lexxer_class?

  expect( typeof lexxer ).toBe( "object" );

  // Are the number of elements in lexxer_class.states equal to
  // lexxer_class.COUNT_STATES?

  expect( lexxer_class.COUNT_STATES ).toBe( lexxer_class.states.length );

  // Do each of the states in lexxer_class.states have a corresponding state
  // defined as lexxer_class.S_<name>?  And is it a number less than
  // lexxer_class.COUNT_STATES?

  expect(
    lexxer_class.states.reduce( ( a, c ) => {
      let current = lexxer_class[ `S_${c}` ];

      if( a ) {
        return (
          ( "number"== typeof current ) &&
          ( current < lexxer_class.COUNT_STATES )
        );
      } else {
        return false;
      }
      return a;
    }, true )
  ).toBe( true );

  // Is each of the state names lexxer_class.S_<name> in lexxer_class.states?

  expect(
    Object.keys( lexxer_class )
      .filter( e => "S_" == e.substr(0,2) )
      .reduce( ( a, c ) => {
        a[ lexxer_class[ c ] ] = c.substr(2);
        return a;
      }, [] )
      .reduce( (a, c) => {
        if( a ) {
          return lexxer_class.states.includes( c );
        } else {
          return false;
        }
      }, true )
  ).toBe( true );

} );

// The accumulate_mock function is a target for the lexxer that simply counts
// how many times each of the "EMITs" were emitted and how many characters were
// processed.

function accumulate_mock () {
  this.lines = [];
}

accumulate_mock.prototype.line = function( line ) {
  this.lines.push( line );
}

let mock;

test( "Parse Undefined", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex();
  lexxer.final();

  // We gave it an empty array of strings meaning no characters were processed,
  // so each of the counts in the mock.counts object should be zero and so should
  // mock.lines.length.
} );

test( "Parse Empty String", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( "" );
  lexxer.final();

} );

test( "Parse A Line", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( "This is a single line of text." );
  lexxer.final();

  expect( typeof mock ).toBe( "object" );
  expect( typeof mock.lines ).toBe( "object" );
  expect( Array.isArray( mock.lines ) ).toBe( true );
  expect( mock.lines.length ).toBe( 1 );
  expect( typeof mock.lines[0] ).toBe( "object" );
  expect( Array.isArray( mock.lines[0] ) ).toBe( true );
  expect( mock.lines[0].length ).toBe( 4 );
  expect( mock.lines[0][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[0][1] ).toBe( undefined );
  expect( mock.lines[0][2] ).toBe( 0 );
  expect( mock.lines[0][3] ).toBe( "This is a single line of text." );
} );

test( "Parse A Line with Two Calls to lex", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( "This is a single line of " );
  lexxer.lex( "text." );
  lexxer.final();

  expect( typeof mock ).toBe( "object" );
  expect( typeof mock.lines ).toBe( "object" );
  expect( Array.isArray( mock.lines ) ).toBe( true );
  expect( mock.lines.length ).toBe( 1 );
  expect( typeof mock.lines[0] ).toBe( "object" );
  expect( Array.isArray( mock.lines[0] ) ).toBe( true );
  expect( mock.lines[0].length ).toBe( 4 );
  expect( mock.lines[0][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[0][1] ).toBe( undefined );
  expect( mock.lines[0][2] ).toBe( 0 );
  expect( mock.lines[0][3] ).toBe( "This is a single line of text." );
} );

test( "Parse Two Lines of Text", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( `This is a block with
two lines of text.` );
  lexxer.final();

  expect( typeof mock ).toBe( "object" );
  expect( typeof mock.lines ).toBe( "object" );
  expect( Array.isArray( mock.lines ) ).toBe( true );
  expect( mock.lines.length ).toBe( 2 );
  expect( typeof mock.lines[0] ).toBe( "object" );
  expect( Array.isArray( mock.lines[0] ) ).toBe( true );
  expect( mock.lines[0].length ).toBe( 4 );
  expect( mock.lines[0][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[0][1] ).toBe( undefined );
  expect( mock.lines[0][2] ).toBe( 0 );
  expect( mock.lines[0][3] ).toBe( "This is a block with" );
  expect( typeof mock.lines[1] ).toBe( "object" );
  expect( Array.isArray( mock.lines[1] ) ).toBe( true );
  expect( mock.lines[1].length ).toBe( 4 );
  expect( mock.lines[1][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[1][1] ).toBe( undefined );
  expect( mock.lines[1][2] ).toBe( 0 );
  expect( mock.lines[1][3] ).toBe( "two lines of text." );
} );

test( "Parse an Indented Line of Text", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( "   This is an indented line of text." );
  lexxer.final();

  expect( typeof mock ).toBe( "object" );
  expect( typeof mock.lines ).toBe( "object" );
  expect( Array.isArray( mock.lines ) ).toBe( true );
  expect( mock.lines.length ).toBe( 1 );
  expect( typeof mock.lines[0] ).toBe( "object" );
  expect( Array.isArray( mock.lines[0] ) ).toBe( true );
  expect( mock.lines[0].length ).toBe( 4 );
  expect( mock.lines[0][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[0][1] ).toBe( undefined );
  expect( mock.lines[0][2] ).toBe( 3 );
  expect( mock.lines[0][3] ).toBe( "This is an indented line of text." );
} );


test( "Parse A Marked Line", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( ":: A Section Header" );
  lexxer.final();

  expect( typeof mock ).toBe( "object" );
  expect( typeof mock.lines ).toBe( "object" );
  expect( Array.isArray( mock.lines ) ).toBe( true );
  expect( mock.lines.length ).toBe( 1 );
  expect( typeof mock.lines[0] ).toBe( "object" );
  expect( Array.isArray( mock.lines[0] ) ).toBe( true );
  expect( mock.lines[0].length ).toBe( 4 );
  expect( mock.lines[0][0] ).toBe( lexxer_class.L_Section );
  expect( mock.lines[0][1] ).toBe( 0 );
  expect( mock.lines[0][2] ).toBe( 3 );
  expect( mock.lines[0][3] ).toBe( "A Section Header" );

} );

test( "Parse A Marked Line Without Post-Marker Blanks", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( "::A Section Header" );
  lexxer.final();

  expect( typeof mock ).toBe( "object" );
  expect( typeof mock.lines ).toBe( "object" );
  expect( Array.isArray( mock.lines ) ).toBe( true );
  expect( mock.lines.length ).toBe( 1 );
  expect( typeof mock.lines[0] ).toBe( "object" );
  expect( Array.isArray( mock.lines[0] ) ).toBe( true );
  expect( mock.lines[0].length ).toBe( 4 );
  expect( mock.lines[0][0] ).toBe( lexxer_class.L_Section );
  expect( mock.lines[0][1] ).toBe( 0 );
  expect( mock.lines[0][2] ).toBe( 2 );
  expect( mock.lines[0][3] ).toBe( "A Section Header" );
} );

test( "Parse A Simple Document", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
//  lexxer.debug = true;
  lexxer.lex( `A Simple Document

:: Section Header

This is a simple document which includes a title, a few
lines of text in a couple of blocks, submitted as a
single text string.` );
  lexxer.final();

  expect( typeof mock ).toBe( "object" );
  expect( typeof mock.lines ).toBe( "object" );
  expect( Array.isArray( mock.lines ) ).toBe( true );
  expect( mock.lines.length ).toBe( 7 );

  expect( typeof mock.lines[0] ).toBe( "object" );
  expect( Array.isArray( mock.lines[0] ) ).toBe( true );
  expect( mock.lines[0].length ).toBe( 4 );
  expect( mock.lines[0][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[0][1] ).toBe( undefined );
  expect( mock.lines[0][2] ).toBe( 0 );
  expect( mock.lines[0][3] ).toBe( "A Simple Document" );

  expect( typeof mock.lines[1] ).toBe( "object" );
  expect( Array.isArray( mock.lines[1] ) ).toBe( true );
  expect( mock.lines[1].length ).toBe( 4 );
  expect( mock.lines[1][0] ).toBe( lexxer_class.L_Blank );
  expect( mock.lines[1][1] ).toBe( undefined );
  expect( mock.lines[1][2] ).toBe( undefined );
  expect( mock.lines[1][3] ).toBe( "" );

  expect( typeof mock.lines[2] ).toBe( "object" );
  expect( Array.isArray( mock.lines[2] ) ).toBe( true );
  expect( mock.lines[2].length ).toBe( 4 );
  expect( mock.lines[2][0] ).toBe( lexxer_class.L_Section );
  expect( mock.lines[2][1] ).toBe( 0 );
  expect( mock.lines[2][2] ).toBe( 3 );
  expect( mock.lines[2][3] ).toBe( "Section Header" );

  expect( typeof mock.lines[3] ).toBe( "object" );
  expect( Array.isArray( mock.lines[3] ) ).toBe( true );
  expect( mock.lines[3].length ).toBe( 4 );
  expect( mock.lines[3][0] ).toBe( lexxer_class.L_Blank );
  expect( mock.lines[3][1] ).toBe( undefined );
  expect( mock.lines[3][2] ).toBe( undefined );
  expect( mock.lines[3][3] ).toBe( "" );

  expect( typeof mock.lines[4] ).toBe( "object" );
  expect( Array.isArray( mock.lines[4] ) ).toBe( true );
  expect( mock.lines[4].length ).toBe( 4 );
  expect( mock.lines[4][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[4][1] ).toBe( undefined );
  expect( mock.lines[4][2] ).toBe( 0 );
  expect( mock.lines[4][3] ).toBe( "This is a simple document which includes a title, a few" );

  expect( typeof mock.lines[5] ).toBe( "object" );
  expect( Array.isArray( mock.lines[5] ) ).toBe( true );
  expect( mock.lines[5].length ).toBe( 4 );
  expect( mock.lines[5][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[5][1] ).toBe( undefined );
  expect( mock.lines[5][2] ).toBe( 0 );
  expect( mock.lines[5][3] ).toBe( "lines of text in a couple of blocks, submitted as a" );

  expect( typeof mock.lines[6] ).toBe( "object" );
  expect( Array.isArray( mock.lines[6] ) ).toBe( true );
  expect( mock.lines[6].length ).toBe( 4 );
  expect( mock.lines[6][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[6][1] ).toBe( undefined );
  expect( mock.lines[6][2] ).toBe( 0 );
  expect( mock.lines[6][3] ).toBe( "single text string." );

} );

test( "Once more with an indented block", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( `A Simple Document

   This is an indented block.  Yay!

This is not an indented block.  Hoorah!` );
  lexxer.final();

  expect( typeof mock ).toBe( "object" );
  expect( typeof mock.lines ).toBe( "object" );
  expect( Array.isArray( mock.lines ) ).toBe( true );
  expect( mock.lines.length ).toBe( 5 );

  expect( typeof mock.lines[0] ).toBe( "object" );
  expect( Array.isArray( mock.lines[0] ) ).toBe( true );
  expect( mock.lines[0].length ).toBe( 4 );
  expect( mock.lines[0][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[0][1] ).toBe( undefined );
  expect( mock.lines[0][2] ).toBe( 0 );
  expect( mock.lines[0][3] ).toBe( "A Simple Document" );

  expect( typeof mock.lines[1] ).toBe( "object" );
  expect( Array.isArray( mock.lines[1] ) ).toBe( true );
  expect( mock.lines[1].length ).toBe( 4 );
  expect( mock.lines[1][0] ).toBe( lexxer_class.L_Blank );
  expect( mock.lines[1][1] ).toBe( undefined );
  expect( mock.lines[1][2] ).toBe( undefined );
  expect( mock.lines[1][3] ).toBe( "" );

  expect( typeof mock.lines[2] ).toBe( "object" );
  expect( Array.isArray( mock.lines[2] ) ).toBe( true );
  expect( mock.lines[2].length ).toBe( 4 );
  expect( mock.lines[2][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[2][1] ).toBe( undefined );
  expect( mock.lines[2][2] ).toBe( 3 );
  expect( mock.lines[2][3] ).toBe( "This is an indented block.  Yay!" );

  expect( typeof mock.lines[3] ).toBe( "object" );
  expect( Array.isArray( mock.lines[3] ) ).toBe( true );
  expect( mock.lines[3].length ).toBe( 4 );
  expect( mock.lines[3][0] ).toBe( lexxer_class.L_Blank );
  expect( mock.lines[3][1] ).toBe( undefined );
  expect( mock.lines[3][2] ).toBe( undefined );
  expect( mock.lines[3][3] ).toBe( "" );

  expect( typeof mock.lines[4] ).toBe( "object" );
  expect( Array.isArray( mock.lines[4] ) ).toBe( true );
  expect( mock.lines[4].length ).toBe( 4 );
  expect( mock.lines[4][0] ).toBe( lexxer_class.L_Unmarked );
  expect( mock.lines[4][1] ).toBe( undefined );
  expect( mock.lines[4][2] ).toBe( 0 );
  expect( mock.lines[4][3] ).toBe( "This is not an indented block.  Hoorah!" );
} );

test( "More Initial Markers", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( `:: Section Header
:
: Maybe some text
.. Preformatted Block
   .. Another Preformatted Block
## Ordered List
** Unordered List
"" Quote Block ""
<< Inclusion Block >>
;; Metadata == Block
@@
++----------++
|| whatever` );
  lexxer.final();

  console.log( mock.lines );
} );

test( "Debug", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( `:.
   .#
#* Test 1
   *" Test 2` );
  lexxer.final();

  console.log( mock.lines );
} );
