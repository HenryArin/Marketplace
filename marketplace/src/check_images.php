<?php
try {
    $db = new SQLite3('../sql/marketplace.db');
    
    // Query to get images for listing ID 5
    $query = "SELECT * FROM images WHERE listingID = 5";
    $result = $db->query($query);
    
    echo "Images for listing 'playing cards':\n\n";
    
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        echo "Image ID: " . $row['imageID'] . "\n";
        echo "Path: " . $row['fullpath'] . "\n";
        echo "Created at: " . $row['created_at'] . "\n";
        echo "----------------------------------------\n";
    }
    
    $db->close();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?> 