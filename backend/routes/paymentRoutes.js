const express = require("express");
const prisma = require("../utils/prisma");

const router = express.Router();


// CREATE payment
router.post("/", async (req, res) => {
  try {
    const {
      studentName,
      email,
      batch,
      academicYear,
      amount,
      paidDate,
      status,
    } = req.body;

    if (!studentName || !email || !batch || !academicYear || !amount || !paidDate) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const payment = await prisma.payment.create({
      data: {
        studentName,
        email,
        batch,
        academicYear: Number(academicYear),
        amount: Number(amount),
        paidDate: new Date(paidDate),
        status: status || "Paid",
      },
    });

    res.status(201).json({
      message: "Payment recorded successfully",
      payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      message: "Failed to create payment",
      error: error.message,
    });
  }
});

// GET all payments for admin
router.get("/", async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
});

// GET payments by student email
router.get("/student/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const payments = await prisma.payment.findMany({
      where: {
        email,
      },
      orderBy: {
        academicYear: "asc",
      },
    });

    res.json(payments);
  } catch (error) {
    console.error("Get student payments error:", error);
    res.status(500).json({
      message: "Failed to fetch student payments",
      error: error.message,
    });
  }
});

// UPDATE payment
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      studentName,
      email,
      batch,
      academicYear,
      amount,
      paidDate,
      status,
    } = req.body;

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        studentName,
        email,
        batch,
        academicYear: Number(academicYear),
        amount: Number(amount),
        paidDate: new Date(paidDate),
        status,
      },
    });

    res.json({
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({
      message: "Failed to update payment",
      error: error.message,
    });
  }
});

// DELETE payment
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.payment.delete({
      where: { id },
    });

    res.json({
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({
      message: "Failed to delete payment",
      error: error.message,
    });
  }
});

module.exports = router;