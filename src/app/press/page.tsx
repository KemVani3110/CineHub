"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Newspaper, ExternalLink, ArrowRight } from "lucide-react";

const PressPage = () => {
  const pressReleases = [
    {
      id: 1,
      title: "CineHub Launches Revolutionary Movie Discovery Platform",
      date: "March 15, 2024",
      source: "TechCrunch",
      image: "/images/press/press-1.jpg",
      link: "#",
      category: "Launch",
    },
    {
      id: 2,
      title: "CineHub Raises $5M in Series A Funding",
      date: "February 28, 2024",
      source: "Forbes",
      image: "/images/press/press-2.jpg",
      link: "#",
      category: "Funding",
    },
    {
      id: 3,
      title: "CineHub Partners with Major Studios for Exclusive Content",
      date: "February 10, 2024",
      source: "Variety",
      image: "/images/press/press-3.jpg",
      link: "#",
      category: "Partnership",
    },
  ];

  const mediaKit = {
    logo: "/logo.png",
    brandGuidelines: "/images/press/brand-guidelines.pdf",
    pressPhotos: "/images/press/photos.zip",
    factSheet: "/images/press/fact-sheet.pdf",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Press & Media
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
              Latest news, press releases, and media resources about CineHub
            </p>
          </motion.div>
        </div>
      </section>

      {/* Press Releases Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pressReleases.map((release, index) => (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                  <CardHeader className="relative h-48 overflow-hidden">
                    <Image
                      src={release.image}
                      alt={release.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <Badge className="absolute top-4 right-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {release.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{release.date}</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {release.title}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Newspaper className="w-4 h-4" />
                        <span>{release.source}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Media Resources
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Download our media kit and brand assets for your coverage
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(mediaKit).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Image
                        src={value}
                        alt={key}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Download
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Press Inquiries
            </h2>
            <p className="text-lg text-slate-300">
              For press inquiries, please contact our media relations team
            </p>
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Contact Press Team
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PressPage; 