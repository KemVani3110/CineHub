"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const MAIN_CONTACT_EMAIL = "minhkhoi3110953@gmail.com";
const SECONDARY_EMAIL = "chuminhkhoi3110@gmail.com";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields before sending.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      toast({
        title: "Message sent",
        description: "Your message was saved for admin review and emailed directly to me.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Could not send message",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
      <section className="relative overflow-hidden px-4 py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background/90" />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <MessageSquare className="h-4 w-4" />
              Contact the developer
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
                Send feedback, questions, or project inquiries.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                This contact form saves your message into the CineHub admin
                panel and sends it directly to my main email automatically.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card/70 p-4">
                <Mail className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Main Email</p>
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  {MAIN_CONTACT_EMAIL}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card/70 p-4">
                <Clock className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Response</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Usually within 24 hours
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card/70 p-4">
                <MapPin className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Location</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ho Chi Minh City, Vietnam
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-primary/20 bg-card/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-primary">
                  <Send className="mr-3 h-6 w-6" />
                  Send a Message
                </CardTitle>
                <CardDescription>
                  Saved to admin and sent to the main email automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="flex items-center text-sm font-medium">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="flex items-center text-sm font-medium">
                        <Mail className="mr-2 h-4 w-4 text-primary" />
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What would you like to discuss?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      className="min-h-[160px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <Card className="border-border bg-card/80">
            <CardContent className="space-y-3 p-6">
              <CheckCircle className="h-7 w-7 text-primary" />
              <h2 className="text-lg font-semibold">Admin readable</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Every submitted message is saved to Firestore and can be read
                from the admin panel.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80">
            <CardContent className="space-y-3 p-6">
              <Mail className="h-7 w-7 text-primary" />
              <h2 className="text-lg font-semibold">Main email flow</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                The server sends the message directly to{" "}
                {MAIN_CONTACT_EMAIL}.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80">
            <CardContent className="space-y-3 p-6">
              <MessageSquare className="h-7 w-7 text-primary" />
              <h2 className="text-lg font-semibold">Second contact</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                You can also reach me at{" "}
                <a className="text-primary hover:underline" href={`mailto:${SECONDARY_EMAIL}`}>
                  {SECONDARY_EMAIL}
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
