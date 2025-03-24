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

// Return a detailed response
echo json_encode([
    'status' => 'success',
    'message' => 'CORS headers are working correctly',
    'timestamp' => time(),
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'headers_sent' => headers_list(),
    'php_version' => phpversion()
]);
?> 