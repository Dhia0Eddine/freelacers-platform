# Freelancers Platform Backend

## Overview
This is the backend application for the Freelancers Platform, built using FastAPI. It provides REST APIs for managing users, profiles, services, categories, listings, requests, quotes, bookings, payments, and reviews. The backend uses PostgreSQL and SQLAlchemy ORM, with JWT authentication and role-based access.

## Features
- **User Management**: Registration, login, profile, role & status (customer, provider, admin).
- **Service & Category Management**: CRUD for services and categories, including service photos.
- **Listings**: Providers create/manage service listings, with profile and rating info.
- **Requests & Quotes**: Customers request services, providers send quotes.
- **Bookings**: Customers book services after accepting quotes; providers manage booking status.
- **Reviews**: Customers review completed bookings; providers get average ratings.
- **Admin APIs**: Manage users, listings, requests, reviews, categories, and services.
- **Authentication**: JWT-based, OAuth2, password hashing.
- **Uploads**: Profile and service pictures stored in `/static/profile_pics/` and `/static/service_pics/`.
- **Pagination & Filtering**: Listings and services support pagination, search, and filters.

## Technologies Used
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: OAuth2, JWT
- **Migrations**: Alembic
- **Password Hashing**: Passlib (bcrypt)
- **File Uploads**: FastAPI UploadFile

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
   # Add this if you see ImportError for email-validator:
   pip install email-validator
   # Add this if you see RuntimeError for python-multipart:
   pip install python-multipart
   ```
   > **Note:** The backend uses Pydantic's `EmailStr` type, which requires the `email-validator` package.
   > **Note:** FastAPI form data (e.g. login, file uploads) requires the `python-multipart` package.

4. Set up environment variables:
   Create a `.env` file in the `backend` directory:
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

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Project Structure

```
backend/
├── alembic/                # Database migrations
├── app/
│   ├── core/               # Core config & security
│   ├── dependencies/       # Dependency injection
│   ├── models/             # SQLAlchemy models (User, Profile, Service, Listing, etc.)
│   ├── routers/            # API routes (auth, user, admin, service, listing, booking, review, etc.)
│   ├── schemas/            # Pydantic schemas
│   ├── utils/              # Utility functions (auth, etc.)
│   ├── main.py             # Application entry point
├── static/
│   ├── profile_pics/       # Uploaded profile images
│   ├── service_pics/       # Uploaded service images
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
└── README.md               # Project documentation
```

## Notable Updates

- **Profile Pictures**: Profile and service images are now supported and stored in `/static/profile_pics/` and `/static/service_pics/`.
- **Role & Status**: User roles (customer, provider, admin) and status (enabled/disabled) are enforced.
- **Admin Endpoints**: `/admin` routes for user/listing/request/review/service/category management.
- **Pagination & Filtering**: Listings and services support pagination, keyword search, price, location, and rating filters.
- **Review System**: Providers receive average ratings; customers can review completed bookings.
- **Booking Flow**: Bookings are created only from accepted quotes; status can be updated by provider/customer.
- **File Uploads**: Service and profile creation/update support image uploads via multipart/form-data.
- **Notifications System**: Real-time notifications via WebSockets for various activities (bookings, requests, reviews, etc.) with unread count tracking and mark-as-read functionality. Users receive immediate alerts when actions affect them, such as new requests, accepted quotes, or reviews.

