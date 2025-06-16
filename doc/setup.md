# CineHub Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL database
- Firebase account
- TMDB API key

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd cinehub
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
# Database
DATABASE_URL=your_mysql_connection_string

# Firebase
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id

# TMDB API
TMDB_API_KEY=your_tmdb_api_key
TMDB_API_URL=https://api.themoviedb.org/3

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Set up the database:
- Create a MySQL database
- Run the database migrations (if any)

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
cinehub/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and configurations
│   ├── services/     # API services
│   ├── store/        # State management (Zustand)
│   ├── styles/       # Global styles
│   └── types/        # TypeScript type definitions
├── public/           # Static files
└── doc/             # Documentation
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Radix UI
- **Authentication**: NextAuth.js, Firebase Auth
- **Database**: MySQL, Firebase
- **API Integration**: TMDB API
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Animation**: Framer Motion
