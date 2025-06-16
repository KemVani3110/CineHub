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
  Play,
  Sparkles,
  Code,
  Shield,
  MapPin,
  Coffee,
  Zap,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AboutPage = () => {
  const stats = [
    { label: "Movies & Shows", value: "100K+", icon: Film },
    { label: "User Reviews", value: "5M+", icon: Star },
    { label: "Active Users", value: "1M+", icon: Users },
    { label: "Countries", value: "150+", icon: Globe },
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

  const achievements = [
    { icon: Award, label: "Best UI Design", desc: "2024" },
    { icon: Zap, label: "Performance", desc: "99% Uptime" },
    { icon: Heart, label: "User Satisfaction", desc: "4.9/5 Rating" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 md:py-0">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-emerald-600/20" />
          <div className="absolute top-20 left-10 w-64 md:w-96 h-64 md:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-60 md:w-80 h-60 md:h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/4 w-48 md:w-64 h-48 md:h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
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
                <span className="text-blue-400 font-medium text-sm md:text-base">
                  Welcome to CineHub
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Your Ultimate
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                  Cinema Experience
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
                Discover, explore, and immerse yourself in the world of movies
                and TV shows. Built with passion by a developer who loves great
                cinema.
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
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10"
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-blue-400 mb-2" />
                    <div className="text-xl md:text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-slate-400">{stat.label}</div>
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
            <Card className="w-full max-w-sm md:max-w-md bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="text-center space-y-4 md:space-y-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-400 to-purple-400 p-1">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                        <Image
                          src="/images/me.jpg"
                          alt="Huỳnh Chu Minh Khôi"
                          width={128}
                          height={128}
                          className="rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-emerald-500 rounded-full border-4 border-slate-800 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        Huỳnh Chu Minh Khôi
                      </h3>
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          <Code className="w-3 h-3 mr-1" />
                          Frontend Developer
                        </Badge>
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Administrator
                        </Badge>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                      Passionate developer dedicated to creating exceptional
                      user experiences. Building CineHub with modern
                      technologies and love for cinema.
                    </p>

                    {/* Skills */}
                    <div className="space-y-2">
                      <h4 className="text-xs md:text-sm font-semibold text-slate-400">
                        Expertise
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 text-[10px] md:text-xs bg-white/10 border border-white/20 rounded-full text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs md:text-sm">
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3" />
                        Vietnam
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-400 rounded-full" />
                        Available
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features & Achievements Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
              Built with <Heart className="inline w-6 h-6 md:w-8 md:h-8 text-red-500 mx-2" />{" "}
              and Code
            </h2>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              CineHub is more than just a movie platform - it's a passion
              project crafted to bring movie enthusiasts together and help them
              discover their next favorite film.
            </p>
          </motion.div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10 text-center"
                >
                  <Icon className="w-10 h-10 md:w-12 md:h-12 text-blue-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-1 md:mb-2">
                    {achievement.label}
                  </h3>
                  <p className="text-sm md:text-base text-slate-400">{achievement.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Platform Stats */}
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
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center border border-white/10"
                >
                  <Icon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-3 md:mb-4 text-purple-400" />
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-slate-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
              <Coffee className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
              <span className="text-amber-400 font-medium text-sm md:text-base">
                Fueled by passion and coffee
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
              The Future of Movie Discovery
            </h2>

            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-6 md:mb-8">
              Every line of code, every design decision, and every feature in
              CineHub is crafted with one goal in mind: to create the most
              intuitive and enjoyable way to discover and explore the world of
              cinema. This is just the beginning of our journey together.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-slate-400">
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
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">User focused</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
