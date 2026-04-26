const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/assignments/student
 * @desc    Get assignments specifically for the logged-in student's batch
 * @access  Private (Student)
 */
router.get('/student', authMiddleware, async (req, res) => {
  try {
    // 1. Get user info from the token (provided by authMiddleware)
    // Note: The token might not have batchId if it was generated before batchId was assigned.
    // It's safer to fetch the latest user data from the DB.
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { batchId: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.batchId) {
      return res.status(200).json([]); // No batch, no assignments
    }

    // 2. Fetch assignments matching the user's batchId
    const assignments = await prisma.assignment.findMany({
      where: {
        batchId: user.batchId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(assignments);
  } catch (err) {
    console.error('🔥 FETCH ASSIGNMENTS ERROR:', err);
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
});

module.exports = router;
