import React from "react";
import { useSensitiveData } from "../context/SensitiveDataContext";
import { formatTime, getTimerStatus } from "../utils/timeUtils";

const SensitiveDataTimer: React.FC = () => {
  const { state } = useSensitiveData();

  if (!state.isUnlocked || state.timeRemaining <= 0) {
    return null;
  }

  const getTimerClass = (): string => {
    const status = getTimerStatus(state.timeRemaining);
    return `sensitive-timer ${status === "normal" ? "" : status}`.trim();
  };

  return (
    <div className={getTimerClass()}>
      <div className="timer-content">
        <span className="timer-icon">🔓</span>
        <span className="timer-text">
          Sensitive data access: {formatTime(state.timeRemaining)}
        </span>
      </div>
    </div>
  );
};

export default SensitiveDataTimer;
