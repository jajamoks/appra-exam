export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const getTimeRemaining = (expiresAt: string): number => {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  return Math.max(0, Math.floor((expiry - now) / 1000));
};

export const isTimeWarning = (seconds: number): boolean => {
  return seconds <= 60 && seconds > 0;
};

export const isTimeCaution = (seconds: number): boolean => {
  return seconds <= 300 && seconds > 60;
};

export const getTimerStatus = (seconds: number): "warning" | "caution" | "normal" => {
  if (isTimeWarning(seconds)) {
    return "warning";
  }
  if (isTimeCaution(seconds)) {
    return "caution";
  }
  return "normal";
}; 