<?php
// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Set content type
header('Content-Type: application/json');

// Disable displaying PHP errors to ensure clean JSON output
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE);

try {
    // Connect to SQLite database
    $db = new SQLite3('./sql/marketplace.db');
} catch (Exception $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get JSON request data
$requestData = json_decode(file_get_contents('php://input'), true);

// Validate request
if (!isset($requestData['conversation_id']) || !isset($requestData['sender_id']) || !isset($requestData['message_text'])) {
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$conversationId = $requestData['conversation_id'];
$senderId = $requestData['sender_id'];
$messageText = $requestData['message_text'];

// Verify the conversation exists and the sender is part of it
$stmt = $db->prepare("SELECT * FROM conversation WHERE id = :conversationId AND (buyer_id = :senderId OR seller_id = :senderId)");
if (!$stmt) {
    echo json_encode(['error' => 'Query preparation failed: ' . $db->lastErrorMsg()]);
    exit;
}

$stmt->bindValue(':conversationId', $conversationId, SQLITE3_INTEGER);
$stmt->bindValue(':senderId', $senderId, SQLITE3_INTEGER);
$result = $stmt->execute();

if (!$result || !$result->fetchArray()) {
    echo json_encode(['error' => 'Conversation not found or you are not part of this conversation']);
    exit;
}

// Insert the new message
$stmt = $db->prepare("INSERT INTO message (conversation_id, sender_id, message_text, created_at) VALUES (:conversationId, :senderId, :messageText, datetime('now'))");
if (!$stmt) {
    echo json_encode(['error' => 'Insert query preparation failed: ' . $db->lastErrorMsg()]);
    exit;
}

$stmt->bindValue(':conversationId', $conversationId, SQLITE3_INTEGER);
$stmt->bindValue(':senderId', $senderId, SQLITE3_INTEGER);
$stmt->bindValue(':messageText', $messageText, SQLITE3_TEXT);

if ($stmt->execute()) {
    $messageId = $db->lastInsertRowID();
    echo json_encode([
        'success' => true,
        'message_id' => $messageId
    ]);
} else {
    echo json_encode(['error' => 'Failed to send message: ' . $db->lastErrorMsg()]);
}

$db->close();
?> 