<?php
// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Set content type
header('Content-Type: application/json');

// Disable displaying PHP errors to ensure clean JSON output
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE);

try {
    // Connect to SQLite database
    $db = new SQLite3('./sql/marketplace.db');
} catch (Exception $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Check if listing_id is provided
if (!isset($_GET['listing_id'])) {
    echo json_encode(['error' => 'Missing listing_id parameter']);
    exit;
}

$listingId = $_GET['listing_id'];

// Get seller information
$stmt = $db->prepare("
    SELECT p.personID as id, p.email, p.firstName, p.lastName
    FROM listing l
    JOIN person p ON l.listerID = p.personID
    WHERE l.listingID = :listing_id
");

if (!$stmt) {
    echo json_encode(['error' => 'Query preparation failed: ' . $db->lastErrorMsg()]);
    exit;
}

$stmt->bindValue(':listing_id', $listingId, SQLITE3_INTEGER);
$result = $stmt->execute();

if (!$result) {
    echo json_encode(['error' => 'Query execution failed: ' . $db->lastErrorMsg()]);
    exit;
}

$row = $result->fetchArray(SQLITE3_ASSOC);

if (!$row) {
    // If no results, try to get the structure of the tables to debug
    $tables = [];
    $tableQuery = $db->query("SELECT name FROM sqlite_master WHERE type='table';");
    while ($table = $tableQuery->fetchArray(SQLITE3_ASSOC)) {
        $tableName = $table['name'];
        $columns = [];
        $columnsQuery = $db->query("PRAGMA table_info($tableName);");
        while ($column = $columnsQuery->fetchArray(SQLITE3_ASSOC)) {
            $columns[] = $column['name'];
        }
        $tables[$tableName] = $columns;
    }
    
    echo json_encode([
        'error' => 'Seller not found for this listing',
        'listing_id' => $listingId,
        'schema' => $tables
    ]);
    exit;
}

// Return seller information
echo json_encode([
    'status' => 'success',
    'seller' => $row
]);

$db->close();
?> 