<?php
// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Set content type
header('Content-Type: application/json');

// Disable displaying PHP errors
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE);

try {
    // Connect to SQLite database
    $db = new SQLite3('./sql/marketplace.db');
} catch (Exception $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Check if conversation_id is provided
if (!isset($_GET['conversation_id'])) {
    echo json_encode(['error' => 'Missing conversation_id parameter']);
    exit;
}

$conversationId = $_GET['conversation_id'];

// Get messages for the conversation
$stmt = $db->prepare("
    SELECT 
        m.id as messageID,
        m.sender_id as senderID,
        m.message_text as text,
        m.created_at as timestamp,
        p.firstName,
        p.lastName
    FROM message m
    LEFT JOIN person p ON m.sender_id = p.personID
    WHERE m.conversation_id = :conversation_id
    ORDER BY m.created_at ASC
");

if (!$stmt) {
    echo json_encode(['error' => 'Query preparation failed: ' . $db->lastErrorMsg()]);
    exit;
}

$stmt->bindValue(':conversation_id', $conversationId, SQLITE3_INTEGER);
$result = $stmt->execute();

$messages = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $messages[] = [
        'messageID' => $row['messageID'],
        'senderID' => $row['senderID'],
        'senderName' => $row['firstName'] . ' ' . $row['lastName'],
        'text' => $row['text'],
        'timestamp' => $row['timestamp']
    ];
}

echo json_encode([
    'status' => 'success',
    'messages' => $messages
]);

$db->close();
?> 