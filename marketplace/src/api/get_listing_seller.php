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

// Check if listing_id is provided
if (!isset($_GET['listing_id'])) {
    echo json_encode(['error' => 'Listing ID is required']);
    exit;
}

// Connect to the database
try {
    $db = new SQLite3('../../sql/marketplace.db');
} catch (Exception $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$listingId = $_GET['listing_id'];

// Get the seller information for the listing
$query = "SELECT l.listingID, l.listerID, p.personID, p.email as seller_email 
          FROM listing l
          JOIN person p ON l.listerID = p.personID
          WHERE l.listingID = :listing_id";

$stmt = $db->prepare($query);
$stmt->bindValue(':listing_id', $listingId, SQLITE3_INTEGER);
$result = $stmt->execute();
$listing = $result->fetchArray(SQLITE3_ASSOC);

if (!$listing) {
    echo json_encode(['error' => 'Listing not found or no seller associated']);
    exit;
}

// Return seller info
echo json_encode([
    'status' => 'success',
    'seller' => [
        'id' => $listing['listerID'],
        'email' => $listing['seller_email']
    ],
    'listing_id' => $listing['listingID']
]);

$db->close();
?> 