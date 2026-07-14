"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Code,
  Database,
  Film,
  Github,
  Heart,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  { label: "Project Type", value: "Final Project", icon: Film },
  { label: "Stack", value: "Next.js + Firebase", icon: Code },
  { label: "Data", value: "TMDB API", icon: Database },
  { label: "Focus", value: "Watch UX", icon: Sparkles },
];

const features = [
  {
    title: "Movie and TV Discovery",
    desc: "Browse, search, and explore movie or TV details using TMDB data.",
    icon: Search,
  },
  {
    title: "Firebase Authentication",
    desc: "Email/password auth, Google login, session cookies, and protected admin routes.",
    icon: Shield,
  },
  {
    title: "Personal Watch Experience",
    desc: "Watchlist, watch history, ratings, favorite actors, trailer fallback, and source reporting.",
    icon: Heart,
  },
  {
    title: "Real Admin Workflow",
    desc: "Admin pages read real Firestore data for users, analytics, activity logs, avatars, and source reports.",
    icon: Activity,
  },
];

const techStack = [
  "Next.js 15",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "Firebase Auth",
  "Firestore",
  "Firebase Admin",
  "TMDB API",
  "Zustand",
  "TanStack Query",
  "Radix UI",
  "Vercel",
];

const timeline = [
  {
    date: "Mar 2025",
    title: "Project Foundation",
    desc: "Started CineHub as a movie web application with browsing, detail pages, and TMDB integration.",
  },
  {
    date: "Apr 2025",
    title: "User Features",
    desc: "Added authentication, watchlist, ratings, history, and profile-related flows.",
  },
  {
    date: "May 2025",
    title: "Admin and Data",
    desc: "Built admin pages and moved the app toward Firebase Auth and Firestore-based data.",
  },
  {
    date: "Jun 2025",
    title: "Production Polish",
    desc: "Improved deployment readiness, stream source reliability, report source workflow, and trailer fallback.",
  },
  {
    date: "2026",
    title: "Continued Improvements",
    desc: "Still maintaining the project with Firebase auth cleanup, Vercel deploy fixes, admin data upgrades, footer/About polish, and watch experience improvements.",
  },
];

const contacts = [
  "minhkhoi3110953@gmail.com",
  "chuminhkhoi3110@gmail.com",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <section className="relative overflow-hidden px-4 py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--cinehub-accent)]/10 via-slate-800/20 to-transparent" />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-7"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14">
                <Image
                  src="/logo.png"
                  alt="CineHub Logo"
                  fill
                  sizes="56px"
                  className="rounded-full object-contain"
                  priority
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--cinehub-accent)]">
                  About CineHub
                </p>
                <p className="text-sm text-[var(--text-sub)]">
                  Personal final project by Huynh Chu Minh Khoi
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
                A movie platform built to practice real product thinking.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-[var(--text-sub)] md:text-lg">
                CineHub is my personal final project: a Next.js movie and TV
                web app focused on discovery, watchlist flows, authentication,
                admin data, and a more realistic watch experience using
                Firebase and TMDB.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href="/explore">
                  Explore CineHub
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link
                  href="https://hcmkportfolio.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Portfolio
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-[var(--border)] bg-[var(--bg-card)]/85 shadow-2xl">
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[var(--cinehub-accent)]">
                    <Image
                      src="/images/me.jpg"
                      alt="Huynh Chu Minh Khoi"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Huynh Chu Minh Khoi</h2>
                    <p className="text-sm text-[var(--text-sub)]">
                      Web Developer & Website Consultant
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-6 text-[var(--text-sub)]">
                  I built CineHub to connect frontend implementation with real
                  user flows: auth, data persistence, admin operations, watch
                  experience, and practical deployment concerns.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {highlights.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-lg border border-[var(--border)] bg-background/40 p-3"
                      >
                        <Icon className="mb-2 h-4 w-4 text-[var(--cinehub-accent)]" />
                        <p className="text-xs text-[var(--text-sub)]">{item.label}</p>
                        <p className="mt-1 text-sm font-semibold">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="max-w-3xl space-y-3">
            <Badge className="bg-[var(--cinehub-accent)]/15 text-[var(--cinehub-accent)]">
              Project Overview
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">
              What CineHub does
            </h2>
            <p className="text-[var(--text-sub)]">
              The project is designed around practical movie app workflows
              instead of a static demo page.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/75 p-6"
                >
                  <Icon className="mb-4 h-8 w-8 text-[var(--cinehub-accent)]" />
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-sub)]">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-3">
            <Badge className="bg-[var(--cinehub-accent)]/15 text-[var(--cinehub-accent)]">
              Technology
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Tech stack</h2>
            <p className="text-[var(--text-sub)]">
              The stack is focused on a modern frontend, Firebase-backed auth
              and data, and server routes that work on Vercel.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-sub)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center">
            <Badge className="bg-[var(--cinehub-accent)]/15 text-[var(--cinehub-accent)]">
              Journey
            </Badge>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Development timeline
            </h2>
          </div>

          <div className="space-y-5">
            {timeline.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -18 : 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/75 p-5 md:grid-cols-[140px_1fr]"
              >
                <div className="font-semibold text-[var(--cinehub-accent)]">
                  {item.date}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-sub)]">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-card)]/70 p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <Badge className="bg-[var(--cinehub-accent)]/15 text-[var(--cinehub-accent)]">
                Contact
              </Badge>
              <h2 className="text-3xl font-bold md:text-4xl">
                Want to know more about the project?
              </h2>
              <p className="text-[var(--text-sub)]">
                You can contact me through either email, or visit my portfolio
                to see more projects and my current profile.
              </p>
            </div>

            <div className="space-y-4">
              {contacts.map((email) => (
                <Link
                  key={email}
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-background/40 px-4 py-3 text-sm text-[var(--text-sub)] transition-colors hover:text-[var(--cinehub-accent)]"
                >
                  <Mail className="h-4 w-4 text-[var(--cinehub-accent)]" />
                  {email}
                </Link>
              ))}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild variant="outline" className="rounded-full">
                  <Link
                    href="https://github.com/KemVani3110"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link
                    href="https://www.linkedin.com/in/kh%C3%B4i-chu-7b2857308"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link
                    href="https://hcmkportfolio.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Portfolio
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--text-sub)]">
                <MapPin className="h-4 w-4 text-[var(--cinehub-accent)]" />
                Ho Chi Minh City, Vietnam
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-sub)]">
                <MessageCircle className="h-4 w-4 text-[var(--cinehub-accent)]" />
                Open to feedback, collaboration, and learning opportunities.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/75 p-6 text-center md:p-8">
          <Star className="mx-auto mb-4 h-7 w-7 text-[var(--cinehub-accent)]" />
          <blockquote className="mx-auto max-w-3xl text-base leading-7 text-[var(--text-sub)] md:text-lg">
            CineHub helped me practice turning a broad idea into a usable web
            product: reading requirements, shaping user flows, building UI,
            connecting data, and improving deployment reliability.
          </blockquote>
        </div>
      </section>
    </div>
  );
}
