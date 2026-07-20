"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const MAIN_CONTACT_EMAIL = "minhkhoi3110953@gmail.com";
const SECONDARY_EMAIL = "chuminhkhoi3110@gmail.com";

const fieldMotion = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

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

  const contactCards = [
    {
      title: "Email",
      value: MAIN_CONTACT_EMAIL,
      href: `mailto:${MAIN_CONTACT_EMAIL}`,
      icon: Mail,
      tone: "text-[var(--cinehub-accent)]",
      bg: "bg-[var(--cinehub-accent)]/12",
    },
    {
      title: "Response",
      value: "Usually within 24 hours",
      icon: Clock3,
      tone: "text-[var(--cinehub-accent)]",
      bg: "bg-[var(--cinehub-accent)]/12",
    },
    {
      title: "Location",
      value: "Ho Chi Minh City, Vietnam",
      icon: MapPin,
      tone: "text-[var(--cinehub-accent)]",
      bg: "bg-[var(--cinehub-accent)]/12",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]">
      <section className="relative border-b border-[var(--border)]/60">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.16),rgba(15,23,42,0.96)_44%,rgba(248,113,113,0.12))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-40" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.8fr)] lg:items-center lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-7"
          >
            <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--cinehub-accent)]/35 bg-slate-950/45 px-4 text-sm font-semibold text-[var(--cinehub-accent)] backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Contact
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Let&apos;s talk about CineHub or your next idea.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Send feedback, collaboration requests, or anything you want me
                to look at. I will reply from my main email.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {contactCards.map((item, index) => {
                const Icon = item.icon;
                const content = (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index }}
                    className="h-full rounded-lg border border-white/10 bg-slate-950/45 p-4 backdrop-blur transition-colors hover:border-[var(--cinehub-accent)]/45 hover:bg-slate-900/70"
                  >
                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${item.bg}`}>
                      <Icon className={`h-5 w-5 ${item.tone}`} />
                    </div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 break-words text-sm leading-6 text-slate-400">
                      {item.value}
                    </p>
                  </motion.div>
                );

                return item.href ? (
                  <a key={item.title} href={item.href} className="min-h-11 cursor-pointer">
                    {content}
                  </a>
                ) : (
                  <div key={item.title}>{content}</div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <Card className="border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur-xl">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--cinehub-accent)]/14">
                      <MessageSquareText className="h-6 w-6 text-[var(--cinehub-accent)]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Send a message</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      I read every message from this form.
                    </p>
                  </div>
                  <div className="hidden rounded-lg border border-[var(--cinehub-accent)]/25 bg-[var(--cinehub-accent)]/10 px-3 py-2 text-xs font-semibold text-[var(--cinehub-accent)] sm:inline-flex">
                    Online
                  </div>
                </div>

                <motion.form
                  onSubmit={handleSubmit}
                  initial="hidden"
                  animate="show"
                  transition={{ staggerChildren: 0.05 }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <motion.div variants={fieldMotion} className="space-y-2">
                      <label htmlFor="name" className="flex items-center text-sm font-semibold text-slate-200">
                        <User className="mr-2 h-4 w-4 text-[var(--cinehub-accent)]" />
                        Full name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="min-h-12 rounded-lg border-slate-700 bg-slate-950/65 text-white placeholder:text-slate-500 hover:border-slate-600 focus-visible:border-[var(--cinehub-accent)] focus-visible:ring-[var(--cinehub-accent)]/30"
                        required
                      />
                    </motion.div>

                    <motion.div variants={fieldMotion} className="space-y-2">
                      <label htmlFor="email" className="flex items-center text-sm font-semibold text-slate-200">
                        <Mail className="mr-2 h-4 w-4 text-[var(--cinehub-accent)]" />
                        Email address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="min-h-12 rounded-lg border-slate-700 bg-slate-950/65 text-white placeholder:text-slate-500 hover:border-slate-600 focus-visible:border-[var(--cinehub-accent)] focus-visible:ring-[var(--cinehub-accent)]/30"
                        required
                      />
                    </motion.div>
                  </div>

                  <motion.div variants={fieldMotion} className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-semibold text-slate-200">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What would you like to discuss?"
                      className="min-h-12 rounded-lg border-slate-700 bg-slate-950/65 text-white placeholder:text-slate-500 hover:border-slate-600 focus-visible:border-[var(--cinehub-accent)] focus-visible:ring-[var(--cinehub-accent)]/30"
                      required
                    />
                  </motion.div>

                  <motion.div variants={fieldMotion} className="space-y-2">
                    <label htmlFor="message" className="text-sm font-semibold text-slate-200">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      className="min-h-40 resize-y rounded-lg border-slate-700 bg-slate-950/65 text-white placeholder:text-slate-500 hover:border-slate-600 focus-visible:border-[var(--cinehub-accent)] focus-visible:ring-[var(--cinehub-accent)]/30"
                      required
                    />
                  </motion.div>

                  <motion.div variants={fieldMotion}>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="min-h-12 w-full cursor-pointer rounded-lg bg-[var(--cinehub-accent)] font-bold text-slate-950 shadow-lg shadow-[var(--cinehub-accent)]/15 hover:bg-[var(--cinehub-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-5 w-5" />
                      )}
                      {isSubmitting ? "Sending..." : "Send message"}
                      {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </motion.div>
                </motion.form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            {
              title: "Direct email",
              description: MAIN_CONTACT_EMAIL,
              icon: Mail,
            },
            {
              title: "Admin inbox",
              description: "Messages stay available for review and replies.",
              icon: CheckCircle2,
            },
            {
              title: "Backup contact",
              description: SECONDARY_EMAIL,
              icon: MessageSquareText,
              href: `mailto:${SECONDARY_EMAIL}`,
            },
          ].map((item, index) => {
            const Icon = item.icon;
            const block = (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.06 }}
                className="h-full rounded-lg border border-[var(--border)]/70 bg-slate-950/45 p-5 transition-colors hover:border-[var(--cinehub-accent)]/45 hover:bg-slate-900/70"
              >
                <Icon className="mb-4 h-6 w-6 text-[var(--cinehub-accent)]" />
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 break-words text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </motion.div>
            );

            return item.href ? (
              <a key={item.title} href={item.href} className="min-h-11 cursor-pointer">
                {block}
              </a>
            ) : (
              <div key={item.title}>{block}</div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
