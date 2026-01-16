# Mortgage Portal - React Frontend

A React frontend for the Mortgage Microservices platform.

## Features

- **Dashboard** - Overview with stats and recent activity
- **Customers** - View, create, edit, delete customers
- **Properties** - Manage property listings
- **Loan Applications** - Create and manage loan applications

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Query (data fetching)
- React Hook Form + Zod (forms)
- React Router (routing)
- Axios (HTTP client)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui.tsx       # Button, Input, Modal, Badge, etc.
│   ├── DataTable.tsx # Data table with search/sort/pagination
│   └── Layout.tsx   # App layout with sidebar
├── pages/           # Page components
│   ├── DashboardPage.tsx
│   ├── CustomersPage.tsx
│   ├── PropertiesPage.tsx
│   └── LoanApplicationsPage.tsx
├── services/        # API service layer
│   └── api.ts
├── types/           # TypeScript types
│   └── index.ts
├── App.tsx          # Main app with routing
├── main.tsx         # Entry point
└── index.css        # Global styles + Tailwind
```

## API Endpoints

The frontend expects these API endpoints:

- `/api/customers` - Customer service
- `/api/properties` - Property service
- `/api/applications` - Loan application service

## Docker

```bash
# Build
docker build -t mortgage-portal .

# Run
docker run -p 8080:8080 mortgage-portal
```
