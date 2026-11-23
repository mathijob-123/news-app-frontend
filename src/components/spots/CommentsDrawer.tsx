import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Heart, MessageSquare, Loader2, RefreshCw } from 'lucide-react';
import type { Comment, User } from '../../types';
import { apiClient } from '../../services/apiClient';
import { getStoredComments, saveCommentsForPost } from '../../services/storageService';

interface CommentsDrawerProps {
  postId?: string;
  comments?: Comment[];
  onClose: () => void;
  onAddComment?: (text: string) => void;
  currentUser: User;
}

/**
 * Formats ISO or relative date strings into clean, user-friendly labels.
 * e.g. "Just now", "3m ago", "2h ago", "18 Nov, 11:45 AM"
 */
function formatCommentTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  if (dateStr === 'Just now') return 'Just now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSecs < 45) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  postId = '',
  comments,
  onClose,
  onAddComment,
  currentUser
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize from props or local storage cache for instant 0ms render
  const [commentList, setCommentList] = useState<Comment[]>(() => {
    if (comments && comments.length > 0) return comments;
    if (postId) return getStoredComments(postId);
    return [];
  });

  const activePostId = postId || (comments && comments[0]?.postId) || '';

  // Function to fetch latest comments from Supabase / Backend API
  const syncComments = useCallback(async (showSpinner: boolean = false) => {
    if (!activePostId) return;
    if (showSpinner && commentList.length === 0) {
      setIsLoading(true);
    }
    try {
      const serverComments = await apiClient.getComments(activePostId);
      if (serverComments && Array.isArray(serverComments)) {
        setCommentList((prev) => {
          // Merge server comments with any local optimistic ones, deduplicating by ID
          const existingMap = new Map<string, Comment>();
          // Put server comments first (authoritative from DB)
          serverComments.forEach((c) => existingMap.set(c.id, c));
          // Keep local comments that might not have committed yet
          prev.forEach((c) => {
            if (!existingMap.has(c.id)) {
              existingMap.set(c.id, c);
            }
          });
          const merged = Array.from(existingMap.values());
          // Sort newest comments first (or chronologically)
          merged.sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime() || 0;
            const timeB = new Date(b.createdAt || 0).getTime() || 0;
            return timeB - timeA;
          });
          saveCommentsForPost(activePostId, merged);
          return merged;
        });
      }
    } catch (err) {
      console.warn('[CommentsDrawer sync error]:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activePostId, commentList.length]);

  // Initial fetch on mount or when activePostId changes
  useEffect(() => {
    if (activePostId) {
      const cached = getStoredComments(activePostId);
      if (cached && cached.length > 0) {
        setCommentList(cached);
      }
      syncComments(cached.length === 0);

      // Real-time synchronization: poll every 4 seconds while drawer is open
      const interval = setInterval(() => {
        syncComments(false);
      }, 4000);

      // Listen for custom broadcast events when a comment is added in another component or tab
      const handleCommentBroadcast = (e: any) => {
        if (e.detail?.postId === activePostId && e.detail?.comment) {
          const incoming: Comment = e.detail.comment;
          setCommentList((prev) => {
            if (prev.some((c) => c.id === incoming.id)) return prev;
            return [incoming, ...prev];
          });
        }
      };
      window.addEventListener('spotlight_comment_added', handleCommentBroadcast);

      return () => {
        clearInterval(interval);
        window.removeEventListener('spotlight_comment_added', handleCommentBroadcast);
      };
    }
  }, [activePostId, syncComments]);

  // Handle comment like toggle
  const handleToggleCommentLike = (commentId: string) => {
    setCommentList((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const nextIsLiked = !c.isLiked;
          const nextLikes = Math.max(0, (c.likes || 0) + (nextIsLiked ? 1 : -1));
          return {
            ...c,
            isLiked: nextIsLiked,
            likes: nextLikes
          };
        }
        return c;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText || isSubmitting) return;

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const newCommentId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const avatarUrl =
      currentUser.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        currentUser.displayName || 'User'
      )}&backgroundColor=ea580c&textColor=ffffff`;

    const optimisticComment: Comment = {
      id: newCommentId,
      postId: activePostId,
      userId: currentUser.id || 'usr_citizen',
      userHandle: currentUser.handle || 'citizen',
      userName: currentUser.displayName || 'Citizen Reporter',
      userAvatar: avatarUrl,
      content: cleanText,
      createdAt: now,
      updatedAt: now,
      status: 'active',
      likes: 0,
      isLiked: false
    };

    // 1. Immediate 0ms Optimistic UI update
    setCommentList((prev) => [optimisticComment, ...prev.filter((c) => c.id !== optimisticComment.id)]);
    setInputText('');

    // 2. Call parent onAddComment callback if provided
    onAddComment?.(cleanText);

    // 3. Persist permanently to Supabase REST and backend API
    try {
      if (activePostId) {
        await apiClient.addComment(activePostId, optimisticComment);
      }
    } catch (err) {
      console.warn('[CommentsDrawer] Submit warning:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="bottom-sheet-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: '75vh',
          maxHeight: '620px',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.22)'
        }}
      >
        <div className="sheet-handle-bar" style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '4px', margin: '0 auto 10px' }} />

        {/* Header */}
        <div
          className="bottom-sheet-header"
          style={{
            padding: '4px 18px 12px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Community Discussion ({commentList.length})
            </h3>
            {isLoading && <Loader2 size={13} className="animate-spin" color="var(--brand-primary)" />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => syncComments(true)}
              title="Refresh comments"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                color: 'var(--text-tertiary)',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '4px',
                color: 'var(--text-secondary)',
                background: '#f8fafc',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {isLoading && commentList.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '10px' }}>
              <Loader2 size={28} className="animate-spin" color="var(--brand-primary)" />
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Loading verified discussion...</span>
            </div>
          ) : commentList.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '50px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '18px',
                  background: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                  marginBottom: '12px',
                  border: '1.5px solid #ffedd5'
                }}
              >
                <MessageSquare size={26} />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No Comments Yet
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '260px', lineHeight: 1.45 }}>
                Be the first to share an on-ground perspective or eyewitness update with the community!
              </p>
            </div>
          ) : (
            commentList.map((comment) => {
              const avatarSrc =
                comment.userAvatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  comment.userName || 'User'
                )}&backgroundColor=ea580c&textColor=ffffff`;

              return (
                <div key={comment.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <img
                    src={avatarSrc}
                    alt={comment.userName}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        comment.userName || 'User'
                      )}&backgroundColor=ea580c&textColor=ffffff`;
                    }}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--text-primary)' }}>
                        {comment.userName}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        @{comment.userHandle} • {formatCommentTime(comment.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '12.5px',
                        color: 'var(--text-secondary)',
                        marginTop: '3px',
                        marginBottom: 0,
                        lineHeight: 1.45,
                        wordBreak: 'break-word'
                      }}
                    >
                      {comment.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleCommentLike(comment.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      background: 'transparent',
                      border: 'none',
                      color: comment.isLiked ? '#ef4444' : 'var(--text-tertiary)',
                      padding: '2px',
                      cursor: 'pointer'
                    }}
                  >
                    <Heart size={14} fill={comment.isLiked ? '#ef4444' : 'none'} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>{comment.likes || 0}</span>
                  </button>
                </div>
              );
            })
          )}
          <div ref={listEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #f1f5f9',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <img
            src={
              currentUser.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                currentUser.displayName || 'User'
              )}&backgroundColor=ea580c&textColor=ffffff`
            }
            alt={currentUser.displayName}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                currentUser.displayName || 'User'
              )}&backgroundColor=ea580c&textColor=ffffff`;
            }}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0
            }}
          />
          <input
            type="text"
            placeholder="Add a verified community perspective..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: '22px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '12.5px',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSubmitting}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: inputText.trim() ? 'var(--brand-gradient)' : '#e2e8f0',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: inputText.trim() && !isSubmitting ? 'pointer' : 'default',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      </div>
    </div>
  );
};
