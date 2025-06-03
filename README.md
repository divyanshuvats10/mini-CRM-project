# Mini CRM System

A full-stack Customer Relationship Management (CRM) system with AI-powered customer segmentation and automated marketing campaigns. Built with modern web technologies and deployed on Vercel (frontend) and Render (backend).

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                        │
│  ┌──────────────┐ ┌────────────────┐ ┌─────────────────────┐  │
│  │  Dashboard   │ │   Customers    │ │      Campaigns      │  │
│  │   Analytics  │ │   Management   │ │    & Segments       │  │
│  └──────────────┘ └────────────────┘ └─────────────────────┘  │
│           │               │                      │             │
│           └───────────────┼──────────────────────┘             │
│                           │                                    │
│                     ┌─────▼─────┐                             │
│                     │ API Layer │                             │
│                     │(Axios JWT)│                             │
└─────────────────────┴───────────┴─────────────────────────────┘
                              │
                              │ JWT Authentication
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Express.js)                       │
│  ┌──────────────┐ ┌────────────────┐ ┌─────────────────────┐  │
│  │ Auth Routes  │ │  API Routes    │ │   Background        │  │
│  │(Google OAuth)│ │(CRUD + AI Gen) │ │   Services          │  │
│  └──────────────┘ └────────────────┘ └─────────────────────┘  │
│           │               │                      │             │
│           └───────────────┼──────────────────────┘             │
│                           │                                    │
│                     ┌─────▼─────┐                             │
│                     │   Redis   │                             │
│                     │  Streams  │                             │
│                     │  (Queue)  │                             │
└─────────────────────┴───────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                   │
│  ┌──────────────┐ ┌────────────────┐ ┌─────────────────────┐  │
│  │   MongoDB    │ │     Redis      │ │    Google AI        │  │
│  │  (Primary)   │ │   (Caching)    │ │     (Gemini)        │  │
│  └──────────────┘ └────────────────┘ └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Features

### 📊 **Dashboard & Analytics**
- Real-time statistics for customers, orders, segments, and campaigns
- Modern, responsive UI with Tailwind CSS
- Interactive data visualization

### 👥 **Customer Management**
- Add, view, and manage customer profiles
- Track customer spending, visits, and last activity
- Redis-based queue processing for scalability

### 📦 **Order Management**
- Create and track customer orders
- Item-level order details
- Automated customer spending calculations

### 🎯 **AI-Powered Customer Segmentation**
- Natural language to rules conversion using Google Gemini AI
- Custom rule builder with logical operators
- Dynamic customer filtering based on behavior

### 📢 **Automated Marketing Campaigns**
- AI-generated personalized messages
- Multi-channel campaign delivery simulation
- Campaign history and performance tracking
- Communication logs with delivery status

### 🔐 **Authentication & Security**
- Google OAuth integration
- JWT-based authentication for cross-origin compatibility
- Secure session management

## 🛠️ Technology Stack

### **Frontend**
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client with JWT interceptors
- **Lucide React** - Modern icon library
- **@react-oauth/google** - Google authentication

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js 5** - Web application framework
- **MongoDB** - Document database with Mongoose ODM
- **Redis** - In-memory data store for queues and caching
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens for stateless auth

### **AI & External Services**
- **Google Gemini AI** - Natural language processing
- **Google OAuth** - Authentication provider

### **DevOps & Deployment**
- **PM2** - Process manager for production
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Cloud database
- **Redis Cloud** - Managed Redis instance

## 📋 Local Setup Instructions

### **Prerequisites**
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Google OAuth credentials
- Google Gemini API key

### **Backend Setup**

1. **Clone and navigate to backend:**
```bash
git clone <repository-url>
cd mini-crm-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Configure environment variables:**
```env
# Database
MONGO_URI=mongodb://localhost:27017/mini-crm
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/mini-crm

# Redis
REDIS_URL=redis://localhost:6379
# or Redis Cloud: redis://username:password@host:port

# Authentication
SESSION_SECRET=your-secure-random-string
JWT_SECRET=your-jwt-secret-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# AI
GEMINI_API_KEY=your-google-gemini-api-key

# Environment
NODE_ENV=development
PORT=5000
```

5. **Start development servers:**
```bash
# Start main API server
npm run dev

# Start background consumer (in separate terminal)
npm run consumer-only
```

### **Frontend Setup**

1. **Navigate to frontend:**
```bash
cd mini-crm-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp env.example .env
```

4. **Configure environment variables:**
```env
# Backend API (for development)
VITE_API_URL=http://localhost:5000

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

5. **Start development server:**
```bash
npm run dev
```

### **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## 🏗️ Project Structure

### **Backend (`mini-crm-backend/`)**
```
├── app.js                 # Main Express application
├── server.js              # Server entry point
├── redisClient.js         # Redis connection setup
├── ecosystem.config.js    # PM2 configuration
├── models/                # Mongoose schemas
│   ├── user.js
│   ├── customer.js
│   ├── order.js
│   ├── segment.js
│   ├── campaign.js
│   └── communicationLog.js
├── routes/                # API endpoints
│   ├── auth.js           # Authentication routes
│   ├── customer.js       # Customer CRUD
│   ├── order.js          # Order CRUD
│   ├── segment.js        # Segment management
│   ├── campaign.js       # Campaign management
│   └── api.js            # AI integration
├── services/             # Background services
│   ├── unifiedConsumer.js    # Main queue processor
│   ├── customerConsumer.js   # Customer-specific processor
│   └── orderConsumer.js      # Order-specific processor
├── middleware/           # Custom middleware
│   └── auth.js
└── config/              # Configuration files
    └── passport.js      # Passport strategies
```

### **Frontend (`mini-crm-frontend/`)**
```
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── CustomerForm.jsx
│   │   ├── OrderForm.jsx
│   │   ├── RuleBuilder.jsx
│   │   └── NaturalLanguageToRules.jsx
│   ├── pages/               # Page components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── CustomersPage.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── CreateSegment.jsx
│   │   ├── LaunchCampaign.jsx
│   │   └── CampaignHistory.jsx
│   ├── context/             # React Context
│   │   └── AuthContext.jsx
│   ├── utils/               # Utility functions
│   │   └── api.js           # Axios configuration
│   └── assets/              # Static assets
├── public/                  # Public assets
├── vite.config.js          # Vite configuration
└── vercel.json             # Vercel deployment config
```

## 🤖 AI Integration

### **Google Gemini AI Features**

1. **Natural Language to Rules Conversion**
   - **Endpoint:** `POST /api/generate-rules`
   - **Purpose:** Converts plain English to customer segmentation rules
   - **Example:** "High-value customers who haven't visited recently" → Rules for totalSpend > 1000 AND lastActive > 30 days

2. **AI-Generated Campaign Messages**
   - **Endpoint:** `POST /api/generate-messages`
   - **Purpose:** Creates personalized marketing messages
   - **Example:** Generates multiple message variants for different campaign objectives

### **AI Implementation Details**
- Uses Google Gemini 1.5 Flash model for fast, cost-effective processing
- Structured prompts ensure consistent JSON output
- Error handling for malformed AI responses
- Fallback mechanisms for API failures

## 🔄 Queue System Architecture

### **Redis Streams Implementation**
- **Customer Stream:** Handles customer creation/updates
- **Order Stream:** Processes order data and updates customer analytics
- **Unified Consumer:** Single service processes both streams
- **Automatic Retry:** Failed messages are retried with exponential backoff
- **Message Cleanup:** Successfully processed messages are deleted to prevent reprocessing

### **Queue Benefits**
- **Scalability:** Decouples API responses from data processing
- **Reliability:** Ensures data consistency even during high load
- **Performance:** Non-blocking API responses
- **Monitoring:** Built-in health checks and debugging endpoints

## 🛡️ Security Features

### **Authentication**
- **JWT Tokens:** Stateless authentication for cross-origin compatibility
- **Google OAuth:** Secure third-party authentication
- **Token Expiry:** 24-hour token lifetime with automatic refresh
- **Secure Storage:** Tokens stored in localStorage with automatic cleanup

### **API Security**
- **CORS Configuration:** Strict origin validation
- **Rate Limiting:** (Recommended for production)
- **Input Validation:** Mongoose schema validation
- **Environment Secrets:** Sensitive data in environment variables

## 🚀 Deployment

### **Production Deployment**

**Frontend (Vercel):**
- Automatic deployments from Git
- Environment variables configured in Vercel dashboard
- Build command: `npm run build`
- Output directory: `dist`

**Backend (Render):**
- Automatic deployments from Git
- Uses PM2 for process management
- Environment variables configured in Render dashboard
- Build command: `npm install`
- Start command: `npm run start:pm2`

### **Environment Variables (Production)**

**Backend (Render):**
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
REDIS_URL=redis://...
SESSION_SECRET=production-secret
JWT_SECRET=production-jwt-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GEMINI_API_KEY=...
```

**Frontend (Vercel):**
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=...
```

## ⚠️ Known Limitations & Assumptions

### **Technical Limitations**
1. **Cross-Origin Cookies:** Originally designed for cookie-based sessions, switched to JWT for better cross-origin compatibility
2. **Redis Persistence:** Uses in-memory Redis; data may be lost if Redis restarts (use Redis persistence in production)
3. **MongoDB Sessions:** Session store uses MongoDB; requires cleanup for optimal performance
4. **AI Rate Limits:** Google Gemini API has rate limits; implement queuing for high-volume usage

### **Business Logic Assumptions**
1. **Customer Uniqueness:** Customers are identified by email address
2. **Order Relationships:** Orders link to customers via email (no foreign key constraints)
3. **Campaign Delivery:** Simulated delivery; no actual email/SMS integration
4. **Segment Updates:** Segments are not automatically updated when customer data changes

### **Scalability Considerations**
1. **Single Consumer:** One unified consumer processes all queues; scale horizontally for high throughput
2. **Database Queries:** No advanced indexing; optimize for large datasets
3. **File Storage:** No file upload handling; add cloud storage for attachments
4. **Real-time Updates:** No WebSocket implementation for real-time dashboard updates

### **Security Considerations**
1. **API Rate Limiting:** No built-in rate limiting; implement for production
2. **Input Sanitization:** Basic validation; add comprehensive sanitization
3. **Audit Logging:** No audit trail for data changes
4. **RBAC:** No role-based access control; all authenticated users have full access

### **Development Assumptions**
1. **Google OAuth Setup:** Assumes Google OAuth application is properly configured
2. **AI API Access:** Requires Google Gemini API access and quota
3. **Database Seeding:** No automatic data seeding; requires manual data entry or import
4. **Error Monitoring:** No integrated error tracking (consider Sentry for production)

## 📚 API Documentation

### **Key Endpoints**

**Authentication:**
- `POST /auth/google-jwt` - Google OAuth login with JWT
- `GET /auth/user-jwt` - Verify JWT token
- `POST /auth/logout` - Logout user

**Customers:**
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer (queued)
- `GET /api/customers/:id` - Get customer details

**Orders:**
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order (queued)
- `GET /api/orders/by-email/:email` - Get customer orders

**Segments & Campaigns:**
- `POST /api/segments` - Create customer segment
- `POST /api/campaigns` - Launch marketing campaign
- `GET /api/campaigns` - List campaign history

**AI Integration:**
- `POST /api/generate-rules` - Convert natural language to rules
- `POST /api/generate-messages` - Generate campaign messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using modern web technologies and AI integration** 