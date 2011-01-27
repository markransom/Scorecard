<?php
  header('Content-Type: text/cache-manifest');
  echo "CACHE MANIFEST\n";

  $hashes = "";
  $club = "";

@clearstatcache();
$cache_time=filemtime("manifest.php");

if(!empty($_GET))
{
  $club=$_GET["include"];
  $hashes .= md5_file($club);
  $file_time=filemtime($club);
  $cache_time=($cache_time>$file_time)?$cache_time:$file_time;
}


  $dir = new RecursiveDirectoryIterator(".");
  foreach(new RecursiveIteratorIterator($dir) as $file) {
    if ($file->IsFile() &&
        substr($file->getFilename(), -4) != ".php" &&
        $file != "./scorecard.manifest" &&
        substr($file->getFilename(), -5) != ".html" &&
        substr($file->getFilename(), 0, 1) != ".")
    {
        echo $file . "\n";
        $hashes .= md5_file($file);
		$file_time=filemtime($file);
		$cache_time=($cache_time>$file_time)?$cache_time:$file_time;
    }
  }

  $header_text=("last-modified: " . gmdate("D, d M Y H:i:s",$cache_time) . " GMT");
  header($header_text);
  echo "# Hash: " . md5($hashes) . " // ".$header_text."\n";
?>
