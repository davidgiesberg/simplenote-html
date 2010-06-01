<?php

$urlbase = "https://simple-note.appspot.com/api";

# Check for valid input
$command = $_SERVER['PATH_INFO']; # isset($_REQUEST['command']) && !empty($_REQUEST['command']) ? $_REQUEST['command'] : '';

#if(empty($command)):
#  exit();
#endif;

$url = $urlbase.$command."?".$_SERVER["QUERY_STRING"];

$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); # don't follow 301/302

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $postVars = array();;
  foreach ($_POST as $k => $v) {
    $postVars[] = $k . "=" . $v;
  }
  $postVars = implode("&", $postVars);
  curl_setopt ($ch, CURLOPT_POST, true);
  curl_setopt ($ch, CURLOPT_POSTFIELDS, $postVars);
}

curl_setopt($ch, CURLOPT_URL, $url);
$data = curl_exec($ch);
$curl_info = curl_getinfo($ch);

header($curl_info['http_code'], true, $curl_info['http_code']);
print_r($data);
curl_close($ch);
