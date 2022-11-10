<h1>Quiet Text Tool Design Notes</h1>

<p><strong>From</strong> <a href="./20_Design.tqt">20_Design.tqt</a></p>

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

  <li><p>All documents are made of a series of <em>Lines</em>.
      A line contains optional spaces, an optional marker, more optional spaces, optional text content and a newline sequence.
      A line with just a newline sequence is called a <em>Blank Line</em>.
      Here is a sample line:</p>
      <pre>:: Section 4: Odysseus and the Lotus Eaters</pre>
      <p>It contains a few spaces at the beginning, a section marker (::), another
      space, some text and (presumably) a newline at the end.</p></li>

  <li><p>Lines group together to form <em>Blocks</em>.
      Blocks are separated from one another using one or more blank lines or by a block marker.
      Blocks can be <em>Paragraph Blocks</em>, <em>Section Blocks</em>, <em>Preformatted Blocks</em>, <em>List Blocks</em>, <em>Quote Blocks</em>, <em>Inclusion Blocks</em> or <em>Metadata Blocks</em>.</p>
    <p>Here is an example of a section block, a metadata block and four paragraph blocks:</p>
    <pre>:: Is Email Dead?
;; Updated -- 2022-11-10T07:29:00-0800
   It was a rainy night; cold too.  I got the call from
the 5th precinct.  Another protocol had taken the long
trip to nowheres-ville.
   "Whadda we got here, Charlie?" I asked O'Malley, the
flatfoot in charge of keeping the press hounds at bay.
   "Not sure, sir" he mewled back.  Something was wrong.
O'Malley was shaken up. He was a good cop; something was
definitely wrong.
   "Okay, let's take a look at the corpse."  O'Malley
took a deep breath and lifted up the sheet.  I gasped out
loud.  Damn if it wasn't Mr. Killer-App himself: EMail.</pre>
    <p>The section block starts with a double colon (::).
      The text following it is interpreted to be a section title.
      Section titles <em>can</em> be more than one line using indentation rules described below.</p>
    <p>The metadata block starts with a double semi-colon (;;).
      The text following it is interpreted as a metadata key/value pair.
      In this example, it tells us the time the section was last updated.
      We recognize that the metadata marker denotes a new section because it's marker is different from the previous block's marker.</p>
    <p>The first line in each of the paragraphs in this example are indented by three spaces.
      And the subsequent lines in each paragraph are all un-indented (i.e. - they have an indentation level of 0.)
      This is sufficient for the parser to recognize they're different blocks.
      Other examples in this document will show paragraphs where each line is non-indented, but paragraphs are separated by blank lines.</p></li>

  <li><p>By convention, if the first line of a document is a paragraph, that paragraph represents the title of the document.
      A document that starts with a blank line has no title.</p>
    <p>Metadata following the title (or blank first line) but before any non-metadata block, represents <em>Document Metadata</em> and applies to the document, not to any of it's components.</p>
    <p>In this example we have a title, two metadata blocks and three paragraphs.</p>
    <pre>Joe and the King
