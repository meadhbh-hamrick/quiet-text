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