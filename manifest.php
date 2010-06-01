<?php
// http://building-iphone-apps.labs.oreilly.com/ch06.html
  header('Content-Type: text/cache-manifest');
  echo "CACHE MANIFEST\n";

  $hashes = "";

  $dir = new RecursiveDirectoryIterator(".");
  foreach(new RecursiveIteratorIterator($dir) as $file) {
    if ($file->IsFile() && substr($file->getFilename(), 0, 1) != "." && !strpos($file, "/.") && !strpos($file, ".php"))
    {
      echo $file . "\n";
      $hashes .= md5_file($file);
    }
  }
  echo "# Hash: " . md5($hashes) . "\n";
?>
