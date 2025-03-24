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
if (!$data || !isset($data['sender_id']) || !isset($data['receiver_id']) || !isset($data['initial_message'])) {
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$senderId = $data['sender_id'];
$receiverId = $data['receiver_id'];
$initialMessage = $data['initial_message'];
$listingId = isset($data['listing_id']) ? $data['listing_id'] : null;

// First, check if a conversation already exists between these users
$query = "SELECT conversationID FROM conversation WHERE 
          (senderID = :sender_id AND receiverID = :receiver_id) OR 
          (senderID = :receiver_id AND receiverID = :sender_id)";

$stmt = $db->prepare($query);
$stmt->bindValue(':sender_id', $senderId, SQLITE3_INTEGER);
$stmt->bindValue(':receiver_id', $receiverId, SQLITE3_INTEGER);
$result = $stmt->execute();
$existingConversation = $result->fetchArray(SQLITE3_ASSOC);

$conversationId = null;

if ($existingConversation) {
    // Conversation already exists
    $conversationId = $existingConversation['conversationID'];
} else {
    // Create a new conversation
    $query = "INSERT INTO conversation (senderID, receiverID, startTime) 
              VALUES (:sender_id, :receiver_id, datetime('now'))";
    
    $stmt = $db->prepare($query);
    $stmt->bindValue(':sender_id', $senderId, SQLITE3_INTEGER);
    $stmt->bindValue(':receiver_id', $receiverId, SQLITE3_INTEGER);
    
    if (!$stmt->execute()) {
        echo json_encode(['error' => 'Failed to create conversation']);
        exit;
    }
    
    $conversationId = $db->lastInsertRowID();
}

// Now add the initial message
if ($initialMessage) {
    $query = "INSERT INTO message (conversationID, senderID, description, sendTime) 
              VALUES (:conversation_id, :sender_id, :message, datetime('now'))";
    
    $stmt = $db->prepare($query);
    $stmt->bindValue(':conversation_id', $conversationId, SQLITE3_INTEGER);
    $stmt->bindValue(':sender_id', $senderId, SQLITE3_INTEGER);
    $stmt->bindValue(':message', $initialMessage, SQLITE3_TEXT);
    
    if (!$stmt->execute()) {
        echo json_encode(['error' => 'Failed to send initial message']);
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