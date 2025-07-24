# Freelance Platform

A modern service marketplace platform connecting customers with skilled providers for home services, tech help, tutoring, and more. Built with FastAPI (backend) and React + TypeScript (frontend).

---

## Project Structure

```
freelacers platform/
├── backend/      # FastAPI backend (API, database, auth, business logic)
├── frontend/     # React + Vite frontend (UI, routing, API calls)
├── .gitignore    # Ignore files/folders (including uploads/static)
├── README.md     # Project documentation (this file)
```

---

## Backend (`backend/`)

- **Framework:** FastAPI
- **Database:** PostgreSQL (via SQLAlchemy ORM)
- **Features:**
  - User authentication (JWT, OAuth2)
  - Profiles, services, categories, listings, requests, quotes, bookings, reviews
  - Admin APIs for managing users, listings, requests, reviews
  - Alembic for migrations
- **Docs:** See [`backend/README.md`](./backend/README.md) for setup, API docs, and structure.

---

## Frontend (`frontend/`)

- **Framework:** React + TypeScript + Vite
- **Features:**
  - Modern UI with Tailwind CSS and Lucide icons
  - Role-based dashboards (customer, provider, admin)
  - Service/category navigation, search, filtering
  - Profile management, booking, reviews
  - Responsive and mobile-friendly
- **Docs:** See [`frontend/README.md`](./frontend/README.md) for structure, setup, and customization.

---
## Pictures

Below are screenshots of the most important pages and functions of the platform:

### Home Page
![Home Page](frontend/public/static/screenshots/Screenshot%202025-07-24%20143435.png)
---
![Home Page](frontend/public/static/screenshots/Screenshot%202025-07-24%20172207.png)
---
- Hero section, category navigation, trending services, and call-to-action buttons.
---
### Service Browsing
---
![Service Browsing](frontend/public/static/screenshots/Screenshot%202025-07-24%20172330.png)
---
- Browse all services, filter by category, search, and view service cards.
---
### Service Listings
---
![Service Listings](frontend/public/static/screenshots/Screenshot%202025-07-24%20172409.png)
---
- Listings for a selected service, with filters, pagination, and provider info.
---
### Listing Detail
---
![Listing Detail](frontend/public/static/screenshots/Screenshot%202025-07-24%20172442.png)
---
- Full details of a service listing, provider profile, reviews, and booking/request actions.
---
### User Profile
---
![User Profile](frontend/public/static/screenshots/Screenshot%202025-07-24%20172553.png)
---
- Provider/customer profile, bio, contact info, listings, reviews, and testimonials.
---
### Request & Quote Flow
---
![Request & Quote](frontend/public/static/screenshots/Screenshot%202025-07-24%20173611.png)
---
![Request & Quote](frontend/public/static/screenshots/Screenshot%202025-07-24%20173500.png)
---
- Request service, receive quotes, accept/decline, and schedule booking.
---
### Booking Flow
---
![Booking Flow](frontend/public/static/screenshots/Screenshot%202025-07-24%20172647.png)
---
- Booking form modal, calendar/time selection, booking confirmation.
---
### Admin Dashboard
---
![Admin Dashboard](frontend/public/static/screenshots/Screenshot%202025-07-24%20172746.png)
---
- Manage users, listings, requests, services, categories, and reviews.
---
### Review System
---
![Review System](frontend/public/static/screenshots/Screenshot%202025-07-24%20172647.png)
---
- Leave reviews for completed bookings, view ratings and comments.
---
> All screenshots are located in `frontend/public/static/screenshots/`. Add new screenshots as features are updated.

---

## Getting Started

### 1. Backend

- Install Python dependencies: `pip install -r requirements.txt`
- Set up `.env` with DB and JWT secret
- Run migrations: `alembic upgrade head`
- Start server: `uvicorn app.main:app --reload`
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend

- Install Node dependencies: `npm install`
- Start dev server: `npm run dev`
- App runs at [http://localhost:5173](http://localhost:5173)

---

## Environment

- Backend API URL is set in frontend `.env` as `VITE_API_URL`
- Static uploads (profile/service pictures) are ignored via `.gitignore`

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and commit
4. Submit a pull request

---

## License

MIT (or specify your license)

---

## Authors

- Dhia0Eddine (and contributors)

---

## Notes

- For advanced linting, see `frontend/README.md` and `eslint.config.js`
- For database migrations, see `backend/alembic/`
- For API schemas, see `backend/app/schemas/`

---
