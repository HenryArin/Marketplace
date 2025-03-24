<?php
// Include CORS headers
require_once('../cors.php');

// Set content type to JSON
header('Content-Type: application/json');

// Connect to the database
try {
    $db = new SQLite3('../../sql/marketplace.db');
} catch (Exception $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get the request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate request data
if (!$data || !isset($data['conversation_id']) || !isset($data['sender_id']) || !isset($data['message'])) {
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$conversationId = $data['conversation_id'];
$senderId = $data['sender_id'];
$message = $data['message'];

// Verify that the conversation exists and the sender is part of it
$query = "SELECT * FROM conversation 
          WHERE conversationID = :conversation_id 
          AND (senderID = :sender_id OR receiverID = :sender_id)";

$stmt = $db->prepare($query);
$stmt->bindValue(':conversation_id', $conversationId, SQLITE3_INTEGER);
$stmt->bindValue(':sender_id', $senderId, SQLITE3_INTEGER);
$result = $stmt->execute();

if (!$result->fetchArray(SQLITE3_ASSOC)) {
    echo json_encode(['error' => 'Invalid conversation or sender']);
    exit;
}

// Insert the new message
$query = "INSERT INTO message (conversationID, senderID, description, sendTime) 
          VALUES (:conversation_id, :sender_id, :message, datetime('now'))";

$stmt = $db->prepare($query);
$stmt->bindValue(':conversation_id', $conversationId, SQLITE3_INTEGER);
$stmt->bindValue(':sender_id', $senderId, SQLITE3_INTEGER);
$stmt->bindValue(':message', $message, SQLITE3_TEXT);

if (!$stmt->execute()) {
    echo json_encode(['error' => 'Failed to send message']);
    exit;
}

$messageId = $db->lastInsertRowID();

// Return success response
echo json_encode([
    'status' => 'success',
    'message' => 'Message sent',
    'message_id' => $messageId
]);

$db->close();
?> 