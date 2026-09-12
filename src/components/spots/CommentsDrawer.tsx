import React, { useState } from 'react';
import { X, Send, Heart, MessageSquare } from 'lucide-react';
import type { Comment, User } from '../../types';

interface CommentsDrawerProps {
  comments: Comment[];
  onClose: () => void;
  onAddComment: (text: string) => void;
  currentUser: User;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  comments,
  onClose,
  onAddComment,
  currentUser
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddComment(inputText.trim());
    setInputText('');
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div
        className="bottom-sheet-content"
        onClick={(e) => e.stopPropagation()}
        style={{ height: '70vh' }}
      >
        <div className="sheet-handle-bar" />
        <div className="bottom-sheet-header">
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
            Community Discussion ({comments.length})
          </h3>
          <button onClick={onClose} style={{ padding: '4px', color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Comments List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {comments.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                  marginBottom: '12px',
                  border: '1px solid #ffedd5'
                }}
              >
                <MessageSquare size={24} />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No Comments Yet
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '240px', lineHeight: 1.4 }}>
                Start the community conversation. Share your eyewitness updates or perspective!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} style={{ display: 'flex', gap: '10px' }}>
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
                      {comment.userName}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      @{comment.userHandle} • {comment.createdAt}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginTop: '2px',
                      lineHeight: 1.4
                    }}
                  >
                    {comment.content}
                  </p>
                </div>
                <button
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    color: 'var(--text-tertiary)',
                    padding: '2px'
                  }}
                >
                  <Heart size={14} />
                  <span style={{ fontSize: '10px' }}>{comment.likes}</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '10px 14px',
            borderTop: '1px solid var(--border-subtle)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <input
            type="text"
            placeholder="Add a verified citizen perspective..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              background: '#f8fafc',
              fontSize: '12px',
              color: 'var(--text-primary)'
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: inputText.trim() ? 'var(--brand-gradient)' : '#e2e8f0',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default'
            }}
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
