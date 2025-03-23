<?php
    require_once("config.php");
    require_once("nav.php");

    $insertForm = new PhpFormBuilder();

    $insertForm->add_input("Email: ", array(), "emailaddress");
    $insertForm->add_input("Password ", array(), "password");
    $insertForm->add_input("New", array(
        "type" => "submit",
        "value" => "Create"
    ), "loginAccount");

    $insertForm->build_form();
    
    if (isset($_POST["loginAccount"])) {
        $search = $db->prepare("SELECT hash FROM person where email = :Email");

        $search->bindValue(":Email", $_POST["emailaddress"], SQLITE3_TEXT);
        
        $r = $search->execute();
        
        $le = $db->lastErrorMsg();
        if (strlen($le) > 0 && $le !== "not an error") {
            echo "<br>$le<br>";
        }

        $hash = "";
        while($g = $r->fetchArray(SQLITE3_ASSOC)) {
            $hash = $g['hash'];
        }
        
        if (password_verify($_POST["password"], $hash)) {
            echo "Login Successful!<br>";
        } else {
            echo "Login Failed!<br>";
        } 
    }
?>
