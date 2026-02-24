# 🩸 Smart Blood Bank Network System

A comprehensive, production-ready blood bank management system that connects donors, patients, hospitals, and administrators on a single platform.

![Blood Bank Network](https://img.shields.io/badge/Blood%20Bank-Network-red)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected routes
- Input validation

### 👥 User Management
- Multi-role registration (Donor, Patient, Hospital, Admin)
- Profile management
- User search and filtering
- Account activation/deactivation

### 🩸 Blood Inventory
- Real-time inventory tracking
- Low stock alerts
- Expiry date tracking
- Blood search by group and location

### 🚨 Emergency Requests
- Create urgent blood requests
- Track request status
- Hospital approval workflow
- Urgency levels (Critical, Urgent, Normal)

### 📊 Dashboards
- **Admin**: System statistics, user management, analytics
- **Donor**: Donation history, eligibility status, nearby requests
- **Patient**: Blood search, request management
- **Hospital**: Inventory management, request handling

### 🎨 UI/UX
- Responsive design
- Dark mode support
- Loading states
- Toast notifications
- Clean, modern interface

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **React Toastify** - Notifications

## 📁 Project Structure

```
blood-bank-network/
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── seed.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── inventoryController.js
│   │   ├── requestController.js
│   │   └── donationController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authorize.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── BloodInventory.js
│   │   ├── EmergencyRequest.js
│   │   └── Donation.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── requestRoutes.js
│   │   └── donationRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Loading.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── donor/
│   │   │   ├── patient/
│   │   │   └── hospital/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/blood-bank-network.git
cd blood-bank-network
```

### Step 2: Setup Backend

```bash
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your configuration
# Start MongoDB if not running
# mongod

# Seed the database with sample data
npm run seed

# Start the server
npm run dev
```

### Step 3: Setup Frontend

```bash
# Open new terminal
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Step 4: Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 🔧 Environment Variables

### Server (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bloodbank

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Admin Default Credentials
ADMIN_EMAIL=admin@bloodbank.com
ADMIN_PASSWORD=admin123

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## 📖 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (Admin) |
| GET | `/api/users/stats` | Get user statistics |
| GET | `/api/users/donors/search` | Search donors |
| GET | `/api/users/hospitals` | Get all hospitals |

### Inventory Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | Get hospital inventory |
| POST | `/api/inventory` | Add blood stock |
| PUT | `/api/inventory/:id` | Update inventory |
| DELETE | `/api/inventory/:id` | Delete inventory |
| GET | `/api/inventory/search` | Search available blood |

### Request Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | Get all requests |
| POST | `/api/requests` | Create emergency request |
| PUT | `/api/requests/:id/status` | Update request status |
| GET | `/api/requests/my-requests` | Get patient requests |

### Donation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donations` | Get all donations |
| POST | `/api/donations` | Record donation |
| GET | `/api/donations/my-donations` | Get donor donations |

## 👤 User Roles

### Admin
- View all users and statistics
- Manage users (delete, deactivate)
- View all requests and inventory
- System analytics

### Donor
- View and update profile
- Track donation history
- Check eligibility (90-day rule)
- View nearby emergency requests

### Patient
- Search for blood availability
- Create emergency requests
- Track request status
- View hospital information

### Hospital
- Manage blood inventory
- Add/update blood stock
- Handle emergency requests
- View low stock and expiry alerts

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bloodbank.com | admin123 |
| Hospital | hospital1@bloodbank.com | hospital123 |
| Donor | donor1@bloodbank.com | donor123 |
| Patient | patient1@bloodbank.com | patient123 |

## 📊 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  bloodGroup: String,
  role: ['donor', 'patient', 'hospital', 'admin'],
  city: String,
  state: String,
  isAvailable: Boolean,
  lastDonationDate: Date
}
```

### BloodInventory
```javascript
{
  hospitalId: ObjectId,
  bloodGroup: String,
  quantity: Number,
  expiryDate: Date,
  batchNumber: String,
  source: String
}
```

### EmergencyRequest
```javascript
{
  patientId: ObjectId,
  bloodGroup: String,
  quantity: Number,
  urgencyLevel: ['critical', 'urgent', 'normal'],
  status: ['pending', 'approved', 'rejected', 'completed'],
  location: { address, city, state },
  hospital: String,
  requiredBy: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Author
Sahil Shekh



## 🙏 Acknowledgments

- All healthcare workers and blood donors
- Open source community
- MongoDB, Express, React, Node.js teams

---

**Made with ❤️ to save lives**
