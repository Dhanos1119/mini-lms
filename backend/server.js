const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const prisma = require('./utils/prisma');
const app = express();

app.use(cors());
app.use(express.json());

// 🔥 DEBUG (remove later)
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;

const createDefaultAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('12345678', 10);

    await prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: { role: 'ADMIN' },
      create: {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('Default admin ready');
  } catch (err) {
    console.error(err);
  }
};

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await createDefaultAdmin();
});