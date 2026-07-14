import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Mail, MessageSquare, Reply, User } from "lucide-react";
import { adminDb, toIsoString } from "@/lib/firebase-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Contact Messages | CineHub Admin",
  description: "Read contact form submissions from CineHub",
};

export const dynamic = "force-dynamic";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  target_email: string;
  created_at: string;
};

function serializeMessage(id: string, data: any): ContactMessage {
  return {
    id,
    name: data.name || "",
    email: data.email || "",
    subject: data.subject || "",
    message: data.message || "",
    status: data.status || "new",
    target_email: data.target_email || "minhkhoi3110953@gmail.com",
    created_at: toIsoString(data.created_at),
  };
}

async function getContactMessages() {
  const snapshot = await adminDb
    .collection("contact_messages")
    .orderBy("created_at", "desc")
    .limit(100)
    .get();

  return snapshot.docs.map((doc) => serializeMessage(doc.id, doc.data()));
}

function buildReplyHref(message: ContactMessage) {
  const subject = encodeURIComponent(`Re: ${message.subject}`);
  const body = encodeURIComponent(
    `Hi ${message.name},\n\n\n\n---\nOriginal message:\n${message.message}`
  );

  return `mailto:${message.email}?subject=${subject}&body=${body}`;
}

export default async function ContactMessagesPage() {
  const messages = await getContactMessages();
  const newMessages = messages.filter((message) => message.status === "new").length;

  return (
    <div className="container mx-auto space-y-8 px-4 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <MessageSquare className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Contact Messages</h1>
            <p className="text-slate-400">
              Messages submitted from the public contact form.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-slate-700 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Messages
            </CardTitle>
            <MessageSquare className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {messages.length.toLocaleString()}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Latest 100 messages from Firestore
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              New Messages
            </CardTitle>
            <Mail className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {newMessages.toLocaleString()}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Waiting for your review
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">
              Target Email
            </CardTitle>
            <User className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="break-all text-lg font-bold text-white">
              minhkhoi3110953@gmail.com
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Contact form opens this email after saving
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Recent Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 bg-slate-800/80">
                  <TableHead className="min-w-[210px] text-slate-300">Sender</TableHead>
                  <TableHead className="min-w-[220px] text-slate-300">Subject</TableHead>
                  <TableHead className="min-w-[360px] text-slate-300">Message</TableHead>
                  <TableHead className="min-w-[150px] text-slate-300">Date</TableHead>
                  <TableHead className="min-w-[110px] text-right text-slate-300">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length ? (
                  messages.map((message) => (
                    <TableRow key={message.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-white">{message.name}</div>
                          <a
                            href={`mailto:${message.email}`}
                            className="block text-xs text-primary hover:underline"
                          >
                            {message.email}
                          </a>
                          <Badge variant="outline" className="border-primary/40 text-primary">
                            {message.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-200">
                        {message.subject}
                      </TableCell>
                      <TableCell>
                        <p className="max-w-xl whitespace-pre-wrap text-sm leading-6 text-slate-300">
                          {message.message}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-200">
                          {format(new Date(message.created_at), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-slate-500">
                          {format(new Date(message.created_at), "HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm" className="border-slate-700">
                          <Link href={buildReplyHref(message)}>
                            <Reply className="mr-2 h-4 w-4" />
                            Reply
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                      No contact messages yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
