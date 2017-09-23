<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$url = 'http://207.154.234.13/mobile';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
$result = curl_exec($ch);
curl_close($ch);

echo $result;
