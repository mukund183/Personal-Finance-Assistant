<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Include database connection
require_once '../../db_connect.php';

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Check if required fields are provided
if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['message' => 'Username, email and password are required']);
    exit;
}

$username = $data['username'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_BCRYPT);

// Check if user already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
$stmt->bind_param("ss", $email, $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['message' => 'User already exists']);
    exit;
}

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $password);

if ($stmt->execute()) {
    $user_id = $stmt->insert_id;
    
    // Generate JWT token
    $secret_key = "your_jwt_secret_key";
    $issued_at = time();
    $expiration = $issued_at + (60 * 60 * 24 * 30); // 30 days
    
    $payload = [
        'id' => $user_id,
        'iat' => $issued_at,
        'exp' => $expiration
    ];
    
    // Encode JWT token
    $jwt = generateJWT($payload, $secret_key);
    
    // Return user data with token
    echo json_encode([
        'id' => $user_id,
        'username' => $username,
        'email' => $email,
        'token' => $jwt
    ]);
} else {
    echo json_encode(['message' => 'Registration failed']);
}

// Close connection
$stmt->close();
$conn->close();

// Function to generate JWT token
function generateJWT($payload, $secret_key) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $header = base64_encode($header);
    
    $payload = json_encode($payload);
    $payload = base64_encode($payload);
    
    $signature = hash_hmac('sha256', "$header.$payload", $secret_key, true);
    $signature = base64_encode($signature);
    
    return "$header.$payload.$signature";
}
?>