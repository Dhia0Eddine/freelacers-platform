# Freelance Platform Frontend

This is the frontend for the Freelance Platform, built with React, TypeScript, and Vite. It provides a modern, responsive interface for customers, providers, and admins to interact with the platform.

## Structure

- **src/**
  - **components/**: Reusable UI components (cards, forms, navigation, modals, etc.)
  - **context/**: React context providers for authentication and theme.
  - **pages/**: Main route pages (Home, Listings, Profile, Dashboard, Admin, etc.)
  - **services/**: API service modules for backend communication.
  - **styles/**: Global and custom CSS files.
  - **routes/**: App routing configuration.
  - **layout/**: App layout and header/footer components.
  - **config.ts**: Environment and API configuration.

## Key Features

- **Authentication**: JWT-based login/register, role-based access (customer, provider, admin).
- **Service Marketplace**: Browse, search, and filter services and listings.
- **Profile Management**: Edit profile, upload profile picture, view reviews.
- **Booking & Requests**: Request services, receive quotes, book and review providers.
- **Admin Dashboard**: Manage users, listings, requests, services, categories, and reviews.
- **Responsive Design**: Mobile-friendly layouts and navigation.
- **Modern UI**: Uses Tailwind CSS and Lucide icons for a clean look.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```
2. Start the development server:
   ```
   npm run dev
   ```
3. The app will run at `http://localhost:5173` by default.

## Environment

- Requires a running backend API (see backend README).
- API URL is configured via `VITE_API_URL` in `.env`.

## Customization

- Update styles in `src/styles/` and `src/index.css`.
- Add new pages in `src/pages/`.
- Extend API services in `src/services/api.ts`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Notes

- Static images and uploads are ignored via `.gitignore`.
- For advanced ESLint config, see the comments in this README and `eslint.config.js`.

---
