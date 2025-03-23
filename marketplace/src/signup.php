<?php
    require_once("config.php");
    require_once("nav.php");

    $insertForm = new PhpFormBuilder();

    $insertForm->add_input("First Name: ", array(), "firstname");
    $insertForm->add_input("Last Name: ", array(), "lastname");
    $insertForm->add_input("Username: ", array(), "username");
    $insertForm->add_input("Email: ", array(), "emailaddress");
    $insertForm->add_input("Password ", array(), "password");
    $insertForm->add_input("New", array(
        "type" => "submit",
        "value" => "Create"
    ), "createAccount");

    $insertForm->build_form();
    
    if (isset($_POST["createAccount"])) {
        $insert = $db->prepare("INSERT INTO person (username, fname, lname, email, hash) VALUES (:Uname, :Fname, :Lname, :Email, :Phash)");

        $insert->bindValue(":Uname", $_POST["username"], SQLITE3_TEXT);
        $insert->bindValue(":Fname", $_POST["firstname"], SQLITE3_TEXT);
        $insert->bindValue(":Lname", $_POST["lastname"], SQLITE3_TEXT);
        $insert->bindValue(":Email", $_POST["emailaddress"], SQLITE3_TEXT);
        $pswd = password_hash($_POST["password"], PASSWORD_DEFAULT);

        $insert->bindValue(":Phash", $pswd, SQLITE3_TEXT);

        $insert->execute();

        $le = $db->lastErrorMsg();
        if (strlen($le) > 0 && $le !== "not an error") {
            echo "<br>$le<br>";
        }

        echo "Account Successfully Created!<br>";
    }
?>
