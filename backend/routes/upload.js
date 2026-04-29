const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

// POST /api/upload
router.post("/", upload.single("file"), (req, res) => {
  try {
    console.log("FILE RECEIVED:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      message: "File uploaded successfully",
      fileUrl: req.file.path, // 🔥 Cloudinary URL
    });
  } catch (err) {
    console.error("🔥 UPLOAD ERROR:", err);
    res.status(500).json({
      message: "Server error during file upload",
      error: err.message,
    });
  }
});

module.exports = router;