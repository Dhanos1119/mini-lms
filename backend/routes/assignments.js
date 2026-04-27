const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/assignments
 * @desc    Get all assignments for admin dashboard
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(assignments);
  } catch (err) {
    console.error('🔥 FETCH ALL ASSIGNMENTS ERROR:', err);
    res.status(500).json({
      message: 'Server error fetching all assignments',
      error: err.message,
    });
  }
});

/**
 * @route   GET /api/assignments/student
 * @desc    Get assignments for the logged-in student's batch
 * @access  Private (Student)
 */
router.get('/student', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        batchId: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (!user.batchId) {
      return res.status(200).json([]);
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        batchId: user.batchId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(assignments);
  } catch (err) {
    console.error('🔥 FETCH STUDENT ASSIGNMENTS ERROR:', err);
    res.status(500).json({
      message: 'Server error fetching student assignments',
      error: err.message,
    });
  }
});

/**
 * @route   GET /api/assignments/announcements
 * @desc    Admin: get all announcements
 *          Student: get announcements for student's batch + global announcements
 * @access  Private
 */
router.get('/announcements', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        role: true,
        batchId: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    let whereClause = {};

    if (user.role === 'ADMIN') {
      whereClause = {};
    } else {
      whereClause = user.batchId
        ? {
            OR: [
              { batchId: user.batchId },
              { batchId: 'All Batches' },
            ],
          }
        : {
            batchId: 'All Batches',
          };
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(announcements);
  } catch (err) {
    console.error('🔥 FETCH ANNOUNCEMENTS ERROR:', err);
    res.status(500).json({
      message: 'Server error fetching announcements',
      error: err.message,
    });
  }
});
/**
 * @route   PUT /api/assignments/:id
 * @desc    Update assignment
 * @access  Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, batchId, dueDate, fileUrl } = req.body;

    if (!title || !batchId || !dueDate) {
      return res.status(400).json({
        message: 'Title, batch, and due date are required',
      });
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        title,
        description: description || '',
        batchId,
        dueDate: new Date(dueDate),
        fileUrl: fileUrl || null,
      },
    });

    res.json({
      message: 'Assignment updated successfully',
      assignment: updatedAssignment,
    });
  } catch (err) {
    console.error('🔥 UPDATE ASSIGNMENT ERROR:', err);
    res.status(500).json({
      message: 'Server error updating assignment',
      error: err.message,
    });
  }
});


/**
 * @route   DELETE /api/assignments/:id
 * @desc    Delete assignment
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.assignment.delete({
      where: { id },
    });

    res.json({
      message: 'Assignment deleted successfully',
    });
  } catch (err) {
    console.error('🔥 DELETE ASSIGNMENT ERROR:', err);
    res.status(500).json({
      message: 'Server error deleting assignment',
      error: err.message,
    });
  }
});

module.exports = router;