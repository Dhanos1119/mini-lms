const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/assignments/student
 * @desc    Get assignments for the logged-in student's batch
 * @access  Private (Student)
 */
router.get('/student', authMiddleware, async (req, res) => {
  try {
    // Always fetch latest batchId from DB (token may be stale)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { batchId: true }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.batchId) return res.status(200).json([]);

    const assignments = await prisma.assignment.findMany({
      where: { batchId: user.batchId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(assignments);
  } catch (err) {
    console.error('🔥 FETCH ASSIGNMENTS ERROR:', err);
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
});


/**
 * @route   GET /api/assignments/announcements
 * @desc    Get announcements for the logged-in student:
 *          - announcements where batchId matches student's batch
 *          - OR announcements where batchId = "All Batches" (global)
 * @access  Private (Student)
 */
router.get('/announcements', authMiddleware, async (req, res) => {
  try {
    // Fetch the student's current batchId fresh from DB
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { batchId: true }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Build the filter: match student's batch OR global "All Batches"
    const whereClause = user.batchId
      ? {
          OR: [
            { batchId: user.batchId },
            { batchId: 'All Batches' }
          ]
        }
      : { batchId: 'All Batches' }; // No batch assigned → only global

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(announcements);
  } catch (err) {
    console.error('🔥 FETCH ANNOUNCEMENTS ERROR:', err);
    res.status(500).json({ message: 'Server error fetching announcements' });
  }
});

module.exports = router;