&nbsp;
;; Author -- Meadhbh Hamrick
;; Copyright Date -- 2011
&nbsp;
"Be careful Joe," she said, "The King is the craftiest
ring-writer this side of Yakima."
&nbsp;
"I know, I know," Joe replied, irritated.  He knew the
king's reputation.  In the writing arena, few could
contend with his prowess.
&nbsp;
Just then Joe's writing partner Carl pushed through the
crowd to give him a few pearls of last minute wisdom.
"Don't engage him with plot.  I've seen him weave
complications a fifth year philosophy student couldn't
figure out."  Carl meant well, but another distraction
was the last thing Joe needed at the moment.</pre>
    <p>In this example, we know the title of the document is "Joe and the King".
      If we were to render a copyright notice, it would look like <em>Copyright (c) 2011, Meadhbh Hamrick. All Rights Reserved</em>.</p>
    <p>There is no explicit list of canonical metadata keys, but the following metadata keys are common: Name, Title, Author, Created, Updated, Copyright, Publisher, License, Caption and Abstract.
      The <em>Name</em> metatdata key sets an explicit name for the block which the weft tool uses to create a HTML anchor (fragment target).</li>

  <li><p>Quiet Text also recognizes a few //Metadata Prefixes//.
      If, in the document metadata section at the top of the document, you include a paragraph that begins with "By ", the rest of the paragraph defines an Author's name.
      If you include a paragraph that begins with "Copyright (c)", it's assumed to define copyright metadata.
      Other prefixes include:</p>
    <table>
      <thead>
        <tr>
          <th>Prefix</th>
          <th>Meaning</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>By</td>
          <td>Author attribution</td>
        </tr>
        <tr>
          <td>Copyright (c</td>
          <td>Copyright</td>
        </tr>
        <tr>
          <td>Licensed under</td>
          <td>License</td>
        </tr>
        <tr>
          <td>Doc License</td>
          <td>License only for documentation</td>
        </tr>
        <tr>
          <td>Code License</td>
          <td>License only for code</td>
        </tr>
        <tr>
          <td>Abstract</td>
          <td>Document Abstract</td>
        </tr>
      </tbody>
    </table></li>

  <li><p>Paragraph blocks may also feature <em>Hanging Indents</em>.
      This is where the first line of the paragraph is indented less than subsequent lines.
      This is encountered in legal documents and reference lists.</p>
    <pre>:: References
&nbsp;
Bush, Vannevar (1945). "As We May Think," //Atlantic
&nbsp;&nbsp;&nbsp;Monthly, July 1945//
&nbsp;
Bush, Vannevar (1991). "Memex Revisited," //From Memex to
&nbsp;&nbsp;&nbsp;hypertext: Vannevar Bush and the Mind's Machine//,
&nbsp;&nbsp;&nbsp;197-216
&nbsp;
J. Johnson //et al.// (1989). "The Xerox Star: a
&nbsp;&nbsp;&nbsp;retrospective," in //Computer//, vol. 22, no. 9,
&nbsp;&nbsp;&nbsp;pp. 11-26, Sept. 1989, doi: 10.1109/2.35211.</pre></li>

  <li><p>All lines in a paragraph, except the first, MUST share the same indention.
      As seen in the examples, the first line may be indented less, the same or more than subsequent lines.
      Where it is ambiguous, the author must separate paragraphs with blank lines.</p>
    <p>In this example, we see two paragraphs, but it's ambiguous which lines are in which paragraph:</p>
    <pre>   "Gecko, you have a right to know. Frankly, we have reports..."
   "Gecko," the colonel started.  "This damned campaign has
flipped over to quirks mode and reports are the border:
just turned red.  General staff fears it'll be dotted with
holes after the next event loop."</pre>
    <p>This <em>could</em> be two paragraphs, the first where all lines are indented by three characters and the second has no indentation.</p>
    <p>Or it <em>could</em> be two paragraphs, the first line in each indented by three characters.</p>
    <p>The author MUST place a blank line between the two to remove the ambiguity:</p>
    <pre>   "Gecko, you have a right to know. Frankly, we have reports..."
&nbsp;

&nbsp;&nbsp;&nbsp;"Gecko," the colonel started.  "This damned campaign has
flipped over to quirks mode and reports are the border:
just turned red.  General staff fears it'll be dotted with
holes after the next event loop."</pre></li>

  <li><p>Paragraphs MAY be thought of as a collection of sentences.
      Sentences are often separated by a period and two spaces or a period and a newline.</p>
    <p>But sometimes sentences end with single quotes, double quotes, parentheses, square braces, a question mark or an exclamation point.
      So the rule for ending a sentence is: a punctuation mark, an option ending character and then either two lines or a newline.
      Punctuation marks include a fullstop / period, question mark or exclamation point.
      Ending characters include a single quote, double quote, close parenthesis or close square brace.</p>
    <p>This rule allows the parser to properly identify sentences which contain initials like "H. L. Mencken".
      Ending a line in the middle of such a name could confuse the parser, so the author SHOULD ensure such a sequence occurs.</p>
    <pre>There is an experimental music ensemble in Dallas called
"BL Lacerta."  I once incorrectly thought it was "B. L.
Lacerta."
&nbsp;
If we did not have the "two periods after punctuation"
rule, the parser might think we were generating several
sentences when writing about H. L. Mencken.  But this
paragraph only contains two sentences, not four.</pre>
    <p>The first paragraph in this example incorrectly ends a line in the middle of the name "B. L. Lacerta."
      The parser will believe there are three sentences in that paragraph, not two.
      The author SHOULD reformat the text so it is unambiguous:</p>
    <pre>There is an experimental music ensemble in Dallas called
"BL Lacerta."  I once incorrectly thought it was
"B. L. Lacerta."</pre>
    <p>Or:</p>
    <pre>There is an experimental music ensemble in Dallas called
"BL Lacerta."  I once incorrectly thought it was "B. L. Lacerta."</pre>
    <p>The use of sentences is completely optional.
      If you don't follow the "punctuation and two spaces" rule, the parser will create paragraphs it thinks are made of one long sentence (unless you happen to end a line with a punctuation mark.)</p>
    <p>Sentences are used to reformat documents prior to checking into version control and after checking out of version control.
      Modern version control systems like Git and Mercurial produce "diffs" which are significantly more "human readable" when each sentence is on a single line of text.</p></li>

  <li><p><em>Section Blocks</em> begin with a <em>Section Marker</em> made of two colons (::).
      Text after the section marker is the <em>Section Title</em>.
      Section titles are optional.
      Another way to create a new section without a title is to use the triple-asterisk (&#x2a;&#x2a;&#x2a;) or the triple-dash (&#x2d;&#x2d;&#x2d;).
      If the only text on a line is three consecutive asterisks or three consecutive dashes, it denotes a new, titleless section.
      Titleless sections may be rendered as three asterisks, a horizontal line or a stylish graphic, depending on the renderer.
      The difference between a triple-asterisk or a triple-dash is purely aesthetic.
      Consider this example:
    <pre>:: New Section
&nbsp;
This is a paragraph in the "New Section" section.
&nbsp;
&#x2a;&#x2a;&#x2a;
&nbsp;
This is a paragraph in a new, untitled section.
&nbsp;
&#x2d;&#x2d;&#x2d;
&nbsp;
This is also a paragraph in a new, untitled section.</pre>
  <p>Sections may be nested within each other.
      If the title following two section markers begins at the same column, those sections are at the same <em>Section Level</em>.
      Section levels begin with "Level 1" and are the "highest" or "outermost" level.
      It is counter-intuitive that lower level numbers are considered "higher," but this is common usage.
      Each time there is a section whose title starts at a column previously unused, we "go down a level."
      The section marker (::) may be anywhere before the section title and it's position is not used to determine whether two sections are at the same level.
      Here is another example:</p>
  <pre>:: Level 1 Section Title
&nbsp;
::    Level 2 Section Title
&nbsp;
   :: Level 2 Section Title Number 2
&nbsp;
:: Level 1 Section Title Number 2
&nbsp;
&nbsp;&nbsp;&nbsp;:: Level 2 Section Title Number 3
&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;But this section is subordinate to
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"Level 1 Section Title Number 2."</pre>
  <p>You can have nested, untitled sections by changing the column the triple-asterisk or triple-dash marker starts on.</p>
  <pre>:: 3. Random Prose
&nbsp;
If you start the triple-asterisk marker in the same
column as the section title above, it will create a
peer section.  If you start it somewhere else, it will
create a nested section.
&nbsp;
&#x2a;&#x2a;&#x2a;
&nbsp;
This section is subordinate to the "3. Random Prose"
section.
&nbsp;
&#x2d;&#x2d;&#x2d;
&nbsp;
This section is also subordinate to the "3. Random
Prose" section, but we told the renderer that we
preferred a horizontal line instead of a section
divider.
&nbsp;
&nbsp;&nbsp;&nbsp;&#x2a;&#x2a;&#x2a;
&nbsp;
This section is a peer (at the same level) as the
"3. Random Prose" section.</pre>

</ol>