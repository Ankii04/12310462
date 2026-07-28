# Email Job Scheduler - Outbox Labs Assignment

A full-stack web application for scheduling and managing bulk email campaigns with intelligent rate limiting, job queue processing, and delivery tracking. Built with modern technologies for scalability and reliability.

**Live Demo:** [Available after deployment]

---

## 🎯 Overview

The Email Job Scheduler is a production-ready SaaS solution that enables users to:

- **Schedule bulk emails** with precise timing control
- **Manage multiple sender accounts** with load balancing
- **Track delivery status** in real-time with detailed logs
- **Apply rate limiting** per sender to maintain email reputation
- **Process jobs asynchronously** using BullMQ for reliability
- **Handle failures gracefully** with error tracking and retry logic

### Key Features

✅ **Email Scheduling** - Schedule emails for future delivery with millisecond precision  
✅ **Rate Limiting** - Per-sender hourly limits to maintain email deliverability  
✅ **Job Queue** - BullMQ-based queue with delayed job execution  
✅ **Batch Processing** - Send to multiple recipients efficiently  
✅ **Status Tracking** - Real-time tracking of email delivery status  
✅ **Idempotency** - Guaranteed no duplicate sends even with failures  
✅ **CSV Upload** - Bulk recipient import for large campaigns  
✅ **Responsive UI** - Modern Next.js frontend with Tailwind CSS  

---

## 🏗️ Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Schedule Form │ Scheduled Emails │ Sent/Failed      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  REST API   │
                    │  (Express)  │
                    └──────┬──────┘
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
      ┌────────┐      ┌──────────┐      ┌──────────┐
      │ Prisma │      │ BullMQ   │      │ Ethereal │
      │ (ORM)  │      │ Queue    │      │ (SMTP)   │
      └────┬───┘      └──┬───┬──┘      └──────────┘
           │             │   │
      ┌────▼────┐    ┌───▼─┐│
      │PostgreSQL   │Redis││
      └───────────┘└──────┘┘
