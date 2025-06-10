<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if the form was submitted via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Database config
    $servername = "localhost";
    $username = "root";
    $password = "";
    $port = "3307";
    $dbname = "clinic_appointment";

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname, $port);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Sanitize input
    $FullName = trim($_POST['FullName'] ?? '');
    $Email = trim($_POST['Email'] ?? '');
    $Password = $_POST['Password'] ?? '';

    // Basic validation
    if (empty($FullName) || empty($Email) || empty($Password)) {
        die("All fields are required.");
    }

    // Hash the password
    $HashedPassword = password_hash($Password, PASSWORD_DEFAULT);

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO users (FullName, Email, Password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $FullName, $Email, $HashedPassword);

    // Execute and check
    if ($stmt->execute()) {
        echo "New user created successfully!";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
} else {
    // If the request is not POST
    echo "Invalid request.";
}
?>
