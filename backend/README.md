# Freelancers Platform Backend

## Overview
This is the backend application for the Freelancers Platform, built using FastAPI. It provides APIs for managing users, profiles, services, listings, requests, quotes, bookings, payments, and reviews. The backend interacts with a PostgreSQL database and includes authentication and authorization mechanisms.

## Features
- **User Management**: Registration, login, and profile management.
- **Service Management**: CRUD operations for services and categories.
- **Listings**: Providers can create and manage service listings.
- **Requests**: Customers can create and manage service requests.
- **Quotes**: Providers can send quotes for customer requests.
- **Bookings**: Customers can book services based on accepted quotes.
- **Payments**: Payment processing and tracking.
- **Reviews**: Customers can review completed bookings.
- **Authentication**: Token-based authentication using JWT.

## Technologies Used
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: OAuth2 and JWT
- **Migrations**: Alembic
- **Password Hashing**: Passlib (bcrypt)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Dhia0Eddine/freelacers-platform.git
   cd freelacers-platform/backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the environment variables:
   Create a `.env` file in the `backend` directory with the following content:
   ```env
   DATABASE_URL=postgresql://<username>:<password>@<host>/<database>
   JWT_SECRET=<your-secret-key>
   ```

5. Apply database migrations:
   ```bash
   alembic upgrade head
   ```

6. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation
Once the application is running, you can access the interactive API documentation at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Project Structure
```
backend/
├── alembic/                # Database migrations
├── app/
│   ├── core/               # Core configuration and utilities
│   ├── dependencies/       # Dependency injection
│   ├── models/             # Database models
│   ├── routers/            # API routes
│   ├── schemas/            # Pydantic schemas
│   ├── utils/              # Utility functions
│   ├── main.py             # Application entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
└── README.md               # Project documentation
```

## Contributing
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a detailed description of your changes.

