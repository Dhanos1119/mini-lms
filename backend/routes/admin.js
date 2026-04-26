const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { sendCredentialsEmail } = require('../utils/email');

/**
 * ================== ADD STUDENT ==================
 */
router.post('/add-student', authMiddleware, adminMiddleware, async (req, res) => {
  console.log("REQ BODY:", req.body);

  try {
    const { name, email, batchId, courseDuration, phoneNumber, status } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!batchId) return res.status(400).json({ error: "Batch ID is required" });

    const userExists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const rawPassword = Math.random().toString(36).substring(2, 10).toUpperCase();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        passwordRaw: rawPassword,
        role: 'STUDENT',
        batchId,
        courseDuration: parseInt(courseDuration) || null,
        phoneNumber: phoneNumber || null,
        status: status || 'Active'
      }
    });

    try {
      await sendCredentialsEmail(email, name, rawPassword);
    } catch (emailErr) {
      console.error("Email failed:", emailErr.message);
    }

    return res.status(201).json({
      message: 'Student added successfully!',
      user: newUser
    });

  } catch (error) {
    console.error("ADD STUDENT ERROR:", error);
    return res.status(500).json({ 
      error: "Server error",
      details: error.message
    });
  }
});


/**
 * ================== CREATE ASSIGNMENT ==================
 */
router.post('/assignments', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log("📥 BODY:", req.body);

    const { title, description, batchId, dueDate, fileUrl } = req.body;

    // 🔥 VALIDATION
    if (!title || !batchId) {
      return res.status(400).json({ error: "Title and Batch are required" });
    }

    // 🔥 SAFE DATE
    let parsedDate = null;
    if (dueDate && dueDate !== "") {
      const d = new Date(dueDate);
      if (!isNaN(d)) {
        parsedDate = d;
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || "",
        batchId,
        dueDate: parsedDate,
        fileUrl: fileUrl || null
      }
    });

    console.log("✅ CREATED:", assignment);

    return res.status(201).json({
      message: "Assignment created successfully",
      assignment
    });

  } catch (error) {
    console.error("❌ ASSIGNMENT ERROR:", error);

    return res.status(500).json({
      error: "Server error",
      details: error.message   // 🔥 VERY IMPORTANT
    });
  }
});


/**
 * ================== GET ALL ASSIGNMENTS ==================
 */
router.get('/assignments', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log("📤 FETCHED:", assignments);

    res.json(assignments);

  } catch (error) {
    console.error("FETCH ERROR:", error);

    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});



/**
 * ================== GET ALL STUDENTS ==================
 */
router.get('/students', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        batchId: true,
        courseDuration: true,
        phoneNumber: true,
        status: true,
        createdAt: true
      }
    });

    res.json(students);
  } catch (error) {
    console.error("FETCH STUDENTS ERROR:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});


/**
 * ================== CREATE ANNOUNCEMENT ==================
 */
router.post('/create-announcement', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log("📢 ANNOUNCEMENT BODY:", req.body);

    const { title, content, batchId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        batchId: batchId || "All Batches"
      }
    });

    console.log("✅ Announcement created:", announcement);

    return res.status(201).json({
      message: "Announcement posted successfully",
      announcement
    });

  } catch (error) {
    console.error("❌ ANNOUNCEMENT ERROR:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
});


/**
 * ================== GET ALL ANNOUNCEMENTS ==================
 */
router.get('/announcements', authMiddleware, async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(announcements);

  } catch (error) {
    console.error("FETCH ANNOUNCEMENTS ERROR:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;