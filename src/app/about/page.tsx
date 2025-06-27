"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Users,
  Heart,
  Film,
  Star,
  Globe,
  Target,
  Lightbulb,
  Sparkles,
  Code,
  Shield,
  MapPin,
  Coffee,
  Zap,
  Database,
  Smartphone,
  Monitor,
  Lock,
  Search,
  Calendar,
  Mail,
  Github,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AboutPage = () => {
  const stats = [
    { label: "Movies & Shows", value: "50K+", icon: Film },
    { label: "User Reviews", value: "1K+", icon: Star },
    { label: "Active Users", value: "100+", icon: Users },
    { label: "Countries", value: "10+", icon: Globe },
  ];

  const skills = [
    "React & Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Zustand",
    "Shadcn UI",
    "Node.js",
    "UI/UX Design",
    "System Admin",
  ];

  const techStack = [
    {
      category: "Frontend",
      technologies: [
        { name: "Next.js 14", desc: "React framework with App Router" },
        { name: "TypeScript", desc: "Type-safe JavaScript" },
        { name: "Tailwind CSS", desc: "Utility-first CSS framework" },
        { name: "Framer Motion", desc: "Animation library" },
        { name: "Shadcn/ui", desc: "Modern UI component library" },
      ]
    },
    {
      category: "Backend & Database",
      technologies: [
        { name: "Firebase", desc: "Authentication & Database" },
        { name: "Firestore", desc: "NoSQL cloud database" },
        { name: "TMDB API", desc: "Movie & TV show data" },
        { name: "NextAuth.js", desc: "Authentication solution" },
      ]
    },
    {
      category: "State & Tools",
      technologies: [
        { name: "Zustand", desc: "Lightweight state management" },
        { name: "TanStack Query", desc: "Data fetching & caching" },
        { name: "ESLint", desc: "Code linting" },
        { name: "Vercel", desc: "Deployment platform" },
      ]
    }
  ];

  const features = [
    {
      icon: Search,
      title: "Smart Search",
      desc: "Advanced search with filters for movies, TV shows, and actors"
    },
    {
      icon: Heart,
      title: "Personal Watchlist",
      desc: "Save your favorite movies and TV shows for later"
    },
    {
      icon: Star,
      title: "Rating System",
      desc: "Rate and review movies with our intuitive rating system"
    },
    {
      icon: Users,
      title: "User Profiles",
      desc: "Personalized profiles with viewing history and preferences"
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      desc: "Optimized for desktop, tablet, and mobile devices"
    },
    {
      icon: Lock,
      title: "Secure Authentication",
      desc: "Safe login with social providers and email verification"
    }
  ];

  const timeline = [
    {
      date: "Dec 2024",
      title: "Project Launch",
      desc: "Started development of CineHub as a final project"
    },
    {
      date: "Dec 15, 2024",
      title: "Core Features",
      desc: "Implemented movie browsing, search, and user authentication"
    },
    {
      date: "Jan 5, 2025",
      title: "Advanced Features",
      desc: "Added watchlist, ratings, reviews, and admin dashboard"
    },
    {
      date: "Jan 15, 2025",
      title: "UI/UX Polish",
      desc: "Refined design, animations, and user experience"
    }
  ];



  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 md:py-0">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--cinehub-accent)]/10 via-slate-600/5 to-slate-700/10" />
          <div className="absolute top-20 left-10 w-64 md:w-96 h-64 md:h-96 bg-[var(--cinehub-accent)]/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-60 md:w-80 h-60 md:h-80 bg-slate-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/4 w-48 md:w-64 h-48 md:h-64 bg-[var(--cinehub-accent)]/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 md:space-y-8"
          >
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="CineHub"
                  width={80}
                  height={80}
                  className="w-12 h-12 md:w-15 md:h-15 rounded-full"
                />
                <span className="text-[var(--cinehub-accent)] font-medium text-sm md:text-base">
                  Welcome to CineHub
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-[var(--text-main)] via-slate-200 to-slate-300 bg-clip-text text-transparent">
                  Your Ultimate
                </span>
                <br />
                <span className="bg-gradient-to-r from-[var(--cinehub-accent)] via-slate-400 to-[var(--cinehub-accent-hover)] bg-clip-text text-transparent">
                  Cinema Experience
                </span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--text-sub)] max-w-2xl leading-relaxed">
                A modern movie discovery platform built with cutting-edge technology. 
                Explore movies, TV shows, manage your watchlist, and connect with fellow cinema enthusiasts.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {stats.slice(0, 2).map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-[var(--border)] hover:border-[var(--cinehub-accent)]/30 transition-colors"
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-[var(--cinehub-accent)] mb-2" />
                    <div className="text-xl md:text-2xl font-bold text-[var(--text-main)]">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-[var(--text-sub)]">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Creator Profile */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center lg:justify-end mt-8 lg:mt-0"
          >
            <Card className="w-full max-w-sm md:max-w-md bg-[var(--bg-card)]/90 backdrop-blur-md border-[var(--border)] hover:border-[var(--cinehub-accent)]/30 transition-colors overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="text-center space-y-4 md:space-y-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-4 border-[var(--cinehub-accent)] p-1">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <Image
                          src="/images/me.jpg"
                          alt="Huỳnh Chu Minh Khôi"
                          width={128}
                          height={128}
                          className="rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-[var(--success)] rounded-full border-4 border-[var(--bg-card)] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-[var(--text-main)]">
                        Huỳnh Chu Minh Khôi
                      </h3>
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <Badge className="bg-[var(--cinehub-accent)]/20 text-[var(--cinehub-accent)] border-[var(--cinehub-accent)]/30 text-xs hover:bg-[var(--cinehub-accent)]/30">
                          <Code className="w-3 h-3 mr-1" />
                          Frontend Developer
                        </Badge>
                        <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-xs hover:bg-slate-500/30">
                          <Shield className="w-3 h-3 mr-1" />
                          Creator
                        </Badge>
                      </div>
                    </div>

                    <p className="text-[var(--text-sub)] text-xs md:text-sm leading-relaxed">
                      Frontend developer passionate about creating intuitive user experiences. 
                      Currently learning modern web technologies through hands-on projects like CineHub.
                    </p>

                    {/* Skills */}
                    <div className="space-y-2">
                      <h4 className="text-xs md:text-sm font-semibold text-[var(--text-sub)]">
                        Technologies Used
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 text-[10px] md:text-xs bg-slate-600/20 border border-slate-500/30 rounded-full text-slate-300 hover:bg-slate-600/30 transition-colors"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs md:text-sm">
                      <div className="flex items-center gap-1 text-[var(--text-sub)]">
                        <MapPin className="w-3 h-3" />
                        Vietnam
                      </div>
                      <div className="flex items-center gap-1 text-[var(--success)]">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[var(--success)] rounded-full" />
                        Learning
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Separator */}
      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gradient-to-r from-transparent via-[var(--border)] to-transparent"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-[var(--bg-main)] px-6 py-2 rounded-full border border-[var(--border)]">
            <Sparkles className="w-5 h-5 text-[var(--cinehub-accent)]" />
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <section className="py-12 md:py-20 px-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-[var(--bg-main)] to-slate-700/30" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--cinehub-accent)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-slate-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--cinehub-accent)] to-[var(--cinehub-accent-hover)] rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)]">
                Technology Stack
              </h2>
            </div>
            <p className="text-lg md:text-xl text-[var(--text-sub)] max-w-3xl mx-auto leading-relaxed">
              Built with cutting-edge technologies for optimal performance and developer experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {techStack.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.15 }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative bg-gradient-to-br from-[var(--bg-card)]/90 to-[var(--bg-card)]/60 backdrop-blur-md rounded-2xl p-6 border border-[var(--border)]/50 hover:border-[var(--cinehub-accent)]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--cinehub-accent)]/10">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[var(--cinehub-accent)]/20 to-[var(--cinehub-accent)]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      {categoryIndex === 0 && <Monitor className="w-5 h-5 text-[var(--cinehub-accent)]" />}
                      {categoryIndex === 1 && <Database className="w-5 h-5 text-[var(--cinehub-accent)]" />}
                      {categoryIndex === 2 && <Zap className="w-5 h-5 text-[var(--cinehub-accent)]" />}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-main)]">
                      {category.category}
                    </h3>
                  </div>

                  {/* Technologies List */}
                  <div className="space-y-4">
                    {category.technologies.map((tech, techIndex) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (categoryIndex * 0.15) + (techIndex * 0.05) }}
                        className="p-3 bg-gradient-to-r from-slate-700/20 to-slate-600/20 rounded-lg border border-slate-600/30 hover:border-[var(--cinehub-accent)]/30 transition-colors group/tech"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[var(--cinehub-accent)] mt-2 group-hover/tech:scale-125 transition-transform" />
                          <div className="flex-1">
                            <h4 className="text-[var(--cinehub-accent)] font-semibold text-sm mb-1 group-hover/tech:text-[var(--cinehub-accent-hover)] transition-colors">
                              {tech.name}
                            </h4>
                            <p className="text-[var(--text-sub)] text-xs leading-relaxed">
                              {tech.desc}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--cinehub-accent)]/50 to-transparent rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom decorative text */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-sm text-[var(--text-sub)]/70 font-mono">
              &lt;/&gt; Crafted with modern tools for exceptional performance
            </p>
          </motion.div>
        </div>
      </section>

      {/* Separator */}
      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-[var(--bg-main)] px-6 py-2 rounded-full border border-[var(--border)]">
            <Code className="w-5 h-5 text-[var(--cinehub-accent)]" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-slate-800/20 via-slate-700/10 to-slate-600/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-4 md:mb-6">
              <Sparkles className="inline w-8 h-8 text-[var(--cinehub-accent)] mr-3" />
              Key Features
            </h2>
            <p className="text-lg md:text-xl text-[var(--text-sub)] max-w-3xl mx-auto leading-relaxed">
              Everything you need for the perfect movie discovery experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-xl p-6 border border-[var(--border)] hover:border-[var(--cinehub-accent)]/30 transition-colors group"
                >
                  <Icon className="w-10 h-10 text-[var(--cinehub-accent)] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--text-sub)] leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-[var(--bg-main)] px-6 py-2 rounded-full border border-[var(--border)]">
            <Star className="w-5 h-5 text-[var(--cinehub-accent)]" />
          </div>
        </div>
      </div>

      {/* Project Timeline */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-l from-[var(--success)]/5 via-slate-800/10 to-[var(--success)]/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-4 md:mb-6">
              <Calendar className="inline w-8 h-8 text-[var(--cinehub-accent)] mr-3" />
              Development Journey
            </h2>
            <p className="text-lg md:text-xl text-[var(--text-sub)] max-w-3xl mx-auto leading-relaxed">
              The story behind CineHub's creation
            </p>
          </motion.div>

                     <div className="space-y-8">
             {timeline.map((item, index) => (
               <motion.div
                 key={`${item.date}-${index}`}
                 initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.1 }}
                 className="flex items-center gap-6"
               >
                <div className="flex-shrink-0 w-24 md:w-32">
                  <span className="text-[var(--cinehub-accent)] font-medium text-sm md:text-base">
                    {item.date}
                  </span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-[var(--cinehub-accent)] rounded-full relative">
                  <div className="absolute inset-0 bg-[var(--cinehub-accent)] rounded-full animate-ping opacity-75" />
                </div>
                <div className="bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-xl p-4 border border-[var(--border)] flex-1">
                  <h3 className="text-lg font-semibold text-[var(--text-main)] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--text-sub)]">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-[var(--bg-main)] px-6 py-2 rounded-full border border-[var(--border)]">
            <Calendar className="w-5 h-5 text-[var(--success)]" />
          </div>
        </div>
      </div>

      {/* Coffee & Passion Section */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-r from-[var(--warning)]/5 via-slate-900/10 to-[var(--warning)]/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
              <Coffee className="w-5 h-5 md:w-6 md:h-6 text-[var(--warning)]" />
              <span className="text-[var(--warning)] font-medium text-sm md:text-base">
                Fueled by passion and coffee
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-4 md:mb-6">
              The Developer Behind CineHub
            </h2>

            <p className="text-lg md:text-xl text-[var(--text-sub)] leading-relaxed mb-6 md:mb-8">
              Every line of code, every design decision, and every feature in
              CineHub is crafted with one goal in mind: to create the most
              intuitive and enjoyable way to discover and explore the world of
              cinema. Late nights, countless cups of coffee, and a genuine love
              for both movies and clean code drive this project forward.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[var(--text-sub)]">
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)]/60 rounded-full border border-[var(--border)]">
                <Coffee className="w-4 h-4 text-[var(--warning)]" />
                <span className="text-sm">50+ cups of coffee</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)]/60 rounded-full border border-[var(--border)]">
                <Heart className="w-4 h-4 text-[var(--danger)]" />
                <span className="text-sm">Passion-driven development</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)]/60 rounded-full border border-[var(--border)]">
                <Zap className="w-4 h-4 text-[var(--cinehub-accent)]" />
                <span className="text-sm">Learning never stops</span>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-[var(--warning)]/10 via-transparent to-[var(--cinehub-accent)]/10 rounded-xl border border-[var(--border)]">
              <blockquote className="text-lg md:text-xl italic text-[var(--text-main)] leading-relaxed">
                "Great software is built not just with code, but with passion, 
                patience, and probably way too much coffee. CineHub is my love 
                letter to both cinema and the craft of frontend development."
              </blockquote>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-[var(--cinehub-accent)]/20 flex items-center justify-center">
                  <Code className="w-4 h-4 text-[var(--cinehub-accent)]" />
                </div>
                <span className="text-sm text-[var(--text-sub)]">— Huỳnh Chu Minh Khôi</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Separator */}
      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-[var(--bg-main)] px-6 py-2 rounded-full border border-[var(--border)]">
            <Coffee className="w-5 h-5 text-[var(--warning)]" />
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-slate-700/15 via-slate-800/10 to-slate-600/15">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-4 md:mb-6">
              <Star className="inline w-8 h-8 text-[var(--cinehub-accent)] mr-3" />
              Platform Statistics
            </h2>
            <p className="text-lg md:text-xl text-[var(--text-sub)] max-w-3xl mx-auto leading-relaxed">
              Current achievements and milestones of CineHub
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center border border-[var(--border)] hover:border-[var(--cinehub-accent)]/30 transition-colors group"
                >
                  <Icon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-3 md:mb-4 text-[var(--cinehub-accent)] group-hover:scale-110 transition-transform" />
                  <div className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-1 md:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-[var(--text-sub)]">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-[var(--bg-main)] px-6 py-2 rounded-full border border-[var(--border)]">
            <Film className="w-5 h-5 text-[var(--cinehub-accent)]" />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-[var(--cinehub-accent)]/5 via-slate-600/5 to-slate-700/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-[var(--cinehub-accent)]" />
              <span className="text-[var(--cinehub-accent)] font-medium text-sm md:text-base">
                Let's Connect
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-4 md:mb-6">
              Get In Touch
            </h2>

            <p className="text-lg md:text-xl text-[var(--text-sub)] leading-relaxed mb-6 md:mb-8">
              Interested in the project or want to collaborate? Feel free to reach out! 
              I'm always open to feedback and learning opportunities.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <a
                href="mailto:chuminhkhoi3110@gmail.com"
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)]/80 hover:bg-[var(--cinehub-accent)]/20 border border-[var(--border)] hover:border-[var(--cinehub-accent)]/30 rounded-lg transition-colors text-[var(--text-sub)] hover:text-[var(--cinehub-accent)]"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)]/80 hover:bg-[var(--cinehub-accent)]/20 border border-[var(--border)] hover:border-[var(--cinehub-accent)]/30 rounded-lg transition-colors text-[var(--text-sub)] hover:text-[var(--cinehub-accent)]"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">GitHub</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)]/80 hover:bg-[var(--cinehub-accent)]/20 border border-[var(--border)] hover:border-[var(--cinehub-accent)]/30 rounded-lg transition-colors text-[var(--text-sub)] hover:text-[var(--cinehub-accent)]"
              >
                <Linkedin className="w-4 h-4" />
                <span className="text-sm">LinkedIn</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[var(--text-sub)] mt-8">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">Always improving</span>
              </div>
              <div className="w-1 h-1 bg-slate-600 rounded-full" />
              <div className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">Innovation driven</span>
              </div>
              <div className="w-1 h-1 bg-slate-600 rounded-full" />
              <div className="flex items-center gap-1">
                <Coffee className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">Coffee powered</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
