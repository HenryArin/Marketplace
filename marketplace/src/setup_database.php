<?php
require_once 'config.php';

try {
    // Create the dbs directory if it doesn't exist
    $dbDir = dirname(__DIR__) . '/dbs';
    if (!file_exists($dbDir)) {
        mkdir($dbDir, 0777, true);
    }

    // Create the database
    $db = new SQLite3($dbPath);

    // Create users table
    $db->exec('
        CREATE TABLE IF NOT EXISTS users (
            userID INTEGER PRIMARY KEY AUTOINCREMENT,
            emailaddress TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ');

    // Create listing table
    $db->exec('
        CREATE TABLE IF NOT EXISTS listing (
            listingID INTEGER PRIMARY KEY AUTOINCREMENT,
            listerID INTEGER NOT NULL,
            title TEXT NOT NULL,
            price TEXT NOT NULL,
            description TEXT NOT NULL,
            FOREIGN KEY (listerID) REFERENCES users(userID)
        )
    ');

    // Create images table
    $db->exec('
        CREATE TABLE IF NOT EXISTS images (
            imageID INTEGER PRIMARY KEY AUTOINCREMENT,
            listingID INTEGER NOT NULL,
            fullpath TEXT NOT NULL,
            FOREIGN KEY (listingID) REFERENCES listing(listingID)
        )
    ');

    // Create a test user if none exists
    $result = $db->query('SELECT COUNT(*) as count FROM users');
    $row = $result->fetchArray();
    
    if ($row['count'] == 0) {
        $db->exec('
            INSERT INTO users (emailaddress, password) 
            VALUES ("test@example.com", "' . password_hash('password123', PASSWORD_DEFAULT) . '")
        ');
    }

    echo "Database setup completed successfully!\n";
    echo "Test user created with email: test@example.com and password: password123\n";

} catch (Exception $e) {
    echo "Error setting up database: " . $e->getMessage() . "\n";
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?> 