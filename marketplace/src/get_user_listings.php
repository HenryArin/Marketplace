<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/php_errors.log');

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    // Get authorization header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    $token = '';
    
    // Extract token from Authorization header
    if (!empty($authHeader) && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        // Try getting token from query parameter as fallback
        $token = $_GET['token'] ?? '';
    }
    
    if (empty($token)) {
        error_log('No token provided');
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }
    
    // Check if auth_tokens table exists
    $db->exec('CREATE TABLE IF NOT EXISTS auth_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL,
        expires TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES person(personID)
    )');
    
    // Verify token
    $tokenSql = 'SELECT user_id, expires FROM auth_tokens WHERE token = :token';
    $tokenStmt = $db->prepare($tokenSql);
    if (!$tokenStmt) {
        throw new Exception('Failed to prepare token statement: ' . $db->lastErrorMsg());
    }
    
    $tokenStmt->bindValue(':token', $token, SQLITE3_TEXT);
    $tokenResult = $tokenStmt->execute();
    
    if (!$tokenResult) {
        throw new Exception('Failed to verify token: ' . $db->lastErrorMsg());
    }
    
    $tokenData = $tokenResult->fetchArray(SQLITE3_ASSOC);
    if (!$tokenData) {
        error_log('Invalid token');
        sendJsonResponse(['error' => 'Invalid or expired token'], 401);
    }
    
    // Check if token is expired
    $now = date('Y-m-d H:i:s');
    if ($tokenData['expires'] < $now) {
        error_log('Token expired');
        sendJsonResponse(['error' => 'Token expired'], 401);
    }
    
    $userID = $tokenData['user_id'];
    error_log('Authenticated user ID: ' . $userID);
    
    // Get user's listings with their images
    $sql = '
    SELECT 
        l.listingID,
        l.title,
        l.description,
        l.price,
        l.sold,
        l.created_at,
        GROUP_CONCAT(i.fullpath) as images
    FROM listing l
    LEFT JOIN images i ON l.listingID = i.listingID
    WHERE l.listerID = :userID
    GROUP BY l.listingID
    ORDER BY l.created_at DESC';
    
    $stmt = $db->prepare($sql);
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $db->lastErrorMsg());
    }
    
    $stmt->bindValue(':userID', $userID, SQLITE3_INTEGER);
    $result = $stmt->execute();
    
    if (!$result) {
        throw new Exception('Failed to fetch listings: ' . $db->lastErrorMsg());
    }
    
    $listings = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        // Convert images string to array
        $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
        $listings[] = $row;
    }
    
    error_log('Found ' . count($listings) . ' listings for user');
    sendJsonResponse(['listings' => $listings]);
    
} catch (Exception $e) {
    error_log('Get user listings error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    sendJsonResponse(['error' => $e->getMessage()], 500);
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?> 