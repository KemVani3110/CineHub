import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentsProps {
  mediaId: number;
  mediaType: string;
  mediaTitle: string;
}

export function Comments({ mediaId, mediaType, mediaTitle }: CommentsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Comments</h2>
      
      {/* Comment Form */}
      <div className="space-y-4">
        <Textarea
          placeholder="Write a comment..."
          className="min-h-[100px] bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500"
        />
        <Button className="bg-[#4fd1c5] hover:bg-[#38b2ac] text-[#0d1b2a]">
          Post Comment
        </Button>
      </div>

      {/* Comments List - Placeholder */}
      <div className="space-y-4">
        <div className="text-center text-slate-500 py-8">
          <p>Comments feature coming soon!</p>
        </div>
      </div>
    </div>
  );
} 