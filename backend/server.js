const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const prisma = require('./utils/prisma');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔥 DEBUG (optional - remove later)
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
console.log("JWT_SECRET:", process.env.JWT_SECRET);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;

// ✅ Create or Update Default Admin
const createDefaultAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('12345678', 10);

    await prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: { 
        role: 'ADMIN',
         
      },
      create: {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Default admin ready (admin@gmail.com / 12345678)');
  } catch (err) {
    console.error('❌ Error creating admin:', err);
  }
};

// 🚀 Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await createDefaultAdmin();
});

// 🔥 Prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error("❌ UNCAUGHT ERROR:", err);
});

process.on('unhandledRejection', (err) => {
  console.error("❌ UNHANDLED PROMISE:", err);
});