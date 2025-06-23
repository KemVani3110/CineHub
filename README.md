# CineHub 🎬

A modern movie discovery and management platform built with Next.js, featuring a dual authentication system for seamless development and production deployment.

## 🚀 Features

- **Movie Discovery**: Browse trending, popular, and top-rated movies
- **TV Shows**: Discover and track your favorite TV series  
- **Search**: Advanced search with filters and sorting
- **Watchlist**: Save movies and shows to watch later
- **Reviews & Ratings**: Rate and review content
- **User Profiles**: Customizable user profiles with avatars
- **Admin Panel**: Content and user management
- **Responsive Design**: Optimized for all devices

## 🏗 Architecture

### Dual Authentication System

**Local Development**
- MySQL database with bcrypt hashing
- NextAuth.js for session management
- Fast development with hot reloading

**Production (Vercel)**
- Firebase Authentication
- Firestore database
- Serverless and scalable

### Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js (local) / Firebase Auth (production)
- **Database**: MySQL (local) / Firestore (production)
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: Zustand
- **API**: TMDB API for movie data
- **Deployment**: Vercel

## 🔧 Quick Start

### Prerequisites

- Node.js 18+
- MySQL (for local development)
- Firebase project
- TMDB API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cinehub
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your configuration
   ```

3. **Setup MySQL database**
   ```bash
   mysql -u root -p < database/cinehub.sql
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

### Production Deployment

1. **Setup Firebase**
   - Create Firebase project
   - Enable Authentication (Email/Password, Google, Facebook)
   - Enable Firestore Database
   - Configure security rules

2. **Deploy to Vercel**
   - Connect GitHub repository
   - Configure environment variables
   - Deploy automatically on push

See [Deployment Guide](./doc/deployment.md) for detailed instructions.

## 📝 Environment Variables

### Local Development (.env.local)
```bash
# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=CINEHUB

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
JWT_SECRET=your_jwt_secret

# Firebase (for testing production features)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config

# TMDB API
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

### Production (Vercel)
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# TMDB API  
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# Environment Detection
NODE_ENV=production
VERCEL_ENV=production
```

## 🎯 Key Features

### Authentication
- **Email/Password** login and registration
- **Social Login** with Google and Facebook
- **Role-based access** (User, Moderator, Admin)
- **Profile management** with avatar upload

### Movie Management
- **Browse** trending, popular, and top-rated content
- **Search** with advanced filters
- **Details** with cast, crew, and reviews
- **Watch** trailers and videos
- **Track** favorites and watchlist

### User Experience
- **Responsive** design for all devices
- **Dark/Light** mode support
- **Performance** optimized with caching
- **Accessibility** compliant interface

## 📚 Documentation

- [API Documentation](./doc/api.md)
- [Architecture Guide](./doc/architecture.md)
- [Setup Guide](./doc/setup.md)
- [Deployment Guide](./doc/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the movie data API
- [Next.js](https://nextjs.org/) for the amazing framework
- [Firebase](https://firebase.google.com/) for authentication and database
- [Vercel](https://vercel.com/) for seamless deployment

## 📞 Support

If you have any questions or issues, please:
1. Check the [documentation](./doc/)
2. Search existing [issues](../../issues)
3. Create a new [issue](../../issues/new) if needed

---

Built with ❤️ using Next.js and Firebase
