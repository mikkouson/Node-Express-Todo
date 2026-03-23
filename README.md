# TypeScript Node.js Express Todo App

A backend REST API for a Todo application built with Node.js, Express, TypeScript, and PostgreSQL. It demonstrates how to set up a modern Node.js application from scratch with CRUD functionality, input validation, and proper database integration.

## Features
- **TypeScript** & **ES Modules** integration
- **PostgreSQL** database using the `pg` driver
- **Express Validator** for robust input validation
- **Multer** for parsing `multipart/form-data`
- **Dotenv** for environment variable management
- **Nodemon** & **ts-node** for an automated development workflow

## Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL Server

---

## 🚀 Setting up the Exisiting Project

If you just cloned this project, run these commands to get started:

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Setup Environment Variables:**
   Copy `.env.example` to `.env` and configure your database details.
   ```bash
   cp .env.example .env
   ```
3. **Database Setup:**
   Create a database (e.g., `express_todo_ts`) and run the following SQL table creation query:
   ```sql
   CREATE TABLE public.tasks (
       id SERIAL PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       is_active BOOLEAN DEFAULT true
   );
   ```
4. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## 🛠 Building the App from Scratch

To recreate this exact setup from scratch, follow these instructions step-by-step.

### 1. Initialize the Node Project
Create a new folder and initialize your `package.json`.
```bash
mkdir express-todo-ts && cd express-todo-ts
npm init -y
```

### 2. Enable ES Modules
Open `package.json` and add `"type": "module"` to the top-level configuration.
```json
{
  "name": "express-todo-ts",
  "version": "1.0.0",
  "type": "module",
  ...
}
```

### 3. Install Dependencies
Install the required packages for the app:
```bash
npm install express pg multer express-validator dotenv
```

Install the developer dependencies (TypeScript and matching type definitions):
```bash
npm install -D typescript @types/node @types/express @types/pg @types/multer ts-node nodemon
```

### 4. Setup TypeScript
Initialize TypeScript configurations:
```bash
npx tsc --init
```
Replace the generated `tsconfig.json` with this configuration optimized for ES Modules:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### 5. Add Useful Package Scripts
Add the following commands to the `scripts` section in your `package.json`:
```json
"scripts": {
  "dev": "nodemon",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

### 6. Configure Nodemon
Create a `nodemon.json` file in your root folder. This tells nodemon to watch your TypeScript files and use `ts-node` using ESM loaders.
```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "node --loader ts-node/esm src/index.ts"
}
```

### 7. Database Creation & Structure
Run this SQL script in your PostgreSQL shell or pgAdmin to create the required table:
```sql
CREATE DATABASE express_todo_ts;

-- Connect to express_todo_ts and then run:
CREATE TABLE public.tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true
);
```

### 8. Set Up Environment Variables
Create a `.env` file for your secret credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=express_todo_ts
PORT=3000
```
Also create a `.env.example` file omitting the real password to share via version control.

### 9. Create Application Logic
Create a `src` directory with two files:

**`src/db.ts`**
Handles the database connection pool using environment variables.
```typescript
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default pool;
```

**`src/index.ts`**
Sets up the Express server, `multer` middleware, and contains all the CRUD route handlers (GET, POST, PUT, DELETE) validating data with `express-validator` and saving it to Postgres.

## 📝 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Checks if API is running |
| `GET` | `/tasks` | Retrieves all tasks |
| `GET` | `/tasks/:id` | Retrieves a single task based on ID |
| `POST` | `/tasks/store` | Creates a new task (`title` required, `is_active` optional) |
| `PUT` | `/tasks/:id` | Updates an existing task by specifying ID |
| `DELETE`| `/tasks/:id` | Soft/hard deletes a specific task |
