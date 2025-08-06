# Freelance Platform

> A modern service marketplace connecting customers with skilled service providers across home services, technical support, tutoring, and more.

[![Tech Stack](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tech Stack](https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Tech Stack](https://img.shields.io/badge/TypeScript-Language-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tech Stack](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

---

## 🎯 Overview

The Freelance Platform is a comprehensive service marketplace that bridges the gap between customers seeking services and skilled providers. Built with modern web technologies, it offers a seamless experience for service discovery, booking, and management.

### Key Highlights
- **Role-based Architecture**: Separate interfaces for customers, providers, and administrators
- **Secure Transactions**: End-to-end secure booking and payment processing
- **Quality Assurance**: Verified reviews and ratings system
- **Scalable Design**: Built with microservices architecture for future growth

---

## ✨ Features

### For Customers
- 🔍 **Service Discovery**: Browse services by category with advanced filtering
- 📝 **Custom Requests**: Submit detailed service requirements
- 💰 **Quote Comparison**: Receive and compare multiple provider quotes
- 📅 **Easy Booking**: Secure booking system with calendar integration
- ⭐ **Review System**: Leave reviews for completed services

### For Providers
- 👤 **Professional Profiles**: Comprehensive profiles with average rating and reviews history 
- 📊 **Dashboard**: Track performance and earnings, Respond to customer requests efficiently.


### For Administrators
- 🛠 **Content Management**: Manage categories, services, and users
- 🔐 **User Management**: Role-based access control
- 🛡 **Review Moderation**: Ensure quality and authenticity

---

## 🛠 Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with OAuth2
- **Migration**: Alembic
- **Documentation**: OpenAPI/Swagger

### Frontend
- **Framework**: React  with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks

### Infrastructure
- **API Documentation**: FastAPI automatic docs
- **File Storage**: Local storage with planned cloud migration
- **Development**: Hot reload for both frontend and backend

---

## 📁 Project Structure

```
freelance-platform/
├── 📂 backend/                 # FastAPI backend application
│   ├── 📂 app/
│   │   ├── 📂 api/            # API routes and endpoints
│   │   ├── 📂 core/           # Core configuration and security
│   │   ├── 📂 models/         # Database models
│   │   ├── 📂 schemas/        # Pydantic schemas
│   │   └── 📂 services/       # Business logic
│   ├── 📂 alembic/            # Database migrations
│   └── 📄 requirements.txt    # Python dependencies
├── 📂 frontend/               # React frontend application
│   ├── 📂 src/
│   │   ├── 📂 components/     # Reusable components
│   │   ├── 📂 pages/          # Page components
│   │   ├── 📂 hooks/          # Custom React hooks
│   │   ├── 📂 services/       # API service calls
│   │   └── 📂 utils/          # Utility functions
│   ├── 📂 public/
│   │   └── 📂 static/         # Static assets and screenshots
│   └── 📄 package.json        # Node.js dependencies
├── 📄 .gitignore             # Git ignore rules
└── 📄 README.md              # Project documentation
```

---

## 📸 Screenshots

### Home Page
*Clean, modern interface with intuitive navigation*

![Home Page](frontend/public/static/screenshots/Screenshot%202025-07-24%20143435.png)

### Service Discovery
*Advanced filtering and search capabilities*

![Service Browsing](frontend/public/static/screenshots/Screenshot%202025-07-24%20172330.png)

### Provider Listings
*Detailed provider profiles with ratings and reviews*

![Service Listings](frontend/public/static/screenshots/Screenshot%202025-07-24%20172409.png)

### Booking System
*Streamlined booking process with calendar integration*

![Booking Flow](frontend/public/static/screenshots/Screenshot%202025-07-24%20172647.png)

### Admin Dashboard
*Comprehensive admin panel for platform management*

![Admin Dashboard](frontend/public/static/screenshots/Screenshot%202025-07-24%20172746.png)

> 📁 All screenshots are available in `frontend/public/static/screenshots/`

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd freelance-platform

# Backend setup
cd backend
pip install -r requirements.txt
cp .env.example .env  # Configure your environment
alembic upgrade head
uvicorn app.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 📦 Installation

### Backend Installation

1. **Environment Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Database Configuration**
   ```bash
   # Create .env file with your database credentials
   echo "DATABASE_URL=postgresql://user:password@localhost/dbname" > .env
   echo "SECRET_KEY=your-secret-key-here" >> .env
   ```

3. **Database Migration**
   ```bash
   alembic upgrade head
   ```

4. **Start Backend Server**
   ```bash
   uvicorn app.main:app --reload 
   ```

### Frontend Installation

1. **Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   echo "VITE_API_URL=http://localhost:8000" > .env
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 📚 API Documentation

The platform provides comprehensive API documentation through FastAPI's automatic documentation system.

- **Interactive Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)
- **OpenAPI Schema**: http://localhost:8000/openapi.json

### Key API Endpoints
- `POST /auth/login` - User authentication
- `GET /services` - List all services
- `POST /bookings` - Create new booking
- `GET /users/profile` - Get user profile
- `POST /reviews` - Submit service review

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 🗺 Roadmap

### Phase 1: Core Platform (✅ Completed)
- [x] User authentication and profiles
- [x] Service listings and discovery
- [x] Booking system
- [x] Review and rating system
- [x] Admin dashboard
- [x] **Real-time Notifications**: WebSocket-based updates
      
### Phase 2: Enhanced Features (🚧 In Progress)
- [ ] **Payment Integration**: Stripe/PayPal integration
- [ ] **Mobile App**: React Native applications
- [ ] **Advanced Analytics**: Provider performance metrics

### Phase 3: Advanced Features (📋 Planned)
- [ ] **AI Matching**: Machine learning-based service recommendations
- [ ] **Multi-language Support**: Internationalization with RTL support
- [ ] **Live Chat**: Real-time messaging system
- [ ] **Geolocation Services**: Location-based service discovery
- [ ] **Dispute Resolution**: Built-in conflict resolution system

---

## 👨‍💻 Author

**GUERFI Dhia Eddine**  
*Artificial Intelligence student*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Join our community discussions

---

## 🆕 Latest Updates

### 🌐 Multi-language & Arabization Support

- **partial Arabic Language Support**: The platform now supports both English and Arabic interfaces with arabic integrated with 80% of the website.
- **RTL (Right-to-Left) Layout**: Automatic RTL layout and font switching for Arabic users.
- **Dynamic Language Switching**: Users can switch between Arabic and English; language preference is saved.
- **i18n Integration**: All user-facing strings are translated using `react-i18next` and JSON locale files.
- **Arabic Fonts**: Modern Arabic fonts (Cairo, Tajawal) are integrated for a native look and feel.
- **RTL UI Enhancements**: Navigation, forms, and UI elements adapt to RTL direction for Arabic.

#### 📸 Arabization Screenshots

| Main Landing (Arabic) | About Section (Arabic) |
|-----------------------|-----------------------|
| ![Arabic Landing](frontend/public/static/screenshots/image.png) | ![Arabic About](frontend/public/static/screenshots/Screenshot%202025-07-29%20154437.png) |

| Profile (Arabic) |
|------------------|
| ![Arabic Profile](frontend/public/static/screenshots/Screenshot%202025-07-29%20154416.png) |

> **Note:** To contribute translations or improve localization, edit the files in `frontend/src/locales/ar.json` and `frontend/src/locales/en.json`.

### 🔔 Real-time Notification System

- **WebSocket Integration**: Real-time notifications delivered instantly via WebSocket connections
- **Multi-event Notifications**: Users receive alerts for various activities (bookings, requests, reviews, quotes)
- **Unread Count Tracking**: Badge indicators show number of unread notifications
- **Mark-as-Read Functionality**: Users can mark individual or all notifications as read
- **Persistent Storage**: All notifications are stored in the database with user associations
- **Notification Types**: Different notification types (request, quote, booking, review) with appropriate icons
- **Deep Linking**: Notifications include direct links to related content (requests, bookings, etc.)
- **Background Processing**: Notifications are generated asynchronously to maintain performance

#### 📱 Notification Features

| Feature | Description |
|---------|-------------|
| Bell Indicator | Real-time unread count badge on bell icon |
| Notification Panel | Dropdown panel showing recent notifications |
| Mark as Read | One-click functionality to mark notifications as read |
| Persistent State | Notifications state persists across sessions |
| Socket Reconnection | Automatic reconnection if connection is lost |

> **Note:** Notifications are delivered in real-time for logged-in users and are also available when users return to the platform after being offline.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

<div align="center">

**Built with ❤️ using FastAPI and React**

[⭐ Star this repository](../../stargazers) | [🐛 Report Bug](../../issues) | [✨ Request Feature](../../issues)

</div>
