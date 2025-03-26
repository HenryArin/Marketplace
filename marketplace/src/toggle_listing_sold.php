<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/php_errors.log');

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization");
header("Access-Control-Allow-Credentials: true");

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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    
    // Get JSON data from request body
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData, true);
    
    if (!$data || !isset($data['listingID'])) {
        sendJsonResponse(['error' => 'Listing ID is required'], 400);
    }
    
    $listingID = $data['listingID'];
    
    // First verify that the listing belongs to the user
    $checkSql = 'SELECT listerID, sold FROM listing WHERE listingID = :listingID';
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
        sendJsonResponse(['error' => 'Listing not found'], 404);
    }
    
    if ($listing['listerID'] != $userID) {
        sendJsonResponse(['error' => 'Unauthorized to modify this listing'], 403);
    }
    
    // Toggle the sold status
    $newSoldStatus = $listing['sold'] ? 0 : 1;
    
    // Update the listing's sold status
    $updateSql = 'UPDATE listing SET sold = :soldStatus WHERE listingID = :listingID';
    $updateStmt = $db->prepare($updateSql);
    if (!$updateStmt) {
        throw new Exception('Failed to prepare update statement: ' . $db->lastErrorMsg());
    }
    
    $updateStmt->bindValue(':soldStatus', $newSoldStatus, SQLITE3_INTEGER);
    $updateStmt->bindValue(':listingID', $listingID, SQLITE3_INTEGER);
    
    if (!$updateStmt->execute()) {
        throw new Exception('Failed to update listing status: ' . $db->lastErrorMsg());
    }
    
    sendJsonResponse([
        'message' => $newSoldStatus ? 'Listing marked as sold' : 'Listing marked as available',
        'soldStatus' => $newSoldStatus
    ]);
    
} catch (Exception $e) {
    error_log('Toggle listing sold status error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    sendJsonResponse(['error' => $e->getMessage()], 500);
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?> 