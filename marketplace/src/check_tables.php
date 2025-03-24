<?php
try {
    $db = new SQLite3('../sql/marketplace.db');
    
    // Query to get all tables
    $query = "SELECT name FROM sqlite_master WHERE type='table'";
    $result = $db->query($query);
    
    echo "Tables in database:\n\n";
    
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        echo $row['name'] . "\n";
        
        // Get table schema
        $schema = $db->querySingle("SELECT sql FROM sqlite_master WHERE type='table' AND name='" . $row['name'] . "'");
        echo "Schema: " . $schema . "\n";
        echo "----------------------------------------\n";
    }
    
    $db->close();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?> 