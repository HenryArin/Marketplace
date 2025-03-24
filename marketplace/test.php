<?php
// Set CORS headers to allow all origins
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type
header('Content-Type: application/json');

// Database path
$dbPath = './sql/marketplace.db';

// Prepare the response
$response = [
    'status' => 'success',
    'message' => 'CORS test successful',
    'server_info' => [
        'time' => date('Y-m-d H:i:s'),
        'php_version' => phpversion()
    ]
];

// Check database connection if it exists
if (file_exists($dbPath)) {
    try {
        $db = new SQLite3($dbPath);
        
        // Get table count
        $tables = [];
        $result = $db->query("SELECT name FROM sqlite_master WHERE type='table';");
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $tables[] = $row['name'];
        }
        
        $response['database'] = [
            'status' => 'connected',
            'path' => $dbPath,
            'tables' => $tables
        ];
        
        $db->close();
    } catch (Exception $e) {
        $response['database'] = [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
} else {
    $response['database'] = [
        'status' => 'not_found',
        'path' => $dbPath
    ];
}

// Return the response
echo json_encode($response);
?> 