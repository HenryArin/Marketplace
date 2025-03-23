<?php
    require_once("FormBuilder.php");
    $dbPath = dirname(__DIR__) . '/sql/marketplace.db';
    $db = new SQLite3($dbPath);
?>
