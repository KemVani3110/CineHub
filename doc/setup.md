# CineHub Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
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
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# TMDB API
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

4. Set up Firebase:
- Enable Firebase Authentication providers
- Create a Firestore database
- Apply the rules from `firestore.rules`

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
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **API Integration**: TMDB API
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Animation**: Framer Motion
