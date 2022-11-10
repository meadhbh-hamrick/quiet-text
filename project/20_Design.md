<h1>Quiet Text Tool Design Notes</h1>

<p class="abstract">

  Abstract:
  This document describes the design of the package's software components.
  We describe the lexxer and parser libraries and the warp and weft tools.

</p>

<p>

  <em>Portions of this document are Copyright (c) 2011, Meadhbh Hamrick. Used with permission of the author.</em>

</p>

<h2>Introduction</h2>

<p>

  All software components here are written in JavaScript.
  The <code>lexxer.js</code> and <code>parser.js</code> libraries are implemented as CommonJS modules.
  <code>Warp</code> and <code>weft</code> are implemented as executable JavaScript scripts.
  We expect users to include this package as a dependency in a package.json file and include the <code>parser.js</code> library or run the executable scripts with the <code>npx</code> command.

</p>

<p>

  The components are related to each other like this:

</p>

<p>

  <figure>
    <img src="./20_1_Component_Relation.png" alt="Relationship Between Components"/>
    <figcaption>Relationship Between Components</figcaption>
  </figure>

</p>

<ul>

  <li><code>Warp</code> is dependent on <code>parser.js</code></li>
  <li><code>Parser.js</code> is dependent on <code>lexxer.js</code></li>
  <li><code>Weft</code> is not dependent on either <code>parser.js</code> or <code>lexxer.js</code></li>

</ul>

<p>

  But the expected data-flow is this:

</p>

<p>

  <figure>
    <img src="./20_2_Data_Flow.png" alt="Expected Data Flow"/>
    <figcaption>Expected Data Flow</figcaption>
  </figure>

</p>

<ol>

  <li><code>Warp</code> converts a Quiet Text compliant text file into a Quiet Document Model (most likely represented as a JSON object.)</li>
  <li><code>Weft</code> uses the Quiet Document Model output from <code>Warp</code> and a <em>Handlebars</em> compatible template to convert the model into a HTML file (or HTML fragment).</li>

</ol>

<h2>lexxer.js</h2>

<p>

  <code>Lexxer.js</code> is a package which scans input quiet text, looking for <em>lexically significant character sequences</em>.
  This usually means things like newlines at the ends of lines and blanks at the beginnings of lines.
  To simplify the parser, the lexxer also groups lines of non-markup text as <em>text</em> symbols.

</p>

<p>

  For example, it would convert this text:

</p>

<pre>Sample Document

   In the history of all sample documents, this must
be the sampelest of them all.  Behold the exemplary
exampleness of it's text.  Marvel at the descriptive
mundanity of it's punctuation.

   Gasp at the author's bold use of two spaces after a
period. And witness, my dear friends, the complete
absence of the Oxford Comma.</pre>

<p>
  Into a sequence of <em>events</em> like this:
</p>

<ol>

  <li>Text "Sample Document"</li>

  <li>StartOfLine</li>

  <li>StartOfLine</li>

  <li>Indent 3</li>

  <li>Text "In the history of all sample documents, this must"</li>

  <li>StartOfLine</li>

  <li>Text "be the sampelest of them all.  Behold the exemplary"</li>

  <li>StartOfLine</li>

  <li>Text "exampleness of it's text.  Marvel at the descriptive"</li>

  <li>StartOfLine</li>

  <li>Text "mundanity of it's punctuation."</li>

  <li>StartOfLine</li>

  <li>StartOfLine</li>

  <li>Indent 3</li>

  <li>Text "Gasp at the author's bold use of two spaces after a"</li>

  <li>StartOfLine</li>

  <li>Text "period. And witness, my dear friends, the complete"</li>

  <li>StartOfLine</li>

  <li>Text "absence of the Oxford Comma."</li>

  <li>StartOfLine</li>

</ol>

<p>

  A few things to take away from this:

</p>

<ol>

  <li>Documents <strong>don't</strong> start with StartOfLine event.</li>

  <li>Documents end with a StartOfLine event to represent the notional blank line at the end of a document (even if the file doesn't end with a newline character.)</li>

  <li>Empty Text lines don't cause a Text event to be emitted.</li>

</ol>

<h2>parser.js</h2>

<p>

  <code>Parser.js</code> receives the events emitted from <code>lexxer.js</code> and converts them into a <em>Content Model</em>.
  It's useful to understand Quiet Text input to the lexxer uses the <em>Quiet Text Document Model</em> while output from the parser implements the <em>Quiet Text Content Model</em>.
  The two are related but not the same.
  The document model represents the format of the input Quiet Text model while the parser's content model is an abstract description of the content of the document model.

</p>

<p>

  For example, here is the content model of the previous example rendered as a JSON object:

</p>

<pre>{
  "type": "document",
  "meta": {
    "title": "Sample Document"
  },
  "content": [
    {
      "type": "paragraph",
      "meta": {
        "name": "/1"
      },
      "content": [
        {
          "type": "sentence",
          "content": "In the history of all sample documents, this must be the sampelest of them all."
        },
        {
          "type": "sentence",
          "content": "Behold the exemplary exampleness of it's text."
        },
        {
          "type": "sentence",
          "content": "Marvel at the descriptive mundanity of it's punctuation."
        }
      ]
    },
    {
      "type": "paragraph",
      "meta": {
        "name": "/2"
      },
      "content": [
        {
          "type": "sentence",
          "content": "Gasp at the author's bold use of two spaces after a period."
        },
        {
          "type": "sentence",
          "content": "And witness, my dear friends, the complete absence of the Oxford Comma."
        }
      ]
    }
  ]
}</pre>

<p>

  There's no reason the content model couldn't be rendered as XML, or ProtoBufs, or Avro or any other serialization format.
  But <code>parser.js</code> only supports JSON output.

</p>

<h2>The Quiet Text Document Model</h2>

<p>

  Quiet Text assumes all documents can be represented with this model:

</p>

<ol>

  <li>

    <p>
      All documents are made of a series of <em>Lines</em>.
      A line contains optional spaces, an optional marker, more optional spaces, optional text content and a newline sequence.
      A line with just a newline sequence is called a <em>Blank Line</em>.
      Here is a sample line:    
    </p>

  </li>

</ol>