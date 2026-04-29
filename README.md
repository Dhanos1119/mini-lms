# Mini LMS

Mini LMS is a Learning Management System built with:

- Frontend: Next.js
- Backend: Node.js and Express.js
- Database: PostgreSQL
- ORM: Prisma

---

## Requirements

Before running the project, install:

- Node.js
- PostgreSQL
- Git

---

## Project Setup

Clone the project:

```bash
git clone <repository-url>
cd mini-lms
```

---

## Database Setup

Create a PostgreSQL database:

```txt
mini_lms
```

---

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mini_lms?schema=public"
PORT=5000
JWT_SECRET="your_jwt_secret"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_email_app_password"
```

Generate Prisma client:

```bash
npx prisma generate
```

Push Prisma schema to database:

```bash
npx prisma db push
```

Run backend:

```bash
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

---

## Frontend Setup

Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file inside the `frontend` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

---

## Default Admin Login

```txt
Email: admin@gmail.com
Password: 12345678
```

---

