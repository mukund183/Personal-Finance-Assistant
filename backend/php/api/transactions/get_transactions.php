<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Include database connection
require_once '../../db_connect.php';

// Check for authorization token
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

if (!$token) {
    echo json_encode(['message' => 'No authentication token, access denied']);
    exit;
}

// Verify token and get user ID
$user_id = verifyToken($token);
if (!$user_id) {
    echo json_encode(['message' => 'Invalid token']);
    exit;
}

// Get query parameters
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

$type = isset($_GET['type']) ? $_GET['type'] : null;
$category = isset($_GET['category']) ? $_GET['category'] : null;
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;

// Build query
$query = "SELECT * FROM transactions WHERE user_id = ?";
$params = [$user_id];
$types = "i";

if ($type) {
    $query .= " AND type = ?";
    $params[] = $type;
    $types .= "s";
}

if ($category) {
    $query .= " AND category = ?";
    $params[] = $category;
    $types .= "s";
}

if ($startDate) {
    $query .= " AND date >= ?";
    $params[] = $startDate;
    $types .= "s";
}

if ($endDate) {
    $query .= " AND date <= ?";
    $params[] = $endDate;
    $types .= "s";
}

// Add pagination
$query .= " ORDER BY date DESC LIMIT ?, ?";
$params[] = $offset;
$params[] = $limit;
$types .= "ii";

// Prepare and execute query
$stmt = $conn->prepare($query);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

// Get total count for pagination
$countQuery = "SELECT COUNT(*) as total FROM transactions WHERE user_id = ?";
$countParams = [$user_id];
$countTypes = "i";

if ($type) {
    $countQuery .= " AND type = ?";
    $countParams[] = $type;
    $countTypes .= "s";
}

if ($category) {
    $countQuery .= " AND category = ?";
    $countParams[] = $category;
    $countTypes .= "s";
}

if ($startDate) {
    $countQuery .= " AND date >= ?";
    $countParams[] = $startDate;
    $countTypes .= "s";
}

if ($endDate) {
    $countQuery .= " AND date <= ?";
    $countParams[] = $endDate;
    $countTypes .= "s";
}

$countStmt = $conn->prepare($countQuery);
$countStmt->bind_param($countTypes, ...$countParams);
$countStmt->execute();
$countResult = $countStmt->get_result();
$totalCount = $countResult->fetch_assoc()['total'];

// Format response
$transactions = [];
while ($row = $result->fetch_assoc()) {
    $transactions[] = $row;
}

echo json_encode([
    'transactions' => $transactions,
    'page' => $page,
    'limit' => $limit,
    'total' => $totalCount,
    'totalPages' => ceil($totalCount / $limit)
]);

// Close connection
$stmt->close();
$countStmt->close();
$conn->close();

// Function to verify JWT token
function verifyToken($token) {
    $secret_key = "your_jwt_secret_key";
    
    $tokenParts = explode('.', $token);
    if (count($tokenParts) != 3) {
        return false;
    }
    
    $payload = base64_decode($tokenParts[1]);
    $payload = json_decode($payload, true);
    
    if (!$payload || !isset($payload['id']) || !isset($payload['exp'])) {
        return false;
    }
    
    // Check if token is expired
    if ($payload['exp'] < time()) {
        return false;
    }
    
    return $payload['id'];
}
?>