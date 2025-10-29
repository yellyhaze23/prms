<?php
class DBSessionHandler implements SessionHandlerInterface {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function open($savePath, $sessionName) {
        return true;
    }

    public function close() {
        return true;
    }

    public function read($id) {
        $stmt = $this->conn->prepare("SELECT data FROM sessions WHERE id = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return $row['data'];
        }
        return '';
    }

    public function write($id, $data) {
        $timestamp = time();
        $stmt = $this->conn->prepare("REPLACE INTO sessions (id, data, timestamp) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $id, $data, $timestamp);
        return $stmt->execute();
    }

    public function destroy($id) {
        $stmt = $this->conn->prepare("DELETE FROM sessions WHERE id = ?");
        $stmt->bind_param("s", $id);
        return $stmt->execute();
    }

    public function gc($maxlifetime) {
        $old = time() - $maxlifetime;
        $stmt = $this->conn->prepare("DELETE FROM sessions WHERE timestamp < ?");
        $stmt->bind_param("i", $old);
        return $stmt->execute();
    }
}
?>

