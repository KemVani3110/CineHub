import { Metadata } from "next";
import { Mail, MessageSquare, User } from "lucide-react";
import { adminDb, toIsoString } from "@/lib/firebase-admin";
import {
  ContactMessage,
  ContactMessagesTable,
} from "@/components/admin/ContactMessagesTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact Messages | CineHub Admin",
  description: "Read contact form submissions from CineHub",
};

export const dynamic = "force-dynamic";

function serializeMessage(id: string, data: any): ContactMessage {
  return {
    id,
    name: data.name || "",
    email: data.email || "",
    subject: data.subject || "",
    message: data.message || "",
    status: data.status || "new",
    email_status: data.email_status || "pending",
    reply_message: data.reply_message || "",
    replied_at: data.replied_at ? toIsoString(data.replied_at) : null,
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
              Contact form sends email notifications here
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Recent Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ContactMessagesTable messages={messages} />
        </CardContent>
      </Card>
    </div>
  );
}
