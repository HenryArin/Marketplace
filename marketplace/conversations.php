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

// Check if user_id is provided
if (!isset($_GET['user_id'])) {
    echo json_encode(['error' => 'Missing user_id parameter']);
    exit;
}

$userId = $_GET['user_id'];

// Get conversations where user is buyer or seller
$stmt = $db->prepare("
    SELECT 
        c.id as conversationID,
        c.buyer_id as buyerID,
        c.seller_id as sellerID,
        c.listing_id as listingID,
        c.created_at as startTime,
        l.title as listingTitle,
        pb.firstName as buyerFirstName,
        pb.lastName as buyerLastName,
        ps.firstName as sellerFirstName,
        ps.lastName as sellerLastName,
        (SELECT m.message_text FROM message m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as lastMessage,
        (SELECT m.created_at FROM message m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as lastMessageTime
    FROM conversation c
    LEFT JOIN listing l ON c.listing_id = l.listingID
    LEFT JOIN person pb ON c.buyer_id = pb.personID
    LEFT JOIN person ps ON c.seller_id = ps.personID
    WHERE c.buyer_id = :user_id OR c.seller_id = :user_id
    ORDER BY lastMessageTime DESC, c.created_at DESC
");

if (!$stmt) {
    echo json_encode(['error' => 'Query preparation failed: ' . $db->lastErrorMsg()]);
    exit;
}

$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$result = $stmt->execute();

$conversations = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    // Determine the other user's information based on who is viewing
    if ($row['buyerID'] == $userId) {
        // Current user is the buyer, so other user is seller
        $otherUserId = $row['sellerID'];
        $otherUserName = $row['sellerFirstName'] . ' ' . $row['sellerLastName'];
    } else {
        // Current user is the seller, so other user is buyer
        $otherUserId = $row['buyerID'];
        $otherUserName = $row['buyerFirstName'] . ' ' . $row['buyerLastName'];
    }
    
    $conversations[] = [
        'conversationID' => $row['conversationID'],
        'otherUserId' => $otherUserId,
        'otherUserName' => $otherUserName,
        'listingID' => $row['listingID'],
        'listingTitle' => $row['listingTitle'],
        'lastMessage' => $row['lastMessage'],
        'lastMessageTime' => $row['lastMessageTime'],
        'startTime' => $row['startTime']
    ];
}

echo json_encode([
    'status' => 'success',
    'conversations' => $conversations
]);

$db->close();
?> 