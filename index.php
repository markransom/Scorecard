<!doctype html>
    <head>
        <meta charset="UTF-8" />
        <title>Scorecard</title>

        <style type="text/css" media="screen">@import "./lib/jqtouch/jqtouch.min.css";</style>
        <style type="text/css" media="screen">@import "./lib/themes/jqt/theme.min.css";</style>

        <script src="./lib/jqtouch/jquery.1.3.2.min.js" type="text/javascript" charset="utf-8"></script>
        <script src="./lib/jqtouch/jqtouch.min.js" type="application/x-javascript" charset="utf-8"></script>

        <script src="./lib/scorecard.js" type="application/x-javascript" charset="utf-8"></script>

       <style type="text/css" media="screen">
            body.fullscreen #home .info {
                display: none;
            }
        </style>
    </head>
    <body>
        <div id="home" class="current">
            <div class="toolbar">
                <h1>Scorecard</h1>
            </div>
			<h2>Senior League Clubs</h2>
            <ul class="rounded">

<?php
  $filename_array = array();
  $dir = new RecursiveDirectoryIterator(".");
  foreach(new RecursiveIteratorIterator($dir) as $file) {
    if ($file->IsFile() &&
    	substr($file->getFilename(), -5) == ".html" &&
    	substr($file->getFilename(), -10) <> "index.html")
    {
		$filename_array[]=ucwords(str_replace("_", " ",substr($file->getFilename(), 0, -5)));
    }
  }
  sort($filename_array);
  foreach($filename_array as $file) {
      echo '<li class="arrow"><a href="';
      echo str_replace(" ", "_",strtolower($file)),".html";
      echo '" target="_blank">';
      echo $file;
      echo '</a></li>';
      echo "\n";
  }
?>

            </ul>

            <div class="info">
                <p>Follow the link for your club, on the resulting page choose Add to Homepage.
                The scorecare features should then work even when in offline mode</p>
            </div>
        </div>

    </body>
</html>