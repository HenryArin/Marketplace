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

// Set session cookie parameters
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0);
ini_set('session.cookie_samesite', 'Lax');

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
    
    // Get user by email
    $sql = 'SELECT personID, password FROM person WHERE email = :email';
    $stmt = $db->prepare($sql);
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $db->lastErrorMsg());
    }
    
    $stmt->bindValue(':email', $email, SQLITE3_TEXT);
    $result = $stmt->execute();
    
    if (!$result) {
        throw new Exception('Failed to check credentials: ' . $db->lastErrorMsg());
    }
    
    $user = $result->fetchArray(SQLITE3_ASSOC);
    if (!$user || !password_verify($password, $user['password'])) {
        sendJsonResponse(['error' => 'Invalid email or password'], 401);
    }
    
    // Generate a token for the user
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 day'));
    
    // Check if auth_tokens table exists
    $db->exec('CREATE TABLE IF NOT EXISTS auth_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL,
        expires TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES person(personID)
    )');
    
    // Insert or update token
    $tokenSql = "INSERT INTO auth_tokens (user_id, token, expires) VALUES (:user_id, :token, :expires)";
    $tokenStmt = $db->prepare($tokenSql);
    if (!$tokenStmt) {
        throw new Exception('Failed to prepare token statement: ' . $db->lastErrorMsg());
    }
    
    $tokenStmt->bindValue(':user_id', $user['personID'], SQLITE3_INTEGER);
    $tokenStmt->bindValue(':token', $token, SQLITE3_TEXT);
    $tokenStmt->bindValue(':expires', $expires, SQLITE3_TEXT);
    
    if (!$tokenStmt->execute()) {
        throw new Exception('Failed to save token: ' . $db->lastErrorMsg());
    }
    
    // Return the token in the response
    sendJsonResponse([
        'message' => 'Login Successful!',
        'token' => $token,
        'userID' => $user['personID']
    ]);
    
} catch (Exception $e) {
    error_log('Login error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    sendJsonResponse(['error' => $e->getMessage()], 500);
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?>
