( function () {

  function lexxer( target ) {
    this.target = target;
    this.init();
  }

  let sc = 0;
  lexxer.S_Start          = sc++;
  lexxer.S_Pre            = sc++;
  lexxer.S_Marker_1       = sc++;
  lexxer.S_Marker_2       = sc++;
  lexxer.S_Post           = sc++;
  lexxer.S_Text           = sc++;
  lexxer.COUNT_STATES     = sc;
  lexxer.S_Error          = -1;

  lexxer.states = Object.keys( lexxer )
    .filter( e => "S_Error" != e )
    .filter( e => "S_" == e.substr(0,2) )
    .reduce( ( a, c ) => {
      a[ lexxer[ c ] ] = c.substr(2);
      return a;
    }, [] )
  ;

  let cc = 0;
  lexxer.C_Newline    = cc++;
  lexxer.C_Space      = cc++;
  lexxer.C_Marker     = cc++;
  lexxer.C_Other      = cc++;
  lexxer.COUNT_CHARS  = cc;

  let lc = 0;
  lexxer.L_Blank      = lc++;
  lexxer.L_Unmarked   = lc++;
  lexxer.L_Marker     = lc++;
  lexxer.L_Section    = lc++;
  lexxer.L_Preformatted = lc++;
  lexxer.L_Ordered    = lc++;
  lexxer.L_Unordered  = lc++;
  lexxer.L_Quote      = lc++;
  lexxer.L_Inclusion  = lc++;
  lexxer.L_Metadata   = lc++;
  lexxer.L_Reference  = lc++;
  lexxer.L_Corner     = lc++;
  lexxer.L_Edge       = lc++;
  lexxer.COUNT_LINES  = lc;

  lexxer.line_types = Object.keys( lexxer )
    .filter( e => "L_" == e.substr(0,2) )
    .reduce( ( a, c ) => {
      a[ lexxer[ c ] ] = c.substr(2);
      return a;
    }, [] )
  ;

  lexxer.StateFromState = [
    // [ newline, space, section, other ]
    [ lexxer.S_Start, lexxer.S_Pre,  lexxer.S_Marker_1, lexxer.S_Text ], // S_Start
    [ lexxer.S_Start, lexxer.S_Pre,  lexxer.S_Marker_1, lexxer.S_Text ], // S_Pre
    [ lexxer.S_Start, lexxer.S_Text, lexxer.S_Marker_2, lexxer.S_Text ], // S_Marker_1
    [ lexxer.S_Start, lexxer.S_Post, lexxer.S_Text,     lexxer.S_Text ], // S_Marker_2
    [ lexxer.S_Start, lexxer.S_Post, lexxer.S_Text,     lexxer.S_Text ], // S_Post
    [ lexxer.S_Start, lexxer.S_Text, lexxer.S_Text,     lexxer.S_Text ]  // S_Text
  ];

  lexxer.prototype.init = function() {
    this.state = lexxer.S_Start;
    this.line_type = lexxer.L_Blank;
    this.marker_indent = undefined;
    this.marker_type = undefined;
    this.text_indent = undefined;
    this.text = "";
    this.last = undefined;
    this.line = 0;
    this.column = 0;
    this.index = 0;
  };

  lexxer.prototype.lex_char = function ( c ) {

    // this.state is the state we reached from parsing
    // the last character.  next_state is the state we
    // will go to based on the current character.

    let next_state =
      lexxer.StateFromState
        [ this.state ]
        [ CharClassFromChar( c ) ];

    // If next_state or this.state are undefined, that
    // means the StateFromState table is probably wrong.
    // This is unrecoverable and means the code needs to
    // be fixed.

    if(
      ( undefined === next_state ) ||
      ( undefined === this.state )
    ) {
      throw new Error( `Invalid State Detected ${this.state} ${next_state}` );
    }

    // If we have a Marker_1 state followed by a Start
    // state, that means we had a single marker on a line
    // which means we interpret that marker as text.

    if(
      ( lexxer.S_Marker_1 == this.state ) &&
      [ lexxer.S_Text, lexxer.S_Start ].includes( next_state )
    ) {
      this.text += ':';
      this.line_type = lexxer.L_Unmarked;
      this.text_indent = this.column - 1;
    }

    // If we have Start or Pre states followed by a text
    // state, that means our line_type is Unmarked.

    if(
      ( [ lexxer.S_Start, lexxer.S_Pre, lexxer.S_Marker_1 ].includes( this.state ) ) &&
      ( lexxer.S_Text == next_state )
    ) {
      this.line_type = lexxer.L_Unmarked;
    }

    // If we made it to the Marker_2 state, then our line
    // type is L_Marker.

    if( lexxer.S_Marker_2 == this.state ) {
      this.line_type = lexxer.L_Marker;
    }

    // If we're currently looking at the second character
    // of a marker, check to make sure the two marker
    // characters are the same.
    if(
      ( lexxer.S_Marker_1 == this.state ) &&
      ( lexxer.S_Marker_2 == next_state )
    ) {
      if( this.last == c ) {

        // If the last marker character and the current
        // marker character are the same, we're one
        // character after where we need to set the
        // marker_indent to.  We also save the current
        // marker character to figure out what kind of
        // line we'll set this line to when we reach the
        // newline.

        this.marker_indent = this.column - 1;
        this.marker_type = c;
      } else {

        // If the last marker and current marker
        // characters aren't the same, then it's
        // an unmarked text line.

        next_state = lexxer.S_Text;
        this.text += this.last;
        this.text_indent = this.column - 1;
        this.line_type = lexxer.L_Unmarked;
      }
    }

    // If the next_state is S_Text and this.text_indent
    // is undefined, it means we've found the first text
    // character (ie non-blank, non-marker, non-newline)

    if(
      ( undefined == this.text_indent ) &&
      ( lexxer.S_Text == next_state )
    ) {
      this.text_indent = this.column;
    }

    // If we have a marker character followed by a
    // non-marker character, then the first marker
    // character is should be interpreted as text.

    if( lexxer.S_Text == next_state ) {
      this.text += c;
    }

    // If debug is set, emit a debug message

    if( true === this.debug ) {
      this.emitDebug( c, next_state );
    }

    this.column++;
    this.index++;

    // If we entered the S_Start state, call the line
    // method on the target. Then reset the column and
    // text string and increment the line number.

    if( lexxer.S_Start == next_state ) {
      if(
        ( "object" == typeof this.target ) &&
        ( "function" == typeof this.target.line )
      ) {
        if( lexxer.L_Marker == this.line_type ) {
//          console.log( `whanga: ${this.line_type} ${this.marker_type}` );
          this.line_type = LineTypeFromMarkerType( this.marker_type );
        }
        this.target.line.call( this.target, [ this.line_type, this.marker_indent, this.text_indent, this.text ] );
      }

      this.line_type = lexxer.L_Blank;
      this.marker_indent = undefined;
      this.marker_type = undefined;
      this.text_indent = undefined;
      this.text = "";
      this.line ++;
      this.column = 0;
    }

    this.last = c;
    this.state = next_state;
  };

  lexxer.prototype.emitDebug = function ( c, next_state ) {
    console.log( [ lexxer.states[ this.state ], c, lexxer.states[ next_state ], this.column, this.marker_indent, this.text_indent, this.text ] );
  };

  lexxer.prototype.lex = function( data ) {
    if( "string" == typeof data  ) {
      data.split("").forEach( function ( e ) {
        this.lex_char( e );
      }.bind( this ) );
    }
  };

  lexxer.prototype.final = function () {
    if( lexxer.S_Start != this.state ) {
      this.lex_char( "\n" );
    }
  };

  // This function takes a character and returns a
  // character class: Newline, Spacer, Marker or
  // Other.

  function CharClassFromChar( c ) {
    if( '\n' == c ) {
      return lexxer.C_Newline;
    } else if( ' ' == c ) {
      return lexxer.C_Space;
    } else if( ":.#*\"<;@+|".indexOf( c ) >= 0 ) {
      return lexxer.C_Marker;
    } else {
      return lexxer.C_Other;
    }
  }

  // This function is called if the line type is
  // "Marker" when we reach the end of the line.
  // It adjusts the line_type based on the marker_type
  // character.
  //
  // If you add a line type, you should add a character
  // in the indexOf line here.

  function LineTypeFromMarkerType( c ) {
    let line_type = ":.#*\"<;@+|".indexOf( c );
    if( line_type >= 0 ) {
      return 3 + line_type;
    } else {
      return 2;
    }
  }

  module.exports = lexxer;
} ) ();
