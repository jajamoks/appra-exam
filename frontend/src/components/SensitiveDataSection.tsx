/* eslint-disable no-console */
import React, { useState } from "react";
import { useSensitiveData } from "../context/SensitiveDataContext";
import VerificationModal from "./VerificationModal";

interface SensitiveDataSectionProps {
  title: string;
  children: (unlockedTitle: string) => React.ReactNode;
}

const SensitiveDataSection: React.FC<SensitiveDataSectionProps> = ({
  title,
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { state, requestVerificationCode, clearRequestError } = useSensitiveData();

  const handleUnlockSensitiveData = async () => {
    try {
      if (state.requestError) {
        clearRequestError();
      }

      await requestVerificationCode();
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to request verification code:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  if (!state.isUnlocked) {
    return (
      <>
        <div className="section sensitive-locked">
          <div className="section-header">
            <h3>🔒 {title}</h3>
          </div>

          <div className="locked-content">
            {state.requestError && (
              <div className="error-message" style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{state.requestError}</span>
                  <button
                    type="button"
                    onClick={clearRequestError}
                    style={{
                      background: "none",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "0 4px",
                      marginLeft: "8px",
                    }}
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary unlock-btn"
              onClick={handleUnlockSensitiveData}
              disabled={state.isRequestingCode}
            >
              {state.isRequestingCode
                ? "Requesting..."
                : "Unlock Sensitive Data"}
            </button>

            {state.requestSuccessMessage && !state.requestError && (
              <div className="success-message" style={{ marginTop: "16px" }}>
                {state.requestSuccessMessage}
              </div>
            )}
          </div>
        </div>

        <VerificationModal isOpen={isModalOpen} onClose={handleModalClose} />
      </>
    );
  }

  return <>{children(`${title}`)}</>;
};

export default SensitiveDataSection;
