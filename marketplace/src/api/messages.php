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

// Check if conversation_id is provided
if (!isset($_GET['conversation_id'])) {
    echo json_encode(['error' => 'Conversation ID is required']);
    exit;
}

$conversationId = $_GET['conversation_id'];

// Get all messages for the conversation
$query = "SELECT m.messageID, m.conversationID, m.senderID, m.description as text, 
          m.sendTime as timestamp, p.firstName || ' ' || p.lastName as senderName, p.email as senderEmail
          FROM message m
          LEFT JOIN person p ON m.senderID = p.personID
          WHERE m.conversationID = :conversation_id
          ORDER BY m.sendTime ASC";

$stmt = $db->prepare($query);
$stmt->bindValue(':conversation_id', $conversationId, SQLITE3_INTEGER);
$result = $stmt->execute();

$messages = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    // If no sender name, use email or 'Unknown User'
    if (empty($row['senderName'])) {
        $row['senderName'] = $row['senderEmail'] ? $row['senderEmail'] : 'Unknown User';
    }
    $messages[] = $row;
}

echo json_encode([
    'status' => 'success',
    'messages' => $messages
]);

$db->close();
?> 