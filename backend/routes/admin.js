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
/**
 * ================== GET LOGGED-IN STUDENT PROFILE ==================
 */
router.get('/student-profile', authMiddleware, async (req, res) => {
  try {
    const tokenUser = req.user || {};

    const userId = tokenUser.id || tokenUser.userId || req.userId;
    const email = tokenUser.email || req.email || req.userEmail;

    if (!userId && !email) {
      return res.status(401).json({
        error: "User details not found in token"
      });
    }

    const student = await prisma.user.findFirst({
      where: {
        role: 'STUDENT',
        ...(userId
          ? { id: userId }
          : { email: String(email).toLowerCase() })
      },
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

    if (!student) {
      return res.status(404).json({
        error: "Student profile not found"
      });
    }

    return res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      batch: student.batchId,
      batchId: student.batchId,
      courseDuration: student.courseDuration,
      phone: student.phoneNumber,
      phoneNumber: student.phoneNumber,
      status: student.status,
      createdAt: student.createdAt
    });

  } catch (error) {
    console.error("FETCH STUDENT PROFILE ERROR:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

/**
 * ================== UPDATE STUDENT ==================
 */
router.put('/students/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, batchId, courseDuration, status } = req.body;

    if (!name || !batchId || !courseDuration) {
      return res.status(400).json({
        error: "Name, batch, and course duration are required"
      });
    }

    const updatedStudent = await prisma.user.update({
      where: { id },
      data: {
        name,
        phoneNumber: phoneNumber || "",
        batchId,
        courseDuration: Number(courseDuration),
        status: status || "Active"
      },
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

    return res.json({
      message: "Student updated successfully",
      student: updatedStudent
    });
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error);
    return res.status(500).json({
      error: "Failed to update student",
      details: error.message
    });
  }
});


/**
 * ================== DELETE STUDENT ==================
 */
router.delete('/students/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({
      where: { id }
    });

    if (!student) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    return res.json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);
    return res.status(500).json({
      error: "Failed to delete student",
      details: error.message
    });
  }
});
module.exports = router;