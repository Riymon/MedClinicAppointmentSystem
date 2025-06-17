<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

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

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO appointments (name, email, appointment_date) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $appointment_date);

// Set parameters and execute
$name = $_POST['name'];
$email = $_POST['email'];
$appointment_date = $_POST['appointment_date'];
$stmt->execute();

echo "New appointment created successfully";

$stmt->close();
$conn->close();
?>


        const staff = new Staff(1, 101, 'John Doe', 'john@example', '0946565651', 'password123', true);
        applyMixins(Staff, [User, Appointments]);
        const list = staff.appointment.getListAppointments();
        console.log(list);