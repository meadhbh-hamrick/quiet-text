<h1>Quiet Text Tool Design Notes</h1>

<p class="abstract">

  Abstract:
  This document describes the design of the package's software components.
  We describe the lexxer and parser libraries and the warp and weft tools.

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
  <li><code>Weft</code> uses the Quiet Document Model output from <code>Warp</code> and a //Handlebars// compatible template to convert the model into a HTML file (or HTML fragment).</li>

</ol>

<h2>lexxer.js</h2>

<p>

  <code>Lexxer.js</code> is a package which scans input quite text, looking for <em>lexically significant character sequences</em>.
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
