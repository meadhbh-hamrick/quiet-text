( function () {
  
  function lexxer( target ) {
    this.target = target;
    this.init();
  }

  let sc = 0;
  lexxer.S_StartOfLine = sc++;
  lexxer.S_Blank       = sc++;
  lexxer.S_Text        = sc++;
  lexxer.COUNT_STATES  = sc;
  lexxer.S_Error       = -1;
  
  lexxer.states = Object.keys( lexxer )
    .filter( e => "S_Error" != e )
    .filter( e => "S_" == e.substr(0,2) )
    .reduce( ( a, c ) => {
      a[ lexxer[ c ] ] = c.substr(2);
      return a;
    }, [] )
  ;

  let ec = 0;
  lexxer.E_StartOfLine = ec++;
  lexxer.E_Indent      = ec++;
  lexxer.E_Text        = ec++;
  lexxer.COUNT_EMITS   = ec;
  lexxer.E_Error       = -1;
  
  lexxer.emits = Object.keys( lexxer )
    .filter( e => "E_Error" != e )
    .filter( e => "E_" == e.substr(0,2) )
    .reduce( ( a, c ) => {
      a[ lexxer[ c ] ] = c.substr(2);
      return a;
    }, [] )
  ;

  let cc = 0;
  lexxer.C_Newline         = cc++;
  lexxer.C_Space           = cc++;
  lexxer.C_Other           = cc++;
  lexxer.COUNT_CHARS       = cc;

  lexxer.StateFromState = [
    // [ newline, space, other ]
    [ lexxer.S_StartOfLine, lexxer.S_Blank, lexxer.S_Text ], // S_StartOfLine
    [ lexxer.S_StartOfLine, lexxer.S_Blank, lexxer.S_Text ], // S_Blank
    [ lexxer.S_StartOfLine, lexxer.S_Text,  lexxer.S_Text ]  // S_Text
  ];
  
  lexxer.prototype.init = function() {
    this.state = lexxer.S_StartOfLine;
    this.text = "";
    this.line = 0;
    this.column = 0;
    this.index = 0;
  };

  lexxer.prototype.lex_char = function ( c ) {
    let next_state =
      lexxer.StateFromState
        [ this.state ]
        [ CharClassFromChar( c ) ];

    if( [ lexxer.S_StartOfLine ].includes( this.state ) ) {
      this.text = "";
      this.line ++;
      this.column = 0;
    }

    if( lexxer.S_Text == next_state ) {
      this.text += c;
    }
    
    if(
      ( lexxer.S_Blank == this.state ) &&
      ( lexxer.S_Text == next_state )
    ) {
      this.emit( lexxer.E_Indent, this.column );
    } else if ( lexxer.S_StartOfLine == next_state ) {
      this.emit( lexxer.E_Text, this.text );
      this.emit( lexxer.E_StartOfLine );
    }

    if( true === this.debug ) {
      this.emitDebug( c, next_state );
    }

    this.column ++;
    this.index++;

    if( lexxer.S_Error == next_state ) {
      throw new Error( "Invalid State Detected" );
    }

    this.state = next_state
  };

  lexxer.prototype.emit = function( e, text ) {
    if(
      ( e >= 0 ) &&
      ( e < lexxer.COUNT_EMITS ) &&
      ( "object" == typeof this.target )
    ) {
      let _f = this.target[ lexxer.emits[ e ] ];
      if( "function" == typeof _f ) {
        _f.apply( this, [...arguments].slice(1) );
      }
    }
  };

  lexxer.prototype.emitDebug = function ( c, next_state ) {
    console.log( [ lexxer.states[ this.state ], c, lexxer.states[ next_state ], this.column, this.text ] );
  };

  
  lexxer.prototype.lex = function( data ) {
    if( "string" == typeof data  ) {
      data.split("").forEach( function ( e ) {
        this.lex_char( e );
      }.bind( this ) );
    }
  };

  lexxer.prototype.final = function () {
    if( lexxer.S_StartOfLine != this.state ) {
      this.lex_char( "\n" );
    }
  };

  function CharClassFromChar( c ) {
    if( '\n' == c ) {
      return lexxer.C_Newline;
    } else if( ' ' == c ) {
      return lexxer.C_Space;
    } else {
      return lexxer.C_Other;
    }
  }
  
  module.exports = lexxer;
} ) ();
