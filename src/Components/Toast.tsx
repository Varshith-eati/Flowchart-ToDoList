import React from 'react';
import { RotateCcwIcon, XIcon } from './Icons';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onUndo, onClose }) => {
  return (
    <div className="toast-notification">
      <div className="toast-content">
        <span className="toast-message">{message}</span>
      </div>
      <div className="toast-actions">
        {onUndo && (
          <button className="toast-undo-btn" onClick={onUndo}>
            <RotateCcwIcon size={13} />
            <span>Undo</span>
          </button>
        )}
        <button className="toast-close-btn" onClick={onClose}>
          <XIcon size={14} />
        </button>
      </div>
    </div>
  );
};

export default Toast;

