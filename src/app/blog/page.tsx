"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  User,
  Clock,
  Tag,
  ChevronRight,
  BookOpen,
  Star,
  ThumbsUp,
  MessageSquare,
  Filter,
  TrendingUp,
  BookmarkPlus,
  Share2,
  ArrowRight,
  Sparkles,
  Flame,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [isBookmarked, setIsBookmarked] = useState(false);

  const categories = [
    { name: "Movie Reviews", count: 24, icon: Star },
    { name: "Industry News", count: 18, icon: Flame },
    { name: "Behind the Scenes", count: 12, icon: Sparkles },
    { name: "Interviews", count: 15, icon: User },
    { name: "Film Analysis", count: 20, icon: BookOpen },
    { name: "Awards & Events", count: 8, icon: Star },
  ];

  const featuredPost = {
    title: "The Evolution of Cinema in the Digital Age",
    excerpt: "Exploring how technology has transformed the movie industry and what the future holds for filmmakers and audiences alike...",
    author: "John Smith",
    date: "Mar 15, 2024",
    readTime: "5 min read",
    category: "Industry News",
    likes: 245,
    comments: 32,
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3",
  };

  const popularPosts = [
    {
      title: "Top 10 Movies to Watch This Summer",
      excerpt: "A curated list of must-watch films for the upcoming season...",
      author: "Sarah Johnson",
      date: "Mar 14, 2024",
      readTime: "4 min read",
      category: "Movie Reviews",
      likes: 189,
      comments: 28,
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3",
    },
    {
      title: "Behind the Scenes: Making of Blockbuster Hits",
      excerpt: "An exclusive look at how today's biggest movies are made...",
      author: "Michael Chen",
      date: "Mar 13, 2024",
      readTime: "6 min read",
      category: "Behind the Scenes",
      likes: 156,
      comments: 24,
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3",
    },
  ];

  const recentPosts = [
    {
      title: "The Art of Film Scoring",
      excerpt: "How music shapes our movie-watching experience...",
      author: "Emma Wilson",
      date: "Mar 16, 2024",
      readTime: "4 min read",
      category: "Film Analysis",
      likes: 98,
      comments: 15,
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3",
    },
    {
      title: "Interview with Award-Winning Director",
      excerpt: "Exclusive conversation about the future of filmmaking...",
      author: "David Lee",
      date: "Mar 15, 2024",
      readTime: "7 min read",
      category: "Interviews",
      likes: 112,
      comments: 19,
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-muted/30">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-background/90" />
          <motion.div
            className="absolute top-20 left-10 w-40 h-40 lg:w-72 lg:h-72 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-48 h-48 lg:w-96 lg:h-96 bg-blue-500/8 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                CineHub Blog
                <br />
                <span className="text-3xl md:text-4xl lg:text-6xl">
                  Discover the World of Cinema
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Explore the latest news, reviews, and insights from the world of
                movies and entertainment.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="relative group">
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 text-lg rounded-full border-2 border-primary/40 focus:border-primary focus:ring-primary transition-all duration-300 group-hover:border-primary/60"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl group"
          >
            <div className="relative h-[400px] md:h-[500px]">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="max-w-3xl">
                  <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 transition-colors duration-300">
                    {featuredPost.category}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300">
                    {featuredPost.title}
                  </h2>
                  <p className="text-lg text-white/80 mb-6 group-hover:text-white transition-colors duration-300">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center space-x-4 text-white/80">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {featuredPost.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.name} value={category.name.toLowerCase()}>
                          {category.name} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-sm">
                      <Filter className="w-4 h-4" />
                      More Filters
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Trending
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Most Liked
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Most Commented
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              {/* Popular Posts */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-primary" />
                  Popular Posts
                </h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {popularPosts.map((post, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="relative h-48 md:h-full overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <CardContent className="p-6">
                            <Badge className="mb-2 bg-primary/20 text-primary hover:bg-primary/30 transition-colors duration-300">
                              {post.category}
                            </Badge>
                            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors duration-300 cursor-pointer">
                              {post.title}
                            </CardTitle>
                            <CardDescription className="mb-4">
                              {post.excerpt}
                            </CardDescription>
                            <div className="flex items-center text-sm text-muted-foreground mb-4">
                              <User className="w-4 h-4 mr-2" />
                              {post.author}
                              <Clock className="w-4 h-4 ml-4 mr-2" />
                              {post.date}
                              <BookOpen className="w-4 h-4 ml-4 mr-2" />
                              {post.readTime}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <ThumbsUp className="w-4 h-4 mr-1" />
                                  {post.likes}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  {post.comments}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:text-primary transition-colors duration-300"
                                  onClick={() => setIsBookmarked(!isBookmarked)}
                                >
                                  {isBookmarked ? (
                                    <Bookmark className="w-4 h-4 fill-primary text-primary" />
                                  ) : (
                                    <BookmarkPlus className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:text-primary transition-colors duration-300"
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Recent Posts */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-primary" />
                  Recent Posts
                </h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {recentPosts.map((post, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="relative h-48 md:h-full overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <CardContent className="p-6">
                            <Badge className="mb-2 bg-primary/20 text-primary hover:bg-primary/30 transition-colors duration-300">
                              {post.category}
                            </Badge>
                            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors duration-300 cursor-pointer">
                              {post.title}
                            </CardTitle>
                            <CardDescription className="mb-4">
                              {post.excerpt}
                            </CardDescription>
                            <div className="flex items-center text-sm text-muted-foreground mb-4">
                              <User className="w-4 h-4 mr-2" />
                              {post.author}
                              <Clock className="w-4 h-4 ml-4 mr-2" />
                              {post.date}
                              <BookOpen className="w-4 h-4 ml-4 mr-2" />
                              {post.readTime}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <ThumbsUp className="w-4 h-4 mr-1" />
                                  {post.likes}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  {post.comments}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:text-primary transition-colors duration-300"
                                  onClick={() => setIsBookmarked(!isBookmarked)}
                                >
                                  {isBookmarked ? (
                                    <Bookmark className="w-4 h-4 fill-primary text-primary" />
                                  ) : (
                                    <BookmarkPlus className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:text-primary transition-colors duration-300"
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Categories */}
              <Card className="bg-muted/30 backdrop-blur-sm border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-primary" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 hover:bg-primary/10 rounded-lg cursor-pointer group transition-colors duration-300"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-sm group-hover:text-primary transition-colors duration-300">
                              {category.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="secondary" className="mr-2 group-hover:bg-primary/20 transition-colors duration-300">
                              {category.count}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-xl">Subscribe to Newsletter</CardTitle>
                  <CardDescription>
                    Get the latest articles and news delivered to your inbox.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full bg-background/50 backdrop-blur-sm border-2 border-primary/20 focus:border-primary focus:ring-primary"
                    />
                    <Button className="w-full group">
                      Subscribe
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card className="bg-muted/30 backdrop-blur-sm border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-xl">Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Movies",
                      "Reviews",
                      "News",
                      "Interviews",
                      "Analysis",
                      "Awards",
                      "Cinema",
                      "Hollywood",
                    ].map((tag, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors duration-300"
                        >
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage; 