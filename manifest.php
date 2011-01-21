<?php
  header('Content-Type: text/cache-manifest');
  echo "CACHE MANIFEST\n";

  $hashes = "";

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
    }
  }
  echo "# Hash: " . md5($hashes) . "\n";
?>
