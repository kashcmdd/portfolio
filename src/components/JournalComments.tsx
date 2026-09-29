import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  entryId: string;
}

interface JournalCommentsProps {
  entryId: string;
}

export const JournalComments: React.FC<JournalCommentsProps> = ({ entryId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments from localStorage
  useEffect(() => {
    const storedComments = localStorage.getItem(`journal_comments_${entryId}`);
    if (storedComments) {
      try {
        setComments(JSON.parse(storedComments));
      } catch (e) {
        console.error('Failed to parse comments:', e);
      }
    }
  }, [entryId]);

  // Save comments to localStorage
  const saveComments = (updatedComments: Comment[]) => {
    localStorage.setItem(`journal_comments_${entryId}`, JSON.stringify(updatedComments));
    setComments(updatedComments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const comment: Comment = {
      id: Date.now().toString(),
      author: authorName.trim(),
      content: newComment.trim(),
      timestamp: Date.now(),
      entryId,
    };

    // Simulate network delay for better UX
    setTimeout(() => {
      saveComments([...comments, comment]);
      setNewComment('');
      setIsSubmitting(false);
    }, 500);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-[#89AACC]" />
        <h3 className="text-lg font-display italic font-semibold text-white">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="liquid-glass rounded-2xl p-4 border border-white/10">
          <div className="mb-4">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-[#89AACC] transition-colors font-body text-sm"
              required
              maxLength={50}
            />
          </div>
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-[#89AACC] transition-colors font-body text-sm resize-none"
              rows={3}
              required
              maxLength={500}
            />
            <div className="text-right text-xs text-neutral-500 mt-1">
              {newComment.length}/500
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim() || !authorName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full accent-gradient text-black font-semibold text-sm font-body hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Post Comment</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-neutral-500" />
            </div>
            <p className="text-sm text-neutral-400 font-body">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          [...comments]
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((comment) => (
              <div
                key={comment.id}
                className="liquid-glass rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full accent-gradient flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm font-body">
                        {comment.author}
                      </span>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300 font-body leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      <p className="text-xs text-neutral-500 mt-4 text-center font-body">
        Comments are stored locally in your browser. They won't be visible to other users.
      </p>
    </div>
  );
};
