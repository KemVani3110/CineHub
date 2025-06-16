"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  Building,
  User,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Star,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Our Location",
      content: "Thành phố Hồ Chí Minh, Việt Nam",
      description: "Visit our office",
      color: "bg-blue-500/10 text-blue-500",
      link: "https://maps.google.com",
    },
    {
      icon: Phone,
      title: "Phone Number",
      content: "+84 (0) 111 222 3333",
      description: "Call us anytime",
      color: "bg-green-500/10 text-green-500",
      link: "tel:+841112223333",
    },
    {
      icon: Mail,
      title: "Email Address",
      content: "hello@cinehub.com",
      description: "Send us an email",
      color: "bg-purple-500/10 text-purple-500",
      link: "mailto:hello@cinehub.com",
    },
    {
      icon: Clock,
      title: "Working Hours",
      content: "Mon - Fri: 9:00 AM - 6:00 PM",
      description: "We are available",
      color: "bg-orange-500/10 text-orange-500",
      link: null,
    },
  ];

  const faqData = [
    {
      question: "How do I create an account on CineHub?",
      answer: "Creating an account is easy! Simply click on the 'Sign Up' button in the top right corner, fill in your email address, create a password, and follow the verification steps. You can also sign up using your Google or Facebook account for faster access."
    },
    {
      question: "What types of content are available on CineHub?",
      answer: "CineHub offers a vast library of movies and TV shows across various genres including action, drama, comedy, romance, sci-fi, and more. We regularly update our catalog with new releases and classic titles. You can browse by genre, popularity, or use our search function to find specific titles."
    },
    {
      question: "How can I rate and review movies?",
      answer: "After watching a movie, you can rate it from 1 to 5 stars and write a review. Simply go to the movie's page, scroll down to the reviews section, and click on 'Write a Review'. Your ratings help other users discover great content and contribute to our community."
    },
    {
      question: "Is CineHub available on mobile devices?",
      answer: "Yes! CineHub is fully responsive and works on all devices including smartphones, tablets, laptops, and smart TVs. You can access our platform through any modern web browser, ensuring a seamless viewing experience across all your devices."
    },
    {
      question: "How do I manage my watchlist?",
      answer: "You can add movies to your watchlist by clicking the bookmark icon on any movie's page. Access your watchlist from your profile menu to organize and track the content you want to watch later. You can also create custom lists to categorize your favorite movies."
    },
    {
      question: "What should I do if I encounter technical issues?",
      answer: "If you experience any technical problems, please check our Help Center first. For immediate assistance, you can contact our support team through the 'Contact Us' form. We typically respond within 24 hours and are committed to resolving any issues you may encounter."
    },
    {
      question: "Can I share my movie reviews with friends?",
      answer: "Absolutely! You can share your reviews and movie recommendations directly through social media platforms. Each review has a share button that allows you to post to Facebook, Twitter, or copy the link to share with friends. You can also follow other users to see their reviews and recommendations."
    },
    {
      question: "How does CineHub's recommendation system work?",
      answer: "Our recommendation system uses your viewing history, ratings, and preferences to suggest movies and TV shows you might enjoy. The more you use CineHub, the better our recommendations become. You can also discover new content through our curated lists and trending sections."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-muted/30">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Animated Background */}
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
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Let's Create Something
                <br />
                <span className="text-3xl md:text-4xl lg:text-6xl">
                  Amazing Together
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Ready to bring your vision to life? We're here to help you every
                step of the way.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="group cursor-pointer">
                <MessageSquare className="w-5 h-5 mr-2" />
                Start a Conversation
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="group cursor-pointer"
              >
                <Phone className="w-5 h-5 mr-2" />
                Schedule a Call
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div
                          className={`w-16 h-16 rounded-full ${info.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {info.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {info.description}
                          </p>
                          {info.link ? (
                            <a
                              href={info.link}
                              className="text-sm font-medium text-primary hover:underline cursor-pointer"
                            >
                              {info.content}
                            </a>
                          ) : (
                            <p className="text-sm font-medium">
                              {info.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-xl border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl flex items-center text-primary">
                    <Send className="w-6 h-6 mr-3" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as
                    possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="text-sm font-medium flex items-center text-primary"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Full Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="cursor-pointer focus:border-primary focus:ring-primary bg-background border-2 border-primary/40"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium flex items-center text-primary"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="cursor-pointer focus:border-primary focus:ring-primary bg-background border-2 border-primary/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="subject"
                        className="text-sm font-medium flex items-center text-primary"
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        className="cursor-pointer focus:border-primary focus:ring-primary bg-background border-2 border-primary/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="text-sm font-medium flex items-center text-primary"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Your Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your project or inquiry..."
                        className="min-h-[150px] cursor-pointer focus:border-primary focus:ring-primary bg-background border-2 border-primary/40"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full group cursor-pointer bg-primary hover:bg-primary/90"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Map and Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <MapPin className="w-6 h-6 mr-3 text-primary" />
                    Find Us Here
                  </CardTitle>
                  <CardDescription>
                    Located in the heart of Ho Chi Minh City
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[300px] rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241679834767!2d106.6981!3d10.7757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzMyLjUiTiAxMDbCsDQxJzUzLjMiRQ!5e0!3m2!1sen!2s!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">24h</div>
                      <div className="text-sm text-muted-foreground">
                        Response Time
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        500+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Happy Clients
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">5★</div>
                      <div className="text-sm text-muted-foreground">
                        Average Rating
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our services and processes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="border-l-4 border-primary/20 pl-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground">
              Don't hesitate to reach out. We're excited to hear about your
              project and discuss how we can help bring your ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group cursor-pointer">
                <Star className="w-5 h-5 mr-2" />
                Start Your Project
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="group cursor-pointer"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                View Our Work
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
