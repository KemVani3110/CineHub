"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Download, Mail, Reply, Send } from "lucide-react";
import { authenticatedFetch } from "@/lib/firebase-auth-api";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 5;

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  email_status: string;
  reply_message: string;
  replied_at: string | null;
  target_email: string;
  created_at: string;
};

function statusClass(status: string) {
  if (status === "replied") return "border-green-500/40 text-green-300";
  if (status === "archived") return "border-slate-500/40 text-slate-300";
  return "border-primary/40 text-primary";
}

function escapeCsvValue(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: ContactMessage[]) {
  const headers = [
    "id",
    "name",
    "email",
    "subject",
    "message",
    "status",
    "email_status",
    "reply_message",
    "replied_at",
    "target_email",
    "created_at",
  ];
  const csv = [
    headers.join(","),
    ...rows.map((message) =>
      headers
        .map((key) => escapeCsvValue(message[key as keyof ContactMessage]))
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ContactMessagesTable({
  messages: initialMessages,
}: {
  messages: ContactMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const totalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedMessages = messages.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openReplyDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyMessage(
      message.reply_message ||
        `Hi ${message.name},\n\nThanks for reaching out about CineHub.\n\n`
    );
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) {
      toast({
        title: "Reply is empty",
        description: "Please write a reply before sending.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      const response = await authenticatedFetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMessage.id,
          replyMessage,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to send reply");
      }

      const now = new Date().toISOString();
      setMessages((current) =>
        current.map((message) =>
          message.id === selectedMessage.id
            ? {
                ...message,
                status: "replied",
                reply_message: replyMessage,
                replied_at: now,
              }
            : message
        )
      );
      setSelectedMessage(null);
      setReplyMessage("");

      toast({
        title: "Reply sent",
        description: `Email sent to ${selectedMessage.email}.`,
      });
    } catch (error) {
      toast({
        title: "Reply failed",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="flex justify-end border-b border-slate-800 p-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => downloadCsv("cinehub-contact-messages.csv", messages)}
          disabled={!messages.length}
          className="min-h-10 border-slate-700 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="grid gap-4">
        {messages.length ? (
          paginatedMessages.map((message) => (
            <article
              key={message.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white">{message.name}</h3>
                    <a
                      href={`mailto:${message.email}`}
                      className="mt-1 block truncate text-xs text-primary hover:underline"
                    >
                      {message.email}
                    </a>
                  </div>
                  <Badge variant="outline" className={statusClass(message.status)}>
                    {message.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">{message.subject}</p>
                  <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {message.message}
                  </p>
                </div>

                {message.reply_message && (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs leading-5 text-green-100">
                    <div className="mb-1 font-semibold">Last reply</div>
                    <div className="line-clamp-4 whitespace-pre-wrap">{message.reply_message}</div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    email {message.email_status}
                  </Badge>
                  <span>{format(new Date(message.created_at), "MMM d, yyyy HH:mm")}</span>
                  {message.replied_at && (
                    <span className="text-green-300">
                      Replied {format(new Date(message.replied_at), "MMM d, HH:mm")}
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-700"
                  onClick={() => openReplyDialog(message)}
                >
                  <Reply className="mr-2 h-4 w-4" />
                  Reply
                </Button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 py-12 text-center text-slate-400">
            No contact messages yet
          </div>
        )}
      </div>

      {messages.length > PAGE_SIZE && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 p-4 sm:flex-row">
          <p className="text-sm text-slate-400">
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, messages.length)} of {messages.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="border-slate-700 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </Button>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              {currentPage}/{totalPages}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="border-slate-700 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={Boolean(selectedMessage)} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="border-slate-700 bg-slate-900 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Reply to {selectedMessage?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This reply will be emailed directly to {selectedMessage?.email}.
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4 text-sm text-slate-300">
              <div className="font-semibold text-white">{selectedMessage.subject}</div>
              <div className="mt-2 whitespace-pre-wrap">{selectedMessage.message}</div>
            </div>
          )}

          <Textarea
            value={replyMessage}
            onChange={(event) => setReplyMessage(event.target.value)}
            className="min-h-[180px] border-slate-700 bg-slate-950 text-white"
            placeholder="Write your reply..."
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedMessage(null)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={sendReply} disabled={isSending}>
              <Send className="mr-2 h-4 w-4" />
              {isSending ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