```

### Tech Stack

**Backend:**
- **Framework:** Express.js (Node.js/TypeScript)
- **Database:** PostgreSQL with Prisma ORM
- **Job Queue:** BullMQ with Redis
- **Email Service:** Nodemailer with Ethereal Email (testing)
- **Runtime:** Node.js 18+

**Frontend:**
- **Framework:** Next.js 14 with React 18
- **Styling:** Tailwind CSS
- **UI Components:** Custom React components
- **HTTP Client:** Native Fetch API

**Infrastructure:**
- **Containerization:** Docker & Docker Compose
- **Database:** PostgreSQL 16
- **Cache/Queue:** Redis 7

---

## 📋 Database Schema

### EmailBatch Table
Stores batch metadata for organizing email campaigns.

```sql
EmailBatch {
  id          String (CUID Primary Key)
  userEmail   String (Campaign creator)
  subject     String (Email subject)
  body        String (Email content)
  startTime   DateTime (When to start sending)
  delayMs     Int (Delay between sends in milliseconds)
  hourlyLimit Int (Max emails per hour per sender)
  createdAt   DateTime (Timestamp)
  emails      ScheduledEmail[] (Relation)
}
```

### ScheduledEmail Table
Tracks individual email status and delivery.

```sql
ScheduledEmail {
  id          String (CUID Primary Key)
  batchId     String (FK to EmailBatch)
  batch       EmailBatch (Relation)
  recipient   String (Recipient email)
  senderEmail String (Sender account used)
  status      EmailStatus (SCHEDULED|PROCESSING|SENT|FAILED)
  scheduledFor DateTime (Scheduled delivery time)
  sentAt      DateTime? (Actual send time)
  error       String? (Error message if failed)
  bullJobId   String? (BullMQ job reference)
  createdAt   DateTime
  updatedAt   DateTime
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (with npm or yarn)
- **Docker** & **Docker Compose**
- **Git**

### Installation

#### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd outboxlabs

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

#### 2. Setup Environment Variables

**Backend** (`.env`):

```env
# Database
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/email_scheduler?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Email Senders (Optional - will auto-generate test accounts if empty)
SENDER_1_USER=""
SENDER_1_PASS=""
SENDER_2_USER=""
SENDER_2_PASS=""

# Service Configuration
PORT=5000
WORKER_CONCURRENCY=5
MAX_EMAILS_PER_HOUR_PER_SENDER=100
MIN_DELAY_BETWEEN_EMAILS_MS=2000
```

**Frontend** (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### 3. Start Services with Docker Compose

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify containers are running
docker-compose ps
```

#### 4. Initialize Database

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

cd ..
```

#### 5. Start Backend Server

```bash
cd backend
npm run dev

# Expected output:
# --- Email Job Scheduler Backend Starting ---
# [PostgreSQL] Connected successfully via Prisma.
# [Nodemailer] Ethereal Senders active: test@ethereal.email, test2@ethereal.email
# [Express] Server running on http://localhost:5000
```

#### 6. Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 📖 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Schedule Emails
**POST** `/emails/schedule`

Schedule a batch of emails to be sent.

**Request Body:**
```json
{
  "userEmail": "user@example.com",
  "subject": "Welcome to our service",
  "body": "Hello! Welcome aboard.",
  "recipients": ["alice@example.com", "bob@example.com"],
  "startTime": "2024-01-15T10:00:00Z",
  "delayMs": 2000,
  "hourlyLimit": 100
}
```

**Response (201 Created):**
```json
{
  "message": "Batch scheduled successfully",
  "batchId": "clr8a9b2x0000qz8t8g8h9i9j",
  "emailCount": 2,
  "scheduledEmails": [
    {
      "id": "clr8a9b2x0001qz8t8g8h9i9j",
      "batchId": "clr8a9b2x0000qz8t8g8h9i9j",
      "recipient": "alice@example.com",
      "senderEmail": "ethereal1@example.com",
      "status": "SCHEDULED",
      "scheduledFor": "2024-01-15T10:00:00Z",
      "bullJobId": "email-clr8a9b2x0001qz8t8g8h9i9j"
    }
  ]
}
```

#### Get Scheduled Emails
**GET** `/emails/scheduled?userEmail={email}`

Retrieve pending emails for a user.

**Query Parameters:**
- `userEmail` (required) - User's email address

**Response (200 OK):**
```json
{
  "emails": [
    {
      "id": "clr8a9b2x0001qz8t8g8h9i9j",
      "recipient": "alice@example.com",
      "senderEmail": "ethereal1@example.com",
      "status": "SCHEDULED",
      "scheduledFor": "2024-01-15T10:00:00Z",
      "batch": {
        "subject": "Welcome",
        "body": "Hello!"
      }
    }
  ]
}
```

#### Get Sent/Failed Emails
**GET** `/emails/sent?userEmail={email}`

Retrieve completed (sent or failed) emails.

**Query Parameters:**
- `userEmail` (required) - User's email address

**Response (200 OK):**
```json
{
  "emails": [
    {
      "id": "clr8a9b2x0001qz8t8g8h9i9j",
      "recipient": "alice@example.com",
      "senderEmail": "ethereal1@example.com",
      "status": "SENT",
      "sentAt": "2024-01-15T10:00:02Z",
      "batch": {
        "subject": "Welcome",
        "body": "Hello!"
      }
    }
  ]
}
```

#### Get Available Senders
**GET** `/emails/senders`

List all configured email senders.

**Response (200 OK):**
```json
{
  "senders": ["ethereal1@ethereal.email", "ethereal2@ethereal.email"]
}
```

---

## 🔄 How It Works

### Email Scheduling Flow

1. **User submits form** with recipient list, content, and timing
2. **Backend validates** and creates EmailBatch record
3. **Creates ScheduledEmail** entries for each recipient
4. **Submits delayed jobs** to BullMQ queue with precise timing
5. **Worker processes** jobs when scheduled time arrives
6. **Rate limiter** checks hourly quota before sending
7. **Email sent** via Ethereal SMTP
8. **Status updated** to SENT with delivery timestamp

### Rate Limiting Strategy

- **Hourly buckets:** Counts reset every hour using Unix timestamps
- **Per-sender limit:** Each sender account has independent quota
- **Redis storage:** Atomic counters prevent race conditions
- **Auto-retry:** Failed jobs due to rate limit are re-delayed automatically

### Idempotency Guarantee

- **Database check:** Before sending, verify email status isn't already SENT
- **Job ID mapping:** Deterministic job IDs prevent duplicate queue entries
- **Atomic updates:** All state changes are transactional

---

## 🛠️ Development

### Project Structure

```
outboxlabs/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express server entry
│   │   ├── config/
│   │   │   └── env.ts         # Environment configuration
│   │   ├── lib/
│   │   │   ├── prisma.ts      # Database client
│   │   │   ├── redis.ts       # Redis client
│   │   │   └── ethereal.ts    # Email transporter setup
│   │   ├── queue/
│   │   │   ├── emailQueue.ts  # BullMQ queue definition
│   │   │   └── emailWorker.ts # Worker process
│   │   └── routes/
│   │       └── emailRoutes.ts # API routes
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx     # Root layout
│   │   │   ├── page.tsx       # Dashboard
│   │   │   └── globals.css    # Global styles
│   │   ├── components/
│   │   │   ├── ScheduleForm.tsx
│   │   │   ├── ScheduledEmails.tsx
│   │   │   ├── SentEmails.tsx
│   │   │   └── ui/
│   │   │       └── Tabs.tsx
│   │   └── lib/
│   │       └── api.ts         # API client
│   ├── package.json
│   ├── next.config.js
│   └── tailwind.config.ts
│
├── docker-compose.yml
└── README.md
```

### Available Scripts

**Backend:**
```bash
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript
npm start                # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Sync schema to database
```

**Frontend:**
```bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

### Environment Configuration

All environment variables are loaded from `.env` files and can be overridden by system environment variables. Use `.env.example` as a reference.

---

## 📊 Monitoring & Debugging

### Check Service Health

```bash
# Backend health check
curl http://localhost:5000/api/health

# Response: {"status":"ok","timestamp":"2024-01-15T10:00:00.000Z"}
```

### View Database

```bash
# Access PostgreSQL shell
docker exec -it email_scheduler_postgres psql -U postgres -d email_scheduler

# List tables
\dt

# View email batches
SELECT * FROM "EmailBatch";

# View scheduled emails
SELECT id, recipient, status, "scheduledFor" FROM "ScheduledEmail";
```

### Monitor Redis Queue

```bash
# Access Redis CLI
docker exec -it email_scheduler_redis redis-cli

# Check queue length
LLEN bull:email-queue:id

# View job data
HGETALL bull:email-queue:job-id
```

### View Logs

```bash
# Backend logs
docker compose logs backend

# Database logs
docker compose logs postgres

# Queue logs
docker compose logs redis
```

---

## 🧪 Testing

### Manual Testing Steps

1. **Start all services** (Docker, backend, frontend)
2. **Open browser** at `http://localhost:3000`
3. **Fill schedule form:**
   - Your email: `test@example.com`
   - Subject: `Test Campaign`
   - Body: `Hello!`
   - Recipients: Add 3-5 emails (comma or newline separated)
   - Start time: Now + 5 seconds
   - Delay: 2000ms
   - Hourly limit: 100

4. **Monitor progress:**
   - Switch to "Scheduled" tab to see queued emails
   - Watch status change to PROCESSING then SENT
   - Check "Sent/Failed" tab for completion

5. **View email previews:**
   - When sent via Ethereal, console shows preview URL
   - Click URL to see rendered email in browser

### Test Cases

- ✅ Schedule single email
- ✅ Schedule batch with CSV upload
- ✅ Verify rate limiting kicks in
- ✅ Check email delivery status updates
- ✅ Verify failed emails show error messages
- ✅ Re-schedule after completion

---

## 🚨 Troubleshooting

### Backend Won't Start

**Problem:** `ECONNREFUSED` on PostgreSQL/Redis

**Solution:**
```bash
# Ensure Docker containers are running
docker-compose ps

# If not running, start them
docker-compose up -d

# Check container logs
docker-compose logs postgres
docker-compose logs redis
```

### Frontend Can't Connect to Backend

**Problem:** API calls fail with CORS error or 404

**Solution:**
1. Verify backend is running on `http://localhost:5000`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Backend must have CORS enabled (already configured)

### Database Migrations Failed

**Problem:** `Prisma error` when running `prisma:push`

**Solution:**
```bash
# Reset database (destructive)
docker exec email_scheduler_postgres dropdb -U postgres email_scheduler
docker exec email_scheduler_postgres createdb -U postgres email_scheduler

# Re-push schema
npm run prisma:push
```

### Emails Not Sending

**Problem:** Email status stays SCHEDULED

**Solution:**
1. Check worker is running: Look for "Worker started" in backend logs
2. Verify start time is in the past or very soon
3. Check Redis queue: `docker exec email_scheduler_redis redis-cli LLEN bull:email-queue:id`

---

## 📝 Implementation Details

### Key Design Decisions

1. **Prisma ORM:** Type-safe database queries with automatic migrations
2. **BullMQ:** Reliable job queue with built-in retries and persistence
3. **Ethereal Email:** Test-friendly SMTP service for development
4. **Rate Limiting via Redis:** Atomic counters prevent race conditions
5. **Tailwind CSS:** Utility-first for rapid, consistent UI development
6. **Custom Tabs Component:** Zero external dependencies for UI controls

### Performance Optimizations

- **Bulk insert:** Uses `createMany` for efficient ScheduledEmail creation
- **Job batching:** 50+ emails in single API call
- **Rate limit caching:** Redis atomic operations, no database calls
- **Lazy loading:** Frontend components load data on demand
- **Index optimization:** Database indexes on `batchId`, `status`, `scheduledFor`

### Security Considerations

- ✅ Input validation with Zod schema
- ✅ CORS enabled for frontend-backend communication
- ✅ Email validation on both client and server
- ✅ No sensitive data in client-side code
- ✅ Environment variables for all secrets
- ✅ SQL injection prevented by Prisma parameterized queries

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma ORM Guide](https://www.prisma.io/docs/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Tailwind CSS Reference](https://tailwindcss.com/docs)

---

## 📄 License

This project is part of Outbox Labs technical assignment. All rights reserved.

---

## 👤 Author

**Outbox Labs Intern Assignment**  
Created: 2026  
Status: Complete

---

## 🙋 Support

For issues or questions about this assignment, please refer to the ClickUp task or contact the Outbox Labs team.
