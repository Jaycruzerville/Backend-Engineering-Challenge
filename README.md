# OneHaven Backend Engineering Challenge

A robust, real-time Caregiver Management API built with **Node.js (Express)**, **MongoDB**, and **Supabase Auth**.

## 🚀 Features
*   **Secure Authentication**: JWT-based auth using Supabase.
*   **Caregiver & Member Management**: Full CRUD capabilities.
*   **Real-time Simulation**: Event logging for member updates.
*   **Robust Synchronization**: "Self-healing" logic to handle Supabase/MongoDB data mismatches.
*   **Security**: Rate limiting (100 req/15min) and input validation (Zod).
*   **Documentation**: Interactive API docs via Swagger UI.

## 🛠️ Tech Stack
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **Auth Provider**: Supabase
*   **Validation**: Zod
*   **Logging**: Winston
*   **Docs**: Swagger (OpenAPI 3.0)

## 📦 Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   Supabase Project

### Installation
1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd onehaven-backend-challenge
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/onehaven
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_ANON_KEY=your-supbase-anon-key
    ```
    > **Note**: Disable "Confirm Email" in Supabase Authentication settings for easier testing.

4.  **Start the Server**:
    ```bash
    npm start
    ```

5.  **View Documentation**:
    *   **Live Demo**: [https://backend-engineering-challenge-production.up.railway.app/api-docs/](https://backend-engineering-challenge-production.up.railway.app/api-docs/)
    *   **Local**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 🧪 Verification
Run the included seed script to verify the entire flow (Signup -> Login -> Add Members):
```bash
npm run seed
```

## 📐 Design Explanation

### Architecture
The project follows a **Layered Architecture**:
*   **Routes**: Define API endpoints and apply middleware (Auth, Rate Limit).
*   **Controllers**: Handle request logic, validation, and communicate with Models.
*   **Models**: Mongoose schemas defining data structure and relationships.
*   **Middleware**: Reusable logic for Authentication and Rate Limiting.

### Key Decisions
1.  **Dual-Write Handling**: Since we use Supabase for Auth and MongoDB for Data, there is a risk of desynchronization. I implemented a **self-healing authentication middleware**. If a user logs in via Supabase but their MongoDB record is missing (or IDs mismatch), the system attempts to find them by email and re-link the accounts automatically.
2.  **Real-time Simulation**: Instead of a complex WebSocket setup for this challenge, I used a structured logger (`winston`) to emit events to the console as requested. This mimics an event stream that a frontend could subscribe to.

## 🔄 Event Flow

1.  **Caregiver Signup**:
    *   User validates input (Zod).
    *   Creates Auth user in Supabase.
    *   Creates Caregiver record in MongoDB linked by `supabaseId`.
    *   *Self-healing*: If email exists in Mongo but not Supabase, updates Mongo record.

2.  **Member Creation**:
    *   Authenticated Caregiver POSTs to `/api/members`.
    *   Server validates token and data.
    *   Member saved to MongoDB.
    *   **Event Emitted**: `[TIMESTAMP] EVENT: member_added — { ... }`

3.  **Data Access**: All member data is scoped to the authenticated `caregiverId`.

## 🤖 AI Usage Summary
This project was accelerated using Agentic AI to ensure best practices and rapid iteration.

*   **Boilerplate Generation**: AI generated the initial project structure, configuration files, and standard CRUD boilerplate, saving significant setup time.
*   **Debugging & Robustness**: When a synchronization bug occurred (user deleted in Supabase but not Mongo), AI analyzed the server logs, identified the `Duplicate Key` error, and implemented the **self-healing middleware** to automatically resolve such conflicts.
*   **Documentation**: AI auto-generated the Swagger/OpenAPI definitions based on the code structure and drafted this comprehensive README.
