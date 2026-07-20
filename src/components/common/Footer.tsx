"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  Facebook,
  Film,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Search,
  Star,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { APP_VERSION } from "@/lib/app-info";

interface FooterProps {
  isSidebarOpen?: boolean;
}

const productLinks = [
  { name: "Home", href: "/home", icon: Film },
  { name: "Explore", href: "/explore", icon: Search },
  { name: "Watchlist", href: "/watchlist", icon: BookOpen },
  { name: "History", href: "/history", icon: Activity },
  { name: "Favorite Actors", href: "/favorite-actors", icon: Star },
];

const projectLinks = [
  { name: "About This Project", href: "/about", icon: User },
  { name: "Contact", href: "/contact", icon: Mail },
];

const developerLinks = [
  {
    name: "Portfolio",
    href: "https://hcmkportfolio.netlify.app/",
    icon: ExternalLink,
    color: "hover:bg-primary",
  },
  {
    name: "GitHub",
    href: "https://github.com/KemVani3110",
    icon: Github,
    color: "hover:bg-slate-700",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/kh%C3%B4i-chu-7b2857308",
    icon: Linkedin,
    color: "hover:bg-cinehub-accent hover:text-slate-950",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/MrKemVani/",
    icon: Facebook,
    color: "hover:bg-cinehub-accent hover:text-slate-950",
  },
  {
    name: "Email",
    href: "mailto:minhkhoi3110953@gmail.com",
    icon: Mail,
    color: "hover:bg-cinehub-accent hover:text-slate-950",
  },
];

function FooterLink({
  href,
  icon: Icon,
  name,
}: {
  href: string;
  icon: typeof Film;
  name: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:translate-x-1 hover:text-primary"
      >
        <Icon size={16} className="transition-transform group-hover:scale-110" />
        <span>{name}</span>
      </Link>
    </li>
  );
}

const Footer = ({ isSidebarOpen = false }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`w-full border-t border-border/50 bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-lg transition-all duration-300 ${
        isSidebarOpen ? "ml-30" : ""
      }`}
    >
      <div
        className={`mx-auto px-4 py-12 sm:px-6 lg:px-8 ${
          isSidebarOpen ? "max-w-[calc(100%-16rem)]" : "max-w-7xl"
        }`}
      >
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-6">
            <Link href="/home" className="flex items-center gap-4 w-fit">
              <div className="relative h-12 w-12 rounded-xl">
                <Image
                  src="/logo.png"
                  alt="CineHub Logo"
                  fill
                  sizes="48px"
                  className="rounded-full object-contain"
                />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-2xl font-bold text-transparent">
                  CineHub
                </h2>
                <p className="text-sm font-medium text-muted-foreground">
                  Movie discovery and watch experience
                </p>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              A production-style portfolio project built with Next.js,
              Firebase, TMDB, and practical admin workflows for analytics,
              watchlists, ratings, and source reports.
            </p>

            <div className="flex flex-wrap gap-2">
              {["Next.js", "Firebase", "TMDB API", "TypeScript"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="relative text-base font-semibold text-foreground">
              Browse
              <span className="absolute -bottom-2 left-0 h-0.5 w-8 rounded-full bg-primary" />
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <FooterLink key={link.name} {...link} />
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="relative text-base font-semibold text-foreground">
              About
              <span className="absolute -bottom-2 left-0 h-0.5 w-8 rounded-full bg-primary" />
            </h3>
            <ul className="space-y-3">
              {projectLinks.map((link) => (
                <FooterLink key={link.name} {...link} />
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="relative text-base font-semibold text-foreground">
              Built by
              <span className="absolute -bottom-2 left-0 h-0.5 w-8 rounded-full bg-primary" />
            </h3>

            <div className="space-y-4 rounded-xl border border-border/50 bg-background/40 p-5">
              <div>
                <p className="font-semibold text-foreground">
                  Huynh Chu Minh Khoi
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Web Developer & Website Consultant
                </p>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <Link
                  href="mailto:minhkhoi3110953@gmail.com"
                  className="flex items-center gap-3 transition-colors hover:text-primary"
                >
                  <Mail size={16} className="text-primary" />
                  <span>minhkhoi3110953@gmail.com</span>
                </Link>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-primary" />
                  <span>Ho Chi Minh City, Vietnam</span>
                </div>
              </div>

              <Link
                href="https://hcmkportfolio.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
              >
                View Portfolio
                <ArrowUpRight size={16} />
              </Link>

              <div className="flex flex-wrap gap-2 pt-1">
                {developerLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/50 text-muted-foreground transition-all duration-300 hover:scale-110 hover:text-white hover:shadow-lg ${link.color}`}
                      title={link.name}
                    >
                      <Icon size={18} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-border/50" />

        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-muted-foreground lg:flex-row lg:text-left">
          <div className="space-y-1">
            <p className="font-medium">
              Copyright {currentYear} CineHub. Built by Huynh Chu Minh Khoi.
            </p>
            <p className="text-xs">
              Portfolio project v{APP_VERSION}. Movie and TV metadata provided by TMDB.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
