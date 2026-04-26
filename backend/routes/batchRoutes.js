const express = require("express");
const prisma = require("../utils/prisma");

const router = express.Router();

const formatBatch = (batch) => ({
  ...batch,
  startDate: batch.startDate ? batch.startDate.toISOString().split("T")[0] : "",
  endDate: batch.endDate ? batch.endDate.toISOString().split("T")[0] : "",
  studentsCount: "0",
});

// GET all batches
router.get("/", async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(batches.map(formatBatch));
  } catch (error) {
    console.error("Get batches error:", error);
    res.status(500).json({
      message: "Failed to fetch batches",
      error: error.message,
    });
  }
});

// CREATE batch
router.post("/", async (req, res) => {
  try {
    const { name, instructor, description, startDate, endDate, schedule } = req.body;

    if (!name || !startDate) {
      return res.status(400).json({
        message: "Batch name and start date are required",
      });
    }

    const batch = await prisma.batch.create({
      data: {
        name,
        instructor: instructor || "TBD",
        description: description || "",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        schedule: schedule || "TBD",
      },
    });

    res.status(201).json({
      message: "Batch created successfully",
      batch: formatBatch(batch),
    });
  } catch (error) {
    console.error("Create batch error:", error);
    res.status(500).json({
      message: "Failed to create batch",
      error: error.message,
    });
  }
});

// UPDATE batch
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, instructor, description, startDate, endDate, schedule } = req.body;

    const batch = await prisma.batch.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        instructor: instructor || "TBD",
        description: description || "",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        schedule: schedule || "TBD",
      },
    });

    res.json({
      message: "Batch updated successfully",
      batch: formatBatch(batch),
    });
  } catch (error) {
    console.error("Update batch error:", error);
    res.status(500).json({
      message: "Failed to update batch",
      error: error.message,
    });
  }
});

// DELETE batch
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.batch.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("Delete batch error:", error);
    res.status(500).json({
      message: "Failed to delete batch",
      error: error.message,
    });
  }
});

module.exports = router;