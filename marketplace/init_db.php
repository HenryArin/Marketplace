<?php
// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Set content type
header('Content-Type: application/json');

// Database path
$dbPath = './sql/marketplace.db';

try {
    // Connect to the existing SQLite database
    $db = new SQLite3($dbPath);
    
    // Enable foreign keys
    $db->exec('PRAGMA foreign_keys = ON;');
    
    // Get existing tables
    $existingTables = [];
    $result = $db->query("SELECT name FROM sqlite_master WHERE type='table';");
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $existingTables[] = $row['name'];
    }
    
    // Create conversation table if it doesn't exist
    if (!in_array('conversation', $existingTables)) {
        $db->exec('
            CREATE TABLE conversation (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                buyer_id INTEGER NOT NULL,
                seller_id INTEGER NOT NULL,
                listing_id INTEGER,
                created_at TEXT NOT NULL,
                updated_at TEXT
            )
        ');
        echo json_encode(['message' => 'Conversation table created successfully']);
    } else {
        echo json_encode(['message' => 'Conversation table already exists']);
    }
    
    // Create message table if it doesn't exist
    if (!in_array('message', $existingTables)) {
        $db->exec('
            CREATE TABLE message (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL,
                sender_id INTEGER NOT NULL,
                message_text TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (conversation_id) REFERENCES conversation(id)
            )
        ');
        echo json_encode(['message' => 'Message table created successfully']);
    } else {
        echo json_encode(['message' => 'Message table already exists']);
    }
    
    // Check tables after creation
    $tables = [];
    $result = $db->query("SELECT name FROM sqlite_master WHERE type='table';");
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $tableName = $row['name'];
        $tables[] = $tableName;
        
        // Get columns for this table
        $columns = [];
        $columnsResult = $db->query("PRAGMA table_info($tableName);");
        while ($column = $columnsResult->fetchArray(SQLITE3_ASSOC)) {
            $columns[] = [
                'name' => $column['name'],
                'type' => $column['type']
            ];
        }
        
        $schema[$tableName] = $columns;
    }
    
    // Close the database connection
    $db->close();
    
    // Return success with schema information
    echo json_encode([
        'status' => 'success',
        'tables' => $tables,
        'schema' => $schema
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Database operation failed: ' . $e->getMessage()
    ]);
}
?> 