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

// Check if user_id is provided
if (!isset($_GET['user_id'])) {
    echo json_encode(['error' => 'User ID is required']);
    exit;
}

$userId = $_GET['user_id'];

// Get all conversations where the user is either sender or receiver
$query = "SELECT c.*, 
          CASE 
            WHEN c.senderID = :user_id THEN c.receiverID 
            ELSE c.senderID 
          END as otherUserID,
          p.firstName || ' ' || p.lastName as otherUserName,
          p.email as otherUserEmail,
          (SELECT description FROM message WHERE conversationID = c.conversationID ORDER BY sendTime DESC LIMIT 1) as lastMessage,
          (SELECT sendTime FROM message WHERE conversationID = c.conversationID ORDER BY sendTime DESC LIMIT 1) as lastMessageTime
          FROM conversation c
          LEFT JOIN person p ON (p.personID = CASE WHEN c.senderID = :user_id THEN c.receiverID ELSE c.senderID END)
          WHERE c.senderID = :user_id OR c.receiverID = :user_id
          ORDER BY lastMessageTime DESC";

$stmt = $db->prepare($query);
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$result = $stmt->execute();

$conversations = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    // If no user name, use email or 'Unknown User'
    if (empty($row['otherUserName'])) {
        $row['otherUserName'] = $row['otherUserEmail'] ? $row['otherUserEmail'] : 'Unknown User';
    }
    $conversations[] = $row;
}

echo json_encode([
    'status' => 'success',
    'conversations' => $conversations
]);

$db->close();
?> 