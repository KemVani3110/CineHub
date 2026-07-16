"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Mail, Reply, Send } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

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

export function ContactMessagesTable({
  messages: initialMessages,
}: {
  messages: ContactMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

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
      <div className="grid gap-4 md:hidden">
        {messages.length ? (
          messages.map((message) => (
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

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 bg-slate-800/80">
              <TableHead className="min-w-[210px] text-slate-300">Sender</TableHead>
              <TableHead className="min-w-[220px] text-slate-300">Subject</TableHead>
              <TableHead className="min-w-[360px] text-slate-300">Message</TableHead>
              <TableHead className="min-w-[150px] text-slate-300">Date</TableHead>
              <TableHead className="min-w-[120px] text-right text-slate-300">Action</TableHead>
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
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={statusClass(message.status)}>
                          {message.status}
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          email {message.email_status}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-200">
                    {message.subject}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xl whitespace-pre-wrap text-sm leading-6 text-slate-300">
                      {message.message}
                    </p>
                    {message.reply_message && (
                      <div className="mt-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs leading-5 text-green-100">
                        <div className="mb-1 font-semibold">Last reply</div>
                        <div className="whitespace-pre-wrap">{message.reply_message}</div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-200">
                      {format(new Date(message.created_at), "MMM d, yyyy")}
                    </div>
                    <div className="text-xs text-slate-500">
                      {format(new Date(message.created_at), "HH:mm")}
                    </div>
                    {message.replied_at && (
                      <div className="mt-2 text-xs text-green-300">
                        Replied {format(new Date(message.replied_at), "MMM d, HH:mm")}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-700"
                      onClick={() => openReplyDialog(message)}
                    >
                      <Reply className="mr-2 h-4 w-4" />
                      Reply
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
