<?php
// Set explicit CORS headers for all origins
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 86400"); // 24 hours

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type to JSON
header('Content-Type: application/json');

// Disable displaying PHP errors to ensure clean JSON output
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE);

// Connect to the database
try {
    $db = new SQLite3('./sql/marketplace.db');
} catch (Exception $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get the request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate request data
if (!$data || !isset($data['sender_id']) || !isset($data['receiver_id']) || !isset($data['initial_message'])) {
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$senderId = $data['sender_id'];
$receiverId = $data['receiver_id'];
$initialMessage = $data['initial_message'];
$listingId = isset($data['listing_id']) ? $data['listing_id'] : null;

// Debug: Print the table structure to see the actual schema
$tables = $db->query("SELECT name FROM sqlite_master WHERE type='table';");
$tableData = [];
while ($table = $tables->fetchArray(SQLITE3_ASSOC)) {
    $tableName = $table['name'];
    $columns = $db->query("PRAGMA table_info($tableName);");
    $columnData = [];
    while ($column = $columns->fetchArray(SQLITE3_ASSOC)) {
        $columnData[] = $column['name'];
    }
    $tableData[$tableName] = $columnData;
}

// Check if conversation table exists and check its column names
if (!isset($tableData['conversation'])) {
    echo json_encode([
        'error' => 'Conversation table not found',
        'tables' => $tableData
    ]);
    exit;
}

// First, check if a conversation already exists between these users
// Use the column names from the database schema
$query = "SELECT id FROM conversation WHERE 
          (buyer_id = :sender_id AND seller_id = :receiver_id) OR 
          (buyer_id = :receiver_id AND seller_id = :sender_id)";

$stmt = $db->prepare($query);
if (!$stmt) {
    echo json_encode([
        'error' => 'Query preparation failed: ' . $db->lastErrorMsg(),
        'query' => $query,
        'schema' => $tableData
    ]);
    exit;
}

$stmt->bindValue(':sender_id', $senderId, SQLITE3_INTEGER);
$stmt->bindValue(':receiver_id', $receiverId, SQLITE3_INTEGER);
$result = $stmt->execute();
$existingConversation = $result->fetchArray(SQLITE3_ASSOC);

$conversationId = null;

if ($existingConversation) {
    // Conversation already exists
    $conversationId = $existingConversation['id'];
} else {
    // Create a new conversation
    $query = "INSERT INTO conversation (buyer_id, seller_id, created_at, listing_id) 
              VALUES (:sender_id, :receiver_id, datetime('now'), :listing_id)";
    
    $stmt = $db->prepare($query);
    if (!$stmt) {
        echo json_encode([
            'error' => 'Insert query preparation failed: ' . $db->lastErrorMsg(),
            'query' => $query
        ]);
        exit;
    }
    
    $stmt->bindValue(':sender_id', $senderId, SQLITE3_INTEGER);
    $stmt->bindValue(':receiver_id', $receiverId, SQLITE3_INTEGER);
    $stmt->bindValue(':listing_id', $listingId, SQLITE3_INTEGER);
    
    if (!$stmt->execute()) {
        echo json_encode([
            'error' => 'Failed to create conversation: ' . $db->lastErrorMsg()
        ]);
        exit;
    }
    
    $conversationId = $db->lastInsertRowID();
}

// Now add the initial message
if ($initialMessage) {
    $query = "INSERT INTO message (conversation_id, sender_id, message_text, created_at) 
              VALUES (:conversation_id, :sender_id, :message, datetime('now'))";
    
    $stmt = $db->prepare($query);
    if (!$stmt) {
        echo json_encode([
            'error' => 'Message query preparation failed: ' . $db->lastErrorMsg(),
            'query' => $query
        ]);
        exit;
    }
    
    $stmt->bindValue(':conversation_id', $conversationId, SQLITE3_INTEGER);
    $stmt->bindValue(':sender_id', $senderId, SQLITE3_INTEGER);
    $stmt->bindValue(':message', $initialMessage, SQLITE3_TEXT);
    
    if (!$stmt->execute()) {
        echo json_encode([
            'error' => 'Failed to send initial message: ' . $db->lastErrorMsg()
        ]);
        exit;
    }
}

// Return success response
echo json_encode([
    'status' => 'success',
    'message' => 'Conversation started',
    'conversation_id' => $conversationId
]);

$db->close();
?> 