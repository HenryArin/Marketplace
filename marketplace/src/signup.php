<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/php_errors.log');

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
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
    // Get form data
    $email = $_POST['emailaddress'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Validate required fields
    if (empty($email) || empty($password)) {
        sendJsonResponse(['error' => 'Email and password are required'], 400);
    }
    
    // Check if email already exists
    $checkSql = 'SELECT personID FROM person WHERE email = :email';
    $checkStmt = $db->prepare($checkSql);
    if (!$checkStmt) {
        throw new Exception('Failed to prepare statement: ' . $db->lastErrorMsg());
    }
    
    $checkStmt->bindValue(':email', $email, SQLITE3_TEXT);
    $result = $checkStmt->execute();
    
    if (!$result) {
        throw new Exception('Failed to check email: ' . $db->lastErrorMsg());
    }
    
    if ($result->fetchArray()) {
        sendJsonResponse(['error' => 'Email already exists'], 400);
    }
    
    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $sql = 'INSERT INTO person (email, password, hash) VALUES (:email, :password, :hash)';
    $stmt = $db->prepare($sql);
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $db->lastErrorMsg());
    }
    
    $stmt->bindValue(':email', $email, SQLITE3_TEXT);
    $stmt->bindValue(':password', $hashedPassword, SQLITE3_TEXT);
    $stmt->bindValue(':hash', $hashedPassword, SQLITE3_TEXT);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to create account: ' . $db->lastErrorMsg());
    }
    
    sendJsonResponse(['message' => 'Account Successfully Created!']);
    
} catch (Exception $e) {
    error_log('Signup error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    sendJsonResponse(['error' => $e->getMessage()], 500);
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?>
