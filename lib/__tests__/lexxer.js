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
  this.counts = {};
  this.lines = [];
  this.indents = [];
}

accumulate_mock.prototype.updateCounts = function( name ) {  
  if( "object" == typeof this.counts ) {
    if( "number" != typeof this.counts[ name ] ) {
      this.counts[ name ] = 1;
    } else {
      this.counts[ name ] ++;
    }
  }
};

accumulate_mock.prototype.StartOfLine = function() {
  this.target.current_indent = undefined;
  this.target.updateCounts.apply( this.target, [ "StartOfLine" ] );
};

accumulate_mock.prototype.Indent = function( indent ) {
  this.target.current_indent = indent;
  this.target.updateCounts.apply( this.target, [ "Indent" ] );
};

accumulate_mock.prototype.Text = function( text ) {
  this.target.updateCounts.apply( this.target, [ "Text" ] );
  this.target.lines.push( text );
  this.target.indents.push( this.target.current_indent );
};

let mock;

test( "Parse Undefined", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex();
  lexxer.final();
  
  // We gave it an empty array of strings meaning no characters were processed,
  // so each of the counts in the mock.counts object should be zero and so should
  // mock.lines.length.

  expect( mock.lines.length ).toBe( 0 );
  expect(
    Object.keys( mock.counts ).reduce( ( a, c ) => {
      if( a ) {
        return ( 0 === mock.counts[ c ] );
      }
    }, true )
  ).toBe( true );
  
} );

test( "Parse Empty String", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( "" );
  lexxer.final();
  
  // We gave it an empty string so no characters should have been processed,
  // so each of the counts in the mock.counts object should be zero and so should
  // mock.lines.length.

  expect( mock.lines.length ).toBe( 0 );
  expect(
    Object.keys( mock.counts ).reduce( ( a, c ) => {
      if( a ) {
        return ( 0 === mock.counts[ c ] );
      }
    }, true )
  ).toBe( true );
  
} );

test( "Parse A Line", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
//  lexxer.debug = true;
  lexxer.lex( "This is a single line of text." );
  lexxer.final();

  // We should have 1 StartOfLines and 1 Text emits.

  expect( mock.counts.StartOfLine ).toBe( 1 );
  expect( mock.counts.Text ).toBe( 1 );
  expect( mock.lines.length ).toBe( 1 );
} );

test( "Parse A Line with Two Calls to lex", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( "This is a single line of" );
  lexxer.lex( "text." );
  lexxer.final();

  // We should have 1 StartOfLines and 1 Text emits.

  expect( mock.counts.StartOfLine ).toBe( 1 );
  expect( mock.counts.Text ).toBe( 1 );
  expect( mock.lines.length ).toBe( 1 );
} );

test( "Parse Two Lines of Text", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
//  lexxer.debug = true;
  lexxer.lex( `This is a block with
two lines of text.` );
  lexxer.final();

  // We should have 2 StartOfLines and 2 Text emits.

  expect( mock.counts.StartOfLine ).toBe( 2 );
  expect( mock.counts.Text ).toBe( 2 );
  expect( mock.lines.length ).toBe( 2 );

  // And let's check that we're getting the whole line both times

  expect( mock.lines[0] ).toBe( "This is a block with" );
  expect( mock.lines[1] ).toBe( "two lines of text." );
} );

test( "Parse an Indented Line of Text", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
//  lexxer.debug = true;
  lexxer.lex( "   This is an indented line of text." );
  lexxer.final();
  
  // We should have 2 StartOfLines and 2 Text emits.

  expect( mock.counts.StartOfLine ).toBe( 1 );
  expect( mock.counts.Text ).toBe( 1 );
  expect( mock.counts.Indent ).toBe( 1 );
  expect( mock.lines.length ).toBe( 1 );

  // And let's check that we're getting the whole line both times

  expect( mock.lines[0] ).toBe( "This is an indented line of text." );

  // And that we know what column we indented to:

  expect( mock.indents[0] ).toBe( 3 );
} );


test( "Parse A Simple Document", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( `A Simple Document

This is a simple document which includes a title, a few
lines of text in a couple of blocks, submitted as a
single text string.` );
  lexxer.final();

  // We should have 5 lines

  expect( mock.lines.length ).toBe( 5 );

  // We should have 2 StartOfLines and 2 Text emits.

  expect( mock.counts.StartOfLine ).toBe( 5 );
  expect( mock.counts.Text ).toBe( 5 );
  expect( mock.counts.Indent ).toBe( undefined );
  expect( mock.lines.length ).toBe( 5 );

  // And let's check that we're getting the whole line both times

  expect( mock.lines[0] ).toBe( "A Simple Document" );
  expect( mock.lines[1] ).toBe( "" );
  expect( mock.lines[2] ).toBe( "This is a simple document which includes a title, a few" );
  expect( mock.lines[3] ).toBe( "lines of text in a couple of blocks, submitted as a" );
  expect( mock.lines[4] ).toBe( "single text string." );

  // And that we know what column we indented to:

  expect( mock.indents[0] ).toBe( undefined );
  expect( mock.indents[1] ).toBe( undefined );
  expect( mock.indents[2] ).toBe( undefined );
  expect( mock.indents[3] ).toBe( undefined );
  expect( mock.indents[4] ).toBe( undefined );

} );

test( "Once more with an indented block", () => {
  mock = new accumulate_mock();
  lexxer = new lexxer_class( mock );
  lexxer.lex( `A Simple Document

   This is an indented block.  Yay!

This is not an indented block.  Hoorah!` );
  lexxer.final();

  // We should have 5 lines

  expect( mock.lines.length ).toBe( 5 );

  // We should have 2 StartOfLines and 2 Text emits.

  expect( mock.counts.StartOfLine ).toBe( 5 );
  expect( mock.counts.Text ).toBe( 5 );
  expect( mock.counts.Indent ).toBe( 1 );
  expect( mock.lines.length ).toBe( 5 );

  // And let's check that we're getting the whole line both times

  expect( mock.lines[0] ).toBe( "A Simple Document" );
  expect( mock.lines[1] ).toBe( "" );
  expect( mock.lines[2] ).toBe( "This is an indented block.  Yay!" );
  expect( mock.lines[3] ).toBe( "" );
  expect( mock.lines[4] ).toBe( "This is not an indented block.  Hoorah!" );

  // And that we know what column we indented to:

  expect( mock.indents[0] ).toBe( undefined );
  expect( mock.indents[1] ).toBe( undefined );
  expect( mock.indents[2] ).toBe( 3 );
  expect( mock.indents[3] ).toBe( undefined );
  expect( mock.indents[4] ).toBe( undefined );

} );
