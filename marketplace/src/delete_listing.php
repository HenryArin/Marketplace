<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/php_errors.log');

// Add CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header("Content-Length: 0");
    header("Content-Type: text/plain");
    exit;
}

// Set content type for responses
header('Content-Type: application/json');

// Function to send JSON response and exit
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    // Get token from Authorization header
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    $token = '';
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    }
    
    if (empty($token)) {
        sendJsonResponse(['error' => 'Authentication token required'], 401);
    }
    
    // Check if auth_tokens table exists
    $checkTableStmt = $db->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='auth_tokens'");
    $checkTableResult = $checkTableStmt->execute();
    $tableExists = false;
    
    while ($row = $checkTableResult->fetchArray(SQLITE3_ASSOC)) {
        if ($row['name'] === 'auth_tokens') {
            $tableExists = true;
            break;
        }
    }
    
    if (!$tableExists) {
        sendJsonResponse(['error' => 'Authentication system not properly configured'], 500);
    }
    
    // Verify token in database
    $stmt = $db->prepare('SELECT user_id, expires FROM auth_tokens WHERE token = :token');
    $stmt->bindValue(':token', $token, SQLITE3_TEXT);
    $result = $stmt->execute();
    
    if (!$result) {
        sendJsonResponse(['error' => 'Authentication failed'], 401);
    }
    
    $tokenData = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$tokenData) {
        sendJsonResponse(['error' => 'Invalid authentication token'], 401);
    }
    
    // Check if token has expired
    if (strtotime($tokenData['expires']) < time()) {
        // Remove expired token
        $removeStmt = $db->prepare('DELETE FROM auth_tokens WHERE token = :token');
        $removeStmt->bindValue(':token', $token, SQLITE3_TEXT);
        $removeStmt->execute();
        
        sendJsonResponse(['error' => 'Authentication token expired'], 401);
    }
    
    $userID = $tokenData['user_id'];
    $listingID = $_GET['id'] ?? null;
    
    if (!$listingID) {
        sendJsonResponse(['error' => 'Listing ID is required'], 400);
    }
    
    error_log("Attempting to delete listing ID: $listingID for user ID: $userID");
    
    // First verify that the listing belongs to the user
    $checkSql = 'SELECT listerID FROM listing WHERE listingID = :listingID';
    $checkStmt = $db->prepare($checkSql);
    if (!$checkStmt) {
        throw new Exception('Failed to prepare statement: ' . $db->lastErrorMsg());
    }
    
    $checkStmt->bindValue(':listingID', $listingID, SQLITE3_INTEGER);
    $result = $checkStmt->execute();
    
    if (!$result) {
        throw new Exception('Failed to check listing ownership: ' . $db->lastErrorMsg());
    }
    
    $listing = $result->fetchArray(SQLITE3_ASSOC);
    if (!$listing) {
        error_log("Listing ID $listingID not found in database");
        sendJsonResponse(['error' => 'Listing not found'], 404);
    }
    
    if ($listing['listerID'] != $userID) {
        error_log("User ID $userID not authorized to delete listing ID $listingID (owned by User ID {$listing['listerID']})");
        sendJsonResponse(['error' => 'Unauthorized to delete this listing'], 403);
    }
    
    error_log("User ID $userID authorized to delete listing ID $listingID");
    
    // Get image paths before deleting the listing
    $imagesSql = 'SELECT fullpath FROM images WHERE listingID = :listingID';
    $imagesStmt = $db->prepare($imagesSql);
    if (!$imagesStmt) {
        throw new Exception('Failed to prepare statement: ' . $db->lastErrorMsg());
    }
    
    $imagesStmt->bindValue(':listingID', $listingID, SQLITE3_INTEGER);
    $imagesResult = $imagesStmt->execute();
    
    if (!$imagesResult) {
        throw new Exception('Failed to fetch images: ' . $db->lastErrorMsg());
    }
    
    $images = [];
    while ($row = $imagesResult->fetchArray(SQLITE3_ASSOC)) {
        $images[] = $row['fullpath'];
    }
    
    // Delete the listing (this will cascade delete the images records)
    $deleteSql = 'DELETE FROM listing WHERE listingID = :listingID';
    $deleteStmt = $db->prepare($deleteSql);
    if (!$deleteStmt) {
        throw new Exception('Failed to prepare statement: ' . $db->lastErrorMsg());
    }
    
    $deleteStmt->bindValue(':listingID', $listingID, SQLITE3_INTEGER);
    if (!$deleteStmt->execute()) {
        throw new Exception('Failed to delete listing: ' . $db->lastErrorMsg());
    }
    
    $changes = $db->changes();
    error_log("Deleted $changes rows from listing table for listing ID $listingID");
    
    // Delete the actual image files
    $uploadDir = dirname(__DIR__) . '/img/listings/';
    foreach ($images as $image) {
        $imagePath = $uploadDir . $image;
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }
    
    sendJsonResponse(['success' => true]);
    
} catch (Exception $e) {
    error_log('Delete listing error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    sendJsonResponse(['error' => $e->getMessage()], 500);
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?> 