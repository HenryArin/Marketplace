<?php
$dbPath = __DIR__ . '/marketplace.db';

// Check if database file exists
if (!file_exists($dbPath)) {
    echo "Creating new database file...\n";
}

// Create/connect to database
$db = new SQLite3($dbPath);

// Create tables
$db->exec('
CREATE TABLE IF NOT EXISTS person (
    personID INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    firstName TEXT,
    lastName TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)');

$db->exec('
CREATE TABLE IF NOT EXISTS listing (
    listingID INTEGER PRIMARY KEY AUTOINCREMENT,
    listerID INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price TEXT NOT NULL,
    sold INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listerID) REFERENCES person(personID)
)');

$db->exec('
CREATE TABLE IF NOT EXISTS images (
    imageID INTEGER PRIMARY KEY AUTOINCREMENT,
    listingID INTEGER NOT NULL,
    fullpath TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listingID) REFERENCES listing(listingID)
)');

// Insert test user if none exists
$result = $db->query('SELECT COUNT(*) as count FROM person');
$row = $result->fetchArray();
if ($row['count'] == 0) {
    $db->exec('
    INSERT INTO person (username, password, email, firstName, lastName)
    VALUES ("testuser", "' . password_hash("testpass", PASSWORD_DEFAULT) . '", "test@example.com", "Test", "User")
    ');
    echo "Created test user\n";
}

echo "Database setup complete!\n";
$db->close();
?> 