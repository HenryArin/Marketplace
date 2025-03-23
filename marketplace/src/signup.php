<?php
    require_once("config.php");
    require_once("cors.php");

    // If it's an API request
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST)) {
        $email = $_POST['emailaddress'];
        $password = $_POST['password'];
        
        // Check if email already exists
        $check = $db->prepare("SELECT email FROM person WHERE email = :Email");
        $check->bindValue(":Email", $email, SQLITE3_TEXT);
        $result = $check->execute();
        
        if ($result->fetchArray()) {
            echo "Email already exists!";
            exit;
        }
        
        // Insert new user
        $insert = $db->prepare("INSERT INTO person (email, hash) VALUES (:Email, :Phash)");
        $insert->bindValue(":Email", $email, SQLITE3_TEXT);
        $pswd = password_hash($password, PASSWORD_DEFAULT);
        $insert->bindValue(":Phash", $pswd, SQLITE3_TEXT);
        
        if ($insert->execute()) {
            echo "Account Successfully Created!";
        } else {
            echo "Error creating account!";
        }
        exit;
    }

    // If it's a regular form request, show the form
    require_once("nav.php");
    $insertForm = new PhpFormBuilder();
    $insertForm->add_input("Email: ", array(), "emailaddress");
    $insertForm->add_input("Password ", array(), "password");
    $insertForm->add_input("New", array(
        "type" => "submit",
        "value" => "Create"
    ), "createAccount");
    $insertForm->build_form();
?>
