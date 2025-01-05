import React from 'react';

interface DialogProps {
  content: string;
  onClose: () => void;
}

export const Dialog: React.FC<DialogProps> = ({ content, onClose }) => {
  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div
          className="dialog-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <button
          className="dialog-close"
          onClick={onClose}
          aria-label="关闭"
        >
          关闭
        </button>
      </div>
    </div>
  );
};