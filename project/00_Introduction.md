<h1>Introduction to the Quiet Text Project</h1>

<p><strong>From</strong> <a href="./00_Introduction.tqt">00_Introduction.tqt</a></p>

<p class="abstract">

  Abstract:
  Documentation in this directory relates to the Quiet Text Project (in contrast to Quiet Text Tools man-pages or a description of the Quiet Text conventions.)
  This specific document provides an overview to the project, it's documentation, how bugs and features are tracked and how you can provide comments or file bugs.
  Documents in this directory were written before the Quiet Text Web Site was constructed and overlap somewhat with the web site.
  Where the two differ, the <a href="#QuietTextWebSite">Quiet Text Web Site</a> should be considered authoritative, information here is likely historical.
  
</p>

<h2>What is Quiet Text and Why Should I Care?</h2>

<p>

  <strong>Quiet Text</strong> is a collection of conventions for extracting structure, style and content from plain text files.
  It differs from markup languages (including <a href="#MarkDown">MarkDown</a> and <a href="#DocBook">DocBook</a>) as it assumes the original text files have an existence independent of their use as the input to a process that produces HTML files.
  Quiet Text tools extract structure and style information from well formatted, <em>human readable</em> text files; files that will likely be the primary artifacts for projects.

</p>

<p>

  In short, I live in a terminal window and everything I write is text.
  Occasionally I need to turn those text files into HTML or PDF, but existing markup languages look "shouty" (or even "ugly".)
  Quiet Text lets me author pleasant looking text files I can edit in a terminal window with my favorite text editor.
  And when I need to convert them into HTML, it's not hard.

</p>

<p>

  The original motivation for writing Quiet Text tools was to support a personal Zettlekasten system and a static web site project.
  Later it became useful for a home-brew micro-blogging project and to construct product documentation.

</p>

<p>

  The tools and the Quiet Text "format" itself have undergone extensive refinement over several years.
  This project is an effort to rewrite "sub-optimal" code and in doing so force the Quiet Text conventions to stabilize.
  The project also provides an excuse to rewrite C code in JavaScript, something I believe will make development easy and will allow people to add Quiet Text support on the command line (where I live) and the web (where everyone else in the world seems to live.)

</p>

<p>

  If (like me) much of your daily document output is in text files, Quiet Text tools like ``warp`` and ``weft`` may make it easier to generate HTML and PDF versions of your docs while maintaining <em>pretty</em> text documents.

</p>

<p>

  If you find modern project wiki's or bug tracking tools sub-optimal, Quiet Text may be the cornerstone of an alternative.
  No offense to <a href="#Atlassian">Atlassian</a>, but I find <a href="#JIRA">JIRA</a> difficult to use and I have problems with the way Project Wikis (like <a href="#Confluence">Confluence</a>) are used in modern software development teams.
  As an alternative, I store project documentation (including information about tasks and objectives) in text files tracked in (mostly) git repositories.
  This allows me to use familiar, trusty tools (``emacs`` and ``vim``) to create and update docs and tickets while maintaining a project history with ``git`` (or sometimes ``hg``.)
  But we use the ``warp`` and ``weft`` tools to automagically generate HTML files to be perused by people who don't want to live in the terminal.
  And with the specification of <a href="#W3CPagedMedia">W3C Paged Media</a> and tools like <a href="#PrinceXML">PrinceXML</a>, <a href="#wkhtmltopdf">wkhtmltopdf</a>, <a href="#WeasyPrint">WeasyPrint</a> and <a href="#OtherFreeHTMLtoPDFUtilities">Other Free HTML to PDF Utilities</a>, it is easy to create substantial PDF texts using only a text editor and command line tools.

</p>

<p>

  If you use <a href="#MarkDown">MarkDown</a> or <a href="#DocBook">DocBook</a> to build HTML or PDF documents, you <em>may</em> find Quiet Text a decent alternative.

</p>

<h2>References</h2>

<ul>

<a name="QuietTextWebSite"></a><li><strong>QuietTextWebSite</strong> &mdash; <a href="https://quiet.meadhbh.hamrick.rocks/">https://quiet.meadhbh.hamrick.rocks/</a></li>
<a name="MarkDown"></a><li><strong>MarkDown</strong> &mdash; <a href="https://daringfireball.net/projects/markdown/">https://daringfireball.net/projects/markdown/</a></li>
<a name="DocBook"></a><li><strong>DocBook</strong> &mdash; <a href="https://docbook.org/">https://docbook.org/</a></li>
<a name="Atlassian"></a><li><strong>Atlassian</strong> &mdash; <a href="https://www.atlassian.com/">https://www.atlassian.com/</a></li>
<a name="JIRA"></a><li><strong>JIRA</strong> &mdash; <a href="https://www.atlassian.com/software/jira">https://www.atlassian.com/software/jira</a></li>
<a name="Confluence"></a><li><strong>Confluence</strong> &mdash; <a href="https://www.atlassian.com/software/confluence">https://www.atlassian.com/software/confluence</a></li>
<a name="W3CPagedMedia"></a><li><strong>W3CPagedMedia</strong> &mdash; <a href="https://www.w3.org/TR/css-page-3/">https://www.w3.org/TR/css-page-3/</a></li>
<a name="PrinceXML"></a><li><strong>PrinceXML</strong> &mdash; <a href="https://en.wikipedia.org/wiki/Prince_(software)">https://en.wikipedia.org/wiki/Prince_(software)</a></li>
<a name="wkhtmltopdf"></a><li><strong>wkhtmltopdf</strong> &mdash; <a href="https://wkhtmltopdf.org/">https://wkhtmltopdf.org/</a></li>
<a name="WeasyPrint"></a><li><strong>WeasyPrint</strong> &mdash; <a href="https://weasyprint.org/">https://weasyprint.org/</a></li>
<a name="OtherFreeHTMLtoPDFUtilities"></a><li><strong>OtherFreeHTMLtoPDFUtilities</strong> &mdash; <a href="https://alternativeto.net/software/prince-xml/">https://alternativeto.net/software/prince-xml/</a></li>
