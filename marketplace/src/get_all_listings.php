<?php
// Add CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/php_errors.log');

// Set content type for responses
header('Content-Type: application/json');

// Function to send JSON response and exit
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

require_once 'config.php';

try {
    // Check if database file exists
    if (!file_exists($dbPath)) {
        throw new Exception('Database file not found');
    }

    $db = new SQLite3($dbPath);
    
    // Get sort parameter from query string
    $sort = $_GET['sort'] ?? 'newest';
    
    // Base SQL query
    $sql = 'SELECT 
        l.listingID,
        l.title,
        l.description,
        l.price,
        l.sold,
        l.created_at,
        GROUP_CONCAT(i.fullpath) as images
    FROM listing l
    LEFT JOIN images i ON l.listingID = i.listingID
    WHERE l.sold = 0
    GROUP BY l.listingID';
    
    // Add sorting based on parameter
    switch ($sort) {
        case 'newest':
            $sql .= ' ORDER BY l.created_at DESC';
            break;
        case 'oldest':
            $sql .= ' ORDER BY l.created_at ASC';
            break;
        case 'price_high':
            $sql .= ' ORDER BY CAST(REPLACE(REPLACE(l.price, "$", ""), ",", "") AS DECIMAL) DESC';
            break;
        case 'price_low':
            $sql .= ' ORDER BY CAST(REPLACE(REPLACE(l.price, "$", ""), ",", "") AS DECIMAL) ASC';
            break;
        default:
            $sql .= ' ORDER BY l.created_at DESC';
    }
    
    $result = $db->query($sql);
    
    if (!$result) {
        throw new Exception('Failed to fetch listings: ' . $db->lastErrorMsg());
    }
    
    $listings = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        // Convert images string to array
        $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
        $listings[] = $row;
    }
    
    sendJsonResponse(['listings' => $listings]);
    
} catch (Exception $e) {
    error_log('Get all listings error: ' . $e->getMessage());
    sendJsonResponse(['error' => $e->getMessage()], 500);
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?> 