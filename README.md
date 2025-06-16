# CineHub 🎬

CineHub is a modern web application for movie and TV show enthusiasts, built with Next.js and TypeScript. It provides a comprehensive platform for discovering, tracking, and discussing movies and TV shows.


![CineHub](public/logo.png)

## Features ✨

- 🎥 Browse movies and TV shows with TMDB integration
- 🔍 Advanced search functionality with filters
- ⭐ Rate and review content
- 📝 Create and manage watchlists
- ❤️ Save favorite movies and shows
- 👥 User authentication with Firebase
- 💬 Community discussions and comments
- 📱 Responsive design for all devices
- 🔄 Real-time updates

## Tech Stack 🛠

- **Framework**: [Next.js 18](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/), [Firebase Auth](https://firebase.google.com/docs/auth)
- **Database**: [MySQL](https://www.mysql.com/), [Firebase](https://firebase.google.com/)
- **API Integration**: [TMDB API](https://www.themoviedb.org/documentation/api)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://github.com/colinhacks/zod)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

## Project Structure 📁

```
cinehub/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions
│   ├── services/     # API services
│   ├── store/        # State management
│   ├── styles/       # Global styles
│   └── types/        # TypeScript types
├── public/           # Static files
└── doc/             # Documentation
```

## Getting Started 🚀

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL database
- Firebase account
- TMDB API key

### Installation

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

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see the application.

## Available Scripts 📜

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features Implementation

### Authentication
- Firebase Authentication integration
- NextAuth.js for session management
- Protected routes and API endpoints
- Social login support

### Movie Management
- TMDB API integration for movie data
- Real-time updates with Firebase
- Caching and performance optimization
- Search and filtering capabilities

### User Features
- Watchlist management
- Favorite movies tracking
- Rating and review system
- User profile management

### UI/UX
- Responsive design
- Dark mode support
- Loading states and animations
- Error handling and notifications

## Documentation 📚

Detailed documentation is available in the `doc` directory:

- [Setup Guide](doc/setup.md)
- [API Documentation](doc/api.md)
- [Deployment Guide](doc/deployment.md)
- [Architecture Guide](doc/architecture.md)

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Best Practices

- Follow TypeScript best practices
- Use proper error handling
- Implement proper loading states
- Follow accessibility guidelines
- Write clean and maintainable code
- Add proper documentation
- Follow Git commit conventions

## Performance Optimization

- Implement proper caching strategies
- Optimize images and assets
- Use proper code splitting
- Implement lazy loading
- Optimize database queries
- Use proper indexing

## Security Considerations

- Implement proper authentication
- Use environment variables
- Implement rate limiting
- Use proper validation
- Follow security best practices
- Regular security updates

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the movie and TV show data
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- All other open-source libraries and tools used in this project

## Contact 📧

For any questions or suggestions, please open an issue in the repository or contact the maintainers.

---

Made with ❤️ by [Your Name/Team]
