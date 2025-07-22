import React from "react";

interface ExpiryWarningModalProps {
  isOpen: boolean;
  timeRemaining: number;
  onClose: () => void;
}

const ExpiryWarningModal: React.FC<ExpiryWarningModalProps> = ({
  isOpen,
  timeRemaining,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content warning-modal">
        <div className="modal-body">
          <p>⚠️ Access expires in {timeRemaining} seconds</p>
          <button onClick={onClose} className="btn btn-primary">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiryWarningModal; 