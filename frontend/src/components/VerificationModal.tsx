import React, { useState, useEffect, useRef } from "react";
import { useSensitiveData } from "../context/SensitiveDataContext";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const {
    state,
    verifyCode,
    requestVerificationCode,
    clearRequestError,
    clearVerifyError,
    clearRequestSuccessMessage,
    clearVerifySuccessMessage,
  } = useSensitiveData();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendCooldown]);

  useEffect(() => {
    if (isOpen) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      clearRequestError();
      clearVerifyError();
      clearRequestSuccessMessage();
      clearVerifySuccessMessage();
      setCode(["", "", "", "", "", ""]);
    }
  }, [isOpen, clearRequestError, clearVerifyError, clearRequestSuccessMessage, clearVerifySuccessMessage]);

  const handleInputChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const digits = paste.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < digits.length && i < 6; i++) {
        newCode[i] = digits[i];
      }
      setCode(newCode);

      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async () => {
    const codeString = code.join("");
    if (codeString.length !== 6) {
      return;
    }

    clearRequestError();
    clearRequestSuccessMessage();
    await verifyCode(codeString);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) {
      return;
    }

    clearVerifyError();
    clearVerifySuccessMessage();
    await requestVerificationCode();
    setResendCooldown(30);
  };

  const handleClose = () => {
    setCode(["", "", "", "", "", ""]);
    onClose();
  };

  const isCodeComplete = code.every(digit => digit !== "");

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>🔐 Verify Your Identity</h2>
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            A 6-digit verification code has been sent to your email address.
          </p>

          {(state.verifyError || state.requestError) && (
            <div className="error-message">
              {state.verifyError || state.requestError}
            </div>
          )}

          {(state.verifySuccessMessage || state.requestSuccessMessage) && (
            <div className="success-message">
              {state.verifySuccessMessage || state.requestSuccessMessage}
            </div>
          )}

          <div className="code-input-container">
            <label htmlFor="verification-code">Enter verification code:</label>
            <div className="code-input-grid">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={index === 0 ? "verification-code" : undefined}
                  ref={el => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleInputChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="code-input"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!isCodeComplete || state.isVerifyingCode}
            >
              {state.isVerifyingCode ? "Verifying..." : "Submit"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={state.isVerifyingCode}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-link"
              onClick={handleResend}
              disabled={state.isRequestingCode || resendCooldown > 0}
            >
              {state.isRequestingCode
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend Code (${resendCooldown}s)`
                  : "Resend Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
