<?php
// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

// Get the request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate request data
if (!$data || !isset($data['conversation_id']) || !isset($data['user_id'])) {
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$conversationId = $data['conversation_id'];
$userId = $data['user_id'];

// Verify that the conversation exists and the user is part of it
$stmt = $db->prepare("
    SELECT * FROM conversation 
    WHERE id = :conversation_id 
    AND (buyer_id = :user_id OR seller_id = :user_id)
");

if (!$stmt) {
    echo json_encode(['error' => 'Query preparation failed: ' . $db->lastErrorMsg()]);
    exit;
}

$stmt->bindValue(':conversation_id', $conversationId, SQLITE3_INTEGER);
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$result = $stmt->execute();

if (!$result->fetchArray(SQLITE3_ASSOC)) {
    echo json_encode(['error' => 'Invalid conversation or user']);
    exit;
}

// Begin transaction to delete conversation and its messages
$db->exec('BEGIN TRANSACTION');

try {
    // Delete all messages in the conversation
    $stmt = $db->prepare("DELETE FROM message WHERE conversation_id = :conversation_id");
    $stmt->bindValue(':conversation_id', $conversationId, SQLITE3_INTEGER);
    $stmt->execute();

    // Delete the conversation
    $stmt = $db->prepare("DELETE FROM conversation WHERE id = :conversation_id");
    $stmt->bindValue(':conversation_id', $conversationId, SQLITE3_INTEGER);
    $stmt->execute();

    $db->exec('COMMIT');
    echo json_encode(['status' => 'success', 'message' => 'Conversation deleted successfully']);
} catch (Exception $e) {
    $db->exec('ROLLBACK');
    echo json_encode(['error' => 'Failed to delete conversation: ' . $e->getMessage()]);
}

$db->close();
?> 