<?php
try {
    $db = new SQLite3('../sql/marketplace.db');
    
    // Query to get all listings
    $query = "SELECT l.*, p.email as lister_email 
              FROM listing l 
              LEFT JOIN person p ON l.listerID = p.personID";
    $result = $db->query($query);
    
    echo "Listings in database:\n\n";
    
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        echo "ID: " . $row['listingID'] . "\n";
        echo "Title: " . $row['title'] . "\n";
        echo "Description: " . $row['description'] . "\n";
        echo "Price: " . $row['price'] . "\n";
        echo "Created at: " . $row['created_at'] . "\n";
        echo "Sold: " . ($row['sold'] ? 'Yes' : 'No') . "\n";
        echo "Lister Email: " . $row['lister_email'] . "\n";
        echo "----------------------------------------\n";
    }
    
    $db->close();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?> 