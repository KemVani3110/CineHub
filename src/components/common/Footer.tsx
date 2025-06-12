'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Separator } from "@/components/ui/separator";
import { 
  Mail,
  Phone,
  MapPin,
  Send,
  Heart,
  Star,
  Users,
  Award,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Github,
  Linkedin,
  Building,
  Film,
  Tv,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Activity,
  Bug,
  Shield,
  FileText,
  Play,
  Calendar,
  TrendingUp,
  Zap
} from 'lucide-react';

interface FooterProps {
  isSidebarOpen?: boolean;
}

const Footer = ({ isSidebarOpen = false }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/', icon: Building },
    { name: 'Browse Movies', href: '/movies', icon: Film },
    { name: 'TV Shows', href: '/tv-shows', icon: Tv },
    { name: 'Trending', href: '/trending', icon: TrendingUp },
    { name: 'New Releases', href: '/new', icon: Calendar },
    { name: 'Top Rated', href: '/top-rated', icon: Star },
  ];

  const company = [
    { name: 'About Us', href: '/about', icon: Users },
    { name: 'Careers', href: '/careers', icon: Award },
    { name: 'Press & Media', href: '/press', icon: FileText },
    { name: 'Partnerships', href: '/partners', icon: Building },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  const features = [
    { name: 'My Watchlist', href: '/watchlist', icon: BookOpen },
    { name: 'Reviews & Ratings', href: '/reviews', icon: MessageCircle },
    { name: 'Recommendations', href: '/recommendations', icon: Zap },
    { name: 'Watch History', href: '/history', icon: Activity },
    { name: 'Collections', href: '/collections', icon: Play },
    { name: 'Premium', href: '/premium', icon: Award },
  ];

  const support = [
    { name: 'Help Center', href: '/help', icon: HelpCircle },
    { name: 'Contact Support', href: '/support', icon: MessageCircle },
    { name: 'System Status', href: '/status', icon: Activity },
    { name: 'Bug Report', href: '/bug-report', icon: Bug },
    { name: 'Privacy Policy', href: '/privacy', icon: Shield },
    { name: 'Terms of Service', href: '/terms', icon: FileText },
  ];

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/cinehub', icon: Twitter, color: 'hover:bg-blue-500' },
    { name: 'Facebook', href: 'https://facebook.com/cinehub', icon: Facebook, color: 'hover:bg-blue-600' },
    { name: 'Instagram', href: 'https://instagram.com/cinehub', icon: Instagram, color: 'hover:bg-pink-500' },
    { name: 'YouTube', href: 'https://youtube.com/cinehub', icon: Youtube, color: 'hover:bg-red-500' },
    { name: 'GitHub', href: 'https://github.com/cinehub', icon: Github, color: 'hover:bg-gray-700' },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/cinehub', icon: Linkedin, color: 'hover:bg-blue-700' },
  ];

  return (
    <footer className={`w-full bg-gradient-to-br from-card/95 via-card to-card/90 backdrop-blur-lg border-t border-border/50 transition-all duration-300 ${isSidebarOpen ? 'ml-30' : ''}`}>
      <div className={`mx-auto px-4 py-16 sm:px-6 lg:px-8 ${isSidebarOpen ? 'max-w-[calc(100%-16rem)]' : 'max-w-7xl'}`}>
        
        {/* Top Section - Brand + Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Left: Brand Section */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="relative w-14 h-14 rounded-xl p-2">
                <Image
                  src="/logo.png"
                  alt="CineHub Logo"
                  fill
                  className="object-contain rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  CineHub
                </h2>
                <p className="text-sm text-muted-foreground font-medium">Cinema Experience</p>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed max-w-lg text-base">
              Your ultimate destination for discovering amazing movies and TV shows. 
              Join millions of movie enthusiasts in exploring the world of cinema with 
              personalized recommendations and expert reviews.
            </p>

            {/* Newsletter */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail size={16} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Stay in the Loop</h3>
              </div>
              <div className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 text-sm bg-background/50 border border-border rounded-l-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <button className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-r-xl hover:bg-primary/90 transition-all hover:scale-105 flex items-center space-x-2 shadow-lg">
                  <Send size={16} />
                  <span className="hidden sm:inline">Subscribe</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Contact Info */}
          <div className="space-y-8">
            <div className="bg-background/50 rounded-xl p-8 border border-border/50 space-y-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center space-x-2">
                <Phone size={20} className="text-primary" />
                <span>Get in Touch</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm">Thành phố Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>
                
                <Link href="tel:+15551234567" className="flex items-center space-x-4 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm">+84 (0) 111 222 3333</p>
                  </div>
                </Link>
                
                <Link href="mailto:hello@cinehub.com" className="flex items-center space-x-4 text-muted-foreground hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm">hello@cinehub.com</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground relative">
              Quick Links
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 group"
                    >
                      <Icon size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground relative">
              Company
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              {company.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 group"
                    >
                      <Icon size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground relative">
              Features
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              {features.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 group"
                    >
                      <Icon size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground relative">
              Support
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              {support.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 group"
                    >
                      <Icon size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-border/50" />

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          
          {/* Left: Copyright */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-muted-foreground">
            <p className="text-sm font-medium">
              © {currentYear} CineHub. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <span>Made with</span>
              <Heart size={14} className="text-red-500 animate-pulse" />
              <span>for movie lovers worldwide</span>
            </div>
          </div>

          {/* Right: Social Links */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground font-medium mr-2">Follow us:</span>
            <div className="flex space-x-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full bg-background/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.color}`}
                    title={social.name}
                  >
                    <Icon size={18} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;