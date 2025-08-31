<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Include database connection
require_once '../../db_connect.php';

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Check if email and password are provided
if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['message' => 'Email and password are required']);
    exit;
}

$email = $data['email'];
$password = $data['password'];

// Prepare SQL statement to prevent SQL injection
$stmt = $conn->prepare("SELECT id, username, email, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        // Generate JWT token
        $secret_key = "your_jwt_secret_key";
        $issued_at = time();
        $expiration = $issued_at + (60 * 60 * 24 * 30); // 30 days
        
        $payload = [
            'id' => $user['id'],
            'iat' => $issued_at,
            'exp' => $expiration
        ];
        
        // Encode JWT token
        $jwt = generateJWT($payload, $secret_key);
        
        // Return user data with token
        echo json_encode([
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'token' => $jwt
        ]);
    } else {
        echo json_encode(['message' => 'Invalid email or password']);
    }
} else {
    echo json_encode(['message' => 'Invalid email or password']);
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