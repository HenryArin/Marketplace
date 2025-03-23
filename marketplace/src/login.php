<?php
    require_once("config.php");
    require_once("cors.php");

    // If it's an API request
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST)) {
        $email = $_POST['emailaddress'];
        $password = $_POST['password'];
        
        $search = $db->prepare("SELECT hash FROM person where email = :Email");
        $search->bindValue(":Email", $email, SQLITE3_TEXT);
        $r = $search->execute();
        
        $hash = "";
        while($g = $r->fetchArray(SQLITE3_ASSOC)) {
            $hash = $g['hash'];
        }
        
        if (password_verify($password, $hash)) {
            echo "Login Successful!";
            exit;
        } else {
            echo "Login Failed!";
            exit;
        }
    }

    // If it's a regular form request, show the form
    require_once("nav.php");
    $insertForm = new PhpFormBuilder();
    $insertForm->add_input("Email: ", array(), "emailaddress");
    $insertForm->add_input("Password ", array(), "password");
    $insertForm->add_input("New", array(
        "type" => "submit",
        "value" => "Create"
    ), "loginAccount");
    $insertForm->build_form();
?>
