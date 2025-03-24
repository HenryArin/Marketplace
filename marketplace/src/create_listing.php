<?php
// Add CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
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

// Log the request data
error_log("Received POST request");
error_log("POST data: " . print_r($_POST, true));
error_log("FILES data: " . print_r($_FILES, true));

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    // Check if database file exists
    if (!file_exists($dbPath)) {
        error_log("Database file not found at: " . $dbPath);
        throw new Exception('Database file not found');
    }

    error_log("Database file exists at: " . $dbPath);
    $db = new SQLite3($dbPath);
    
    // Add price column if it doesn't exist
    $db->exec('PRAGMA table_info(listing)');
    $columns = $db->query('PRAGMA table_info(listing)');
    $hasPriceColumn = false;
    while ($column = $columns->fetchArray()) {
        if ($column['name'] === 'price') {
            $hasPriceColumn = true;
            break;
        }
    }
    if (!$hasPriceColumn) {
        error_log("Adding price column to listing table");
        $db->exec('ALTER TABLE listing ADD COLUMN price TEXT');
    }
    
    // Get authorization header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    $token = '';
    
    // Extract token from Authorization header
    if (!empty($authHeader) && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        // Try getting token from POST data as fallback
        $token = $_POST['token'] ?? '';
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
    
    $listerID = $tokenData['user_id'];
    error_log("Using listerID: " . $listerID);
    
    // Get form data
    $title = $_POST['title'] ?? '';
    $price = $_POST['price'] ?? '';
    $description = $_POST['description'] ?? '';
    
    error_log("Form data received - Title: $title, Price: $price, Description: " . substr($description, 0, 50) . "...");
    
    // Validate required fields
    if (empty($title) || empty($price) || empty($description)) {
        error_log("Missing required fields");
        sendJsonResponse(['error' => 'All fields are required'], 400);
    }
    
    // Insert the listing
    $sql = 'INSERT INTO listing (listerID, title, description, price, sold) VALUES (:listerID, :title, :description, :price, 0)';
    error_log("Preparing SQL: " . $sql);
    
    $stmt = $db->prepare($sql);
    if (!$stmt) {
        error_log("Failed to prepare statement: " . $db->lastErrorMsg());
        throw new Exception('Failed to prepare statement: ' . $db->lastErrorMsg());
    }
    
    $stmt->bindValue(':listerID', $listerID, SQLITE3_INTEGER);
    $stmt->bindValue(':title', $title, SQLITE3_TEXT);
    $stmt->bindValue(':description', $description, SQLITE3_TEXT);
    $stmt->bindValue(':price', $price, SQLITE3_TEXT);
    
    $result = $stmt->execute();
    if (!$result) {
        error_log("Failed to execute statement: " . $db->lastErrorMsg());
        throw new Exception('Failed to create listing: ' . $db->lastErrorMsg());
    }
    
    $listingID = $db->lastInsertRowID();
    error_log("Created listing with ID: " . $listingID);
    
    // Handle image uploads
    $uploadedImages = [];
    if (isset($_FILES['images'])) {
        $uploadDir = '../img/listings/';
        if (!file_exists($uploadDir)) {
            error_log("Creating upload directory: " . $uploadDir);
            if (!mkdir($uploadDir, 0777, true)) {
                error_log("Failed to create upload directory");
                throw new Exception('Failed to create upload directory');
            }
        }
        
        foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
            if ($_FILES['images']['error'][$key] !== UPLOAD_ERR_OK) {
                $errorMessage = match($_FILES['images']['error'][$key]) {
                    UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
                    UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
                    UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
                    UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                    UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
                    UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                    UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload',
                    default => 'Unknown upload error'
                };
                error_log("File upload error: " . $errorMessage);
                continue;
            }
            
            $fileName = $_FILES['images']['name'][$key];
            $fileType = $_FILES['images']['type'][$key];
            
            // Validate file type
            if (!in_array($fileType, ['image/jpeg', 'image/png', 'image/gif'])) {
                error_log("Invalid file type: " . $fileType);
                continue;
            }
            
            // Generate unique filename
            $extension = pathinfo($fileName, PATHINFO_EXTENSION);
            $newFileName = uniqid() . '.' . $extension;
            $targetPath = $uploadDir . $newFileName;
            
            error_log("Moving uploaded file to: " . $targetPath);
            if (move_uploaded_file($tmp_name, $targetPath)) {
                // Insert image record into database
                $imgStmt = $db->prepare('INSERT INTO images (listingID, fullpath) VALUES (:listingID, :fullpath)');
                if (!$imgStmt) {
                    error_log("Failed to prepare image statement: " . $db->lastErrorMsg());
                    throw new Exception('Failed to prepare image statement: ' . $db->lastErrorMsg());
                }
                
                $imgStmt->bindValue(':listingID', $listingID, SQLITE3_INTEGER);
                $imgStmt->bindValue(':fullpath', $newFileName, SQLITE3_TEXT);
                
                if (!$imgStmt->execute()) {
                    error_log("Failed to save image record: " . $db->lastErrorMsg());
                    throw new Exception('Failed to save image record: ' . $db->lastErrorMsg());
                }
                
                $uploadedImages[] = $newFileName;
                error_log("Successfully saved image: " . $newFileName);
            } else {
                error_log("Failed to move uploaded file. Error: " . error_get_last()['message']);
            }
        }
    }
    
    error_log("Successfully created listing with " . count($uploadedImages) . " images");
    sendJsonResponse([
        'success' => true,
        'message' => 'Listing created successfully! Your item is now available in the marketplace.',
        'listingID' => $listingID,
        'images' => $uploadedImages
    ]);
    
} catch (Exception $e) {
    error_log('Create listing error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    sendJsonResponse([
        'success' => false,
        'error' => 'Failed to create listing: ' . $e->getMessage()
    ], 500);
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?> 