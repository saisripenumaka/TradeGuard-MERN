# TradeGuard: The AI Orchestrator for Global Shipping Compliance & Risk Assessment

TradeGuard is an enterprise full-stack MERN application that streamlines international trade compliance, automates customs document analysis, and assesses shipping risks in real-time using Google Gemini AI.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Routing**: React Router DOM (v7)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios with custom interceptors
- **State Management**: React Context API (`AuthContext`)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs
- **File Upload**: Multer
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **Security & Logging**: Helmet, CORS, Morgan

---

## 📁 Project Architecture

```
3-2 internship/
├── client/                     # Frontend React (Vite) Application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Reusable UI components (Navbar, ProtectedRoute, etc.)
│   │   ├── context/            # AuthContext, Global state
│   │   ├── hooks/              # Custom hooks (useAuth)
│   │   ├── layouts/            # Global Layout wrapper
│   │   ├── pages/              # Views (Home, Login, Register, Dashboard, Shipments, etc.)
│   │   ├── services/           # Axios API client & Auth services
│   │   ├── utils/              # Helper utilities
│   │   ├── App.jsx             # Route definitions & security guards
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind CSS directives
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                     # Backend Node.js + Express API
│   ├── config/                 # MongoDB database connection
│   ├── controllers/            # Request handlers (authController, shipmentController, etc.)
│   ├── middleware/             # authMiddleware, uploadMiddleware, errorMiddleware
│   ├── models/                 # Mongoose schemas (User, Shipment, ComplianceReport, Notification)
│   ├── routes/                 # Express routers (authRoutes, shipmentRoutes, aiRoutes, etc.)
│   ├── services/               # Gemini AI service orchestration
│   ├── uploads/                # Uploaded documents storage (Multer)
│   ├── utils/
│   ├── server.js               # Entry point
│   ├── .env                    # Environment variables
│   └── package.json
└── README.md
```

---

## 🛠️ Quickstart & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas connection string)
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 1. Server Setup
Navigate into the `server/` directory:
```bash
cd server
npm install
```

Configure your environment variables in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tradeguard
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

Start the backend server:
```bash
# Development mode with auto-reload:
npm run dev

# Or production mode:
npm start
```
The server will run on `http://localhost:5000`.

---

### 2. Frontend Setup
In a new terminal window, navigate to the `client/` directory:
```bash
cd client
npm install
```

Start the Vite development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Credentials (Auto-fill enabled)
On the Login page, use the test shortcut buttons or enter:
- **Exporter Account**:
  - Email: `exporter@tradeguard.com`
  - Password: `password123`
- **Compliance Admin Account**:
  - Email: `admin@tradeguard.com`
  - Password: `password123`

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | Public |
| `GET` | `/api/auth/me` | Fetch active user profile | Private (Bearer) |
| `POST` | `/api/auth/forgotpassword` | Generate password reset token | Public |
| `PUT` | `/api/auth/resetpassword/:resettoken` | Reset password using token | Public |

### Shipments (`/api/shipments`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/shipments` | List all shipments (with search & filter) | Private |
| `POST` | `/api/shipments` | Create new shipment with document upload | Private |
| `GET` | `/api/shipments/:id` | Get detailed shipment data | Private |
| `PUT` | `/api/shipments/:id` | Update shipment details | Private |
| `DELETE`| `/api/shipments/:id` | Remove shipment | Private |

### AI Compliance & Risk Assessment (`/api/ai`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/ai/compliance` | Analyze shipment with Google Gemini AI | Private |

---

## 🔒 Security Highlights
- **Salted Password Hashing**: Passwords encrypted using `bcryptjs` with salt rounds.
- **Stateless Authentication**: Signed JWT tokens stored securely and passed via HTTP Authorization Bearer headers.
- **Role-Based Access Control**: Middleware enforcement for admin vs standard exporter permissions.
- **Sanitized Uploads**: Multer configured with file-type whitelisting (`PDF`, `DOCX`, `PNG`, `JPG`) and file size boundaries.
