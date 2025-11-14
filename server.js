// -----------------------------
// Mini FTP File Transfer Server
// Developed by Aryan Sharma (24BCE5037)
// Guided by Dr. Swaminathan Annadurai
// -----------------------------
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// Uploads folder
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Upload
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ message: "File uploaded successfully!" });
});

// List files
app.get("/files", (req, res) => {
  const files = fs.readdirSync(uploadDir);
  res.json(files);
});

// Download
app.get("/download/:filename", (req, res) => {
  const file = path.join(uploadDir, req.params.filename);
  res.download(file);
});

// Delete
app.delete("/delete", (req, res) => {
  const { filename } = req.body;
  if (!filename)
    return res.status(400).json({ message: "Filename required" });
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: `${filename} deleted successfully!` });
  } else {
    res.status(404).json({ message: "File not found!" });
  }
});

// ================== Get Real Local IP ==================
function getRealLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (
        net.family === "IPv4" &&
        !net.internal &&
        !name.toLowerCase().includes("vethernet") &&
        !name.toLowerCase().includes("virtual") &&
        !name.toLowerCase().includes("docker") &&
        !name.toLowerCase().includes("bluetooth")
      ) {
        return net.address;
      }
    }
  }
  return "localhost";
}

// API for Get Link button
app.get("/get-ip", (req, res) => {
  const ip = getRealLocalIP();
  res.json({ ip });
});

// Start server
app.listen(PORT, () => {
  const ip = getRealLocalIP();
  console.log("🚀 Server running at:");
  console.log(`➡ Local:    http://localhost:${PORT}`);
  console.log(`➡ Network:  http://${ip}:${PORT}`);
});