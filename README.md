# CineHub 🎬

A modern movie discovery and management platform built with Next.js, TypeScript, and multiple database options.

## ✨ Features

- **Movie Discovery**: Browse movies with TMDB API integration
- **User Authentication**: Support for both local (MySQL) and cloud (Firestore) authentication
- **Watchlist Management**: Save and organize your favorite movies
- **Rating System**: Rate and review movies
- **Admin Dashboard**: Complete admin panel for user and content management
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark Mode**: Full dark mode support
- **Search & Filter**: Advanced search and filtering capabilities

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: NextAuth.js + Firebase Auth (production)
- **Database**: MySQL (local) + Firestore (production)
- **State Management**: Zustand
- **API Integration**: TMDB API
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Animation**: Framer Motion

## 🏗️ Deployment Options

### Local Development (MySQL + NextAuth)
Perfect for local development with full database control.

### Production (Vercel + Firestore + Firebase Auth)
Optimized for Vercel deployment with serverless architecture.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- **For Local**: MySQL database
- **For Production**: Firebase project
- TMDB API key

## 🛠️ Installation

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

3. Create a `.env.local` file in the root directory:

### For Local Development:
```env
# Database (MySQL)
DATABASE_URL=your_mysql_connection_string

# Firebase (for file storage and some features)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin (for server-side operations)
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# TMDB API
TMDB_API_KEY=your_tmdb_api_key
TMDB_API_URL=https://api.themoviedb.org/3

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Environment
NODE_ENV=development
```

### For Production (Vercel):
```env
# Firebase (primary database)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# TMDB API
TMDB_API_KEY=your_tmdb_api_key
TMDB_API_URL=https://api.themoviedb.org/3

# NextAuth (fallback)
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret

# Environment
NODE_ENV=production
VERCEL_ENV=production
```

4. **For Local Development**: Set up MySQL database and run migrations
5. **For Production**: Configure Firebase project with Firestore and Authentication

## 🔥 Firebase Setup for Production

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Enable Authentication (Google, Facebook)

2. **Configure Authentication**:
   ```bash
   # Enable authentication providers:
   - Google (configure OAuth consent screen)
   - Facebook (add Facebook app credentials)
   - Email/Password
   ```

3. **Set up Firestore Security Rules**:
   The project includes pre-configured Firestore rules in `firestore.rules`

4. **Get Firebase Config**:
   - Project Settings → General → Your apps
   - Add web app and copy config values
   - Project Settings → Service Accounts → Generate private key

## 🚀 Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## 📦 Deployment to Vercel

1. **Connect to Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables**:
   - Add all production environment variables in Vercel dashboard
   - Make sure `NODE_ENV=production` and `VERCEL_ENV=production`

3. **Deploy**:
   ```bash
   vercel --prod
   ```

The app will automatically:
- Use Firestore for user data in production
- Use Firebase Auth for authentication
- Handle social login (Google/Facebook) seamlessly
- Maintain API compatibility between local and production

## 🏗️ Architecture

### Dual Authentication System
- **Local**: MySQL + NextAuth.js (full control, faster development)
- **Production**: Firestore + Firebase Auth (serverless, scalable)

### Environment Detection
The app automatically detects environment and uses appropriate services:
```typescript
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
```

### Database Schema
- **Local**: Traditional MySQL tables
- **Production**: Firestore collections (same structure, NoSQL format)

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🧩 Project Structure

```
cinehub/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and configurations
│   ├── services/     # API services (dual MySQL/Firestore)
│   ├── store/        # State management (Zustand)
│   ├── styles/       # Global styles
│   └── types/        # TypeScript type definitions
├── public/           # Static files
├── firestore.rules   # Firestore security rules
└── doc/             # Documentation
```

## 🔧 Key Features Implementation

### Dual Authentication
- **Development**: MySQL + bcrypt + NextAuth.js
- **Production**: Firestore + Firebase Auth
- Seamless switching based on environment

### Social Login
- Google and Facebook integration
- Automatic user creation in appropriate database
- Profile sync and management

### Database Abstraction
- Services automatically choose correct database
- Consistent API across environments
- Type-safe operations

## 📖 Documentation

Detailed documentation is available in the `doc` directory:

- [Setup Guide](doc/setup.md)
- [API Documentation](doc/api.md)
- [Deployment Guide](doc/deployment.md)
- [Architecture Guide](doc/architecture.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for movie data
- [Next.js](https://nextjs.org/) for the framework
- [Firebase](https://firebase.google.com/) for cloud services
- [Vercel](https://vercel.com/) for hosting

---

**Note**: This project supports both local development with MySQL and production deployment with Firestore. The authentication system automatically adapts to the environment, providing the best development experience locally and optimal performance in production.
