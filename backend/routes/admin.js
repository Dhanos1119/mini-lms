const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { sendCredentialsEmail } = require('../utils/email');

/**
 * @route   POST /api/admin/add-student
 * @desc    Admin adds a new student, generates password, and sends email
 * @access  Private (Admin only)
 */
router.post('/add-student', authMiddleware, adminMiddleware, async (req, res) => {
  // 1. Debug Log Request Body
  console.log("REQ BODY:", req.body);
  
  try {
    const { name, email, batchId, courseDuration, phoneNumber, status } = req.body;

    // 2. Comprehensive Validation
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!batchId) return res.status(400).json({ error: "Batch ID is required" });
    if (courseDuration === undefined || courseDuration === null) {
      return res.status(400).json({ error: "Course duration is required" });
    }

    // 3. Handle Duplicate Email (Unique Constraint)
    const userExists = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (userExists) {
      return res.status(400).json({ error: "A student with this email already exists" });
    }

    // 4. Generate Random 8-digit Password
    const rawPassword = Math.random().toString(36).substring(2, 10).toUpperCase();
    console.log("Generated Password:", rawPassword);
    
    // 5. Hash Password using bcrypt
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 6. Save Student to Prisma Database
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        passwordRaw: rawPassword,
        role: 'STUDENT',
        batchId,
        courseDuration: isNaN(parseInt(courseDuration.toString())) ? null : parseInt(courseDuration.toString()),
        phoneNumber: phoneNumber || null,
        status: status || 'Active'
      }
    });

    // 7. Send Email (Separate Try-Catch to prevent API crash)
    try {
      await sendCredentialsEmail(email, name, rawPassword);
      console.log(`Email sent successfully to ${email}`);
    } catch (emailErr) {
      // Log the error but do NOT return 500
      console.error("Email failed but user created:", emailErr.message);
    }

    // 8. Success Response
    return res.status(201).json({ 
      message: 'Student added successfully!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        batchId: newUser.batchId,
        status: newUser.status
      },
      tempPassword: rawPassword // Included for verification
    });

  } catch (error) {
    // 9. Root Error Handler
    console.error("CRITICAL BACKEND ERROR [/add-student]:", error);
    
    // Check for specific Prisma errors if needed
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Email already exists in the system" });
    }

    return res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message 
    });
  }
});

module.exports = router;
