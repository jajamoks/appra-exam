/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";

import { apiService } from "../services/api";
import {
  isValidSensitiveToken,
  saveSensitiveToken,
  clearSensitiveToken,
} from "../utils/jwtHelper";
import ExpiryWarningModal from "../components/ExpiryWarningModal";

interface SensitiveDataState {
  isUnlocked: boolean;
  expiresAt: string | null;
  timeRemaining: number;
  isWarningShown: boolean;
  isExpiryWarningModalOpen: boolean;
  isWarningModalDismissed: boolean;
  isRequestingCode: boolean;
  isVerifyingCode: boolean;
  requestError: string | null;
  verifyError: string | null;
  requestSuccessMessage: string | null;
  verifySuccessMessage: string | null;
}

interface SensitiveDataContextType {
  state: SensitiveDataState;
  requestVerificationCode: () => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  clearRequestError: () => void;
  clearVerifyError: () => void;
  clearRequestSuccessMessage: () => void;
  clearVerifySuccessMessage: () => void;
}

interface SensitiveDataProviderProps {
  children: ReactNode;
}

type Action =
  | { type: "SET_REQUESTING_CODE"; payload: boolean }
  | { type: "SET_VERIFYING_CODE"; payload: boolean }
  | { type: "SET_REQUEST_ERROR"; payload: string | null }
  | { type: "SET_VERIFY_ERROR"; payload: string | null }
  | { type: "SET_REQUEST_SUCCESS_MESSAGE"; payload: string | null }
  | { type: "SET_VERIFY_SUCCESS_MESSAGE"; payload: string | null }
  | {
      type: "SET_UNLOCKED";
      payload: { expiresAt: string; timeRemaining: number };
    }
  | { type: "SET_LOCKED" }
  | { type: "UPDATE_TIME_REMAINING"; payload: number }
  | { type: "SET_WARNING_SHOWN"; payload: boolean }
  | { type: "SET_EXPIRY_WARNING_MODAL_OPEN"; payload: boolean }
  | { type: "SET_WARNING_MODAL_DISMISSED"; payload: boolean }
  | { type: "CLEAR_REQUEST_ERROR" }
  | { type: "CLEAR_VERIFY_ERROR" }
  | { type: "CLEAR_REQUEST_SUCCESS_MESSAGE" }
  | { type: "CLEAR_VERIFY_SUCCESS_MESSAGE" };

const getInitialState = (): SensitiveDataState => {
  const tokenInfo = isValidSensitiveToken();

  if (tokenInfo.valid && tokenInfo.expiresAt && tokenInfo.timeRemaining) {
    return {
      isUnlocked: true,
      expiresAt: tokenInfo.expiresAt,
      timeRemaining: tokenInfo.timeRemaining,
      isWarningShown: false,
      isExpiryWarningModalOpen: false,
      isWarningModalDismissed: false,
      isRequestingCode: false,
      isVerifyingCode: false,
      requestError: null,
      verifyError: null,
      requestSuccessMessage: null,
      verifySuccessMessage: "Session restored from previous verification",
    };
  }

  return {
    isUnlocked: false,
    expiresAt: null,
    timeRemaining: 0,
    isWarningShown: false,
    isExpiryWarningModalOpen: false,
    isWarningModalDismissed: false,
    isRequestingCode: false,
    isVerifyingCode: false,
    requestError: null,
    verifyError: null,
    requestSuccessMessage: null,
    verifySuccessMessage: null,
  };
};

const sensitiveDataReducer = (
  state: SensitiveDataState,
  action: Action
): SensitiveDataState => {
  switch (action.type) {
    case "SET_REQUESTING_CODE":
      return { ...state, isRequestingCode: action.payload };
    
    case "SET_VERIFYING_CODE":
      return { ...state, isVerifyingCode: action.payload };
    
    case "SET_REQUEST_ERROR":
      return { ...state, requestError: action.payload };
    
    case "SET_VERIFY_ERROR":
      return { ...state, verifyError: action.payload };
    
    case "SET_REQUEST_SUCCESS_MESSAGE":
      return { ...state, requestSuccessMessage: action.payload };
    
    case "SET_VERIFY_SUCCESS_MESSAGE":
      return { ...state, verifySuccessMessage: action.payload };
    
    case "SET_UNLOCKED":
      return {
        ...state,
        isUnlocked: true,
        expiresAt: action.payload.expiresAt,
        timeRemaining: action.payload.timeRemaining,
        isWarningShown: false,
        isExpiryWarningModalOpen: false,
        isWarningModalDismissed: false,
        requestError: null,
        verifyError: null,
      };
    
    case "SET_LOCKED":
      clearSensitiveToken();
      return {
        ...state,
        isUnlocked: false,
        expiresAt: null,
        timeRemaining: 0,
        isWarningShown: false,
        isExpiryWarningModalOpen: false,
        isWarningModalDismissed: false,
      };
    
    case "UPDATE_TIME_REMAINING":
      return { ...state, timeRemaining: action.payload };
    
    case "SET_WARNING_SHOWN":
      return { ...state, isWarningShown: action.payload };
    
    case "SET_EXPIRY_WARNING_MODAL_OPEN":
      return { ...state, isExpiryWarningModalOpen: action.payload };
    
    case "SET_WARNING_MODAL_DISMISSED":
      return { ...state, isWarningModalDismissed: action.payload };
    
    case "CLEAR_REQUEST_ERROR":
      return { ...state, requestError: null };
    
    case "CLEAR_VERIFY_ERROR":
      return { ...state, verifyError: null };
    
    case "CLEAR_REQUEST_SUCCESS_MESSAGE":
      return { ...state, requestSuccessMessage: null };
    
    case "CLEAR_VERIFY_SUCCESS_MESSAGE":
      return { ...state, verifySuccessMessage: null };
    
    default:
      return state;
  }
};

const SensitiveDataContext = createContext<
  SensitiveDataContextType | undefined
>(undefined);

export function SensitiveDataProvider({
  children,
}: SensitiveDataProviderProps) {
  const [state, dispatch] = useReducer(sensitiveDataReducer, getInitialState());
  const warningDismissedRef = useRef(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.isUnlocked && state.expiresAt) {
      warningDismissedRef.current = false;
      
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expiresAt = new Date(state.expiresAt!).getTime();
        const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

        dispatch({ type: "UPDATE_TIME_REMAINING", payload: timeRemaining });

        if (timeRemaining <= 60 && timeRemaining > 0 && !state.isWarningShown && !warningDismissedRef.current) {
          dispatch({ type: "SET_WARNING_SHOWN", payload: true });
          dispatch({ type: "SET_EXPIRY_WARNING_MODAL_OPEN", payload: true });
        }

        if (timeRemaining <= 0) {
          dispatch({ type: "SET_LOCKED" });
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isUnlocked, state.expiresAt]);

  const requestVerificationCode = useCallback(async () => {
    try {
      dispatch({ type: "SET_REQUESTING_CODE", payload: true });
      dispatch({ type: "SET_REQUEST_ERROR", payload: null });

      const response = await apiService.requestSensitiveDataCode();
      dispatch({ type: "SET_REQUEST_SUCCESS_MESSAGE", payload: response.message });
    } catch (error) {
      dispatch({
        type: "SET_REQUEST_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to request verification code",
      });
    } finally {
      dispatch({ type: "SET_REQUESTING_CODE", payload: false });
    }
  }, []);

  const verifyCode = useCallback(async (code: string) => {
    try {
      dispatch({ type: "SET_VERIFYING_CODE", payload: true });
      dispatch({ type: "SET_VERIFY_ERROR", payload: null });

      const response = await apiService.verifySensitiveDataCode(code);

      if (response.sensitiveDataAccess.granted) {
        const expiresAt = response.sensitiveDataAccess.expiresAt;
        const timeRemaining = Math.floor(
          (new Date(expiresAt).getTime() - new Date().getTime()) / 1000
        );

        if (response.sensitiveDataAccess.token) {
          saveSensitiveToken(response.sensitiveDataAccess.token);
        }

        dispatch({
          type: "SET_UNLOCKED",
          payload: { expiresAt, timeRemaining },
        });
        dispatch({
          type: "SET_VERIFY_SUCCESS_MESSAGE",
          payload: "Sensitive data access granted!",
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_VERIFY_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to verify code",
      });
    } finally {
      dispatch({ type: "SET_VERIFYING_CODE", payload: false });
    }
  }, []);

  const clearRequestError = useCallback(() => {
    dispatch({ type: "CLEAR_REQUEST_ERROR" });
  }, []);

  const clearVerifyError = useCallback(() => {
    dispatch({ type: "CLEAR_VERIFY_ERROR" });
  }, []);

  const clearRequestSuccessMessage = useCallback(() => {
    dispatch({ type: "CLEAR_REQUEST_SUCCESS_MESSAGE" });
  }, []);

  const clearVerifySuccessMessage = useCallback(() => {
    dispatch({ type: "CLEAR_VERIFY_SUCCESS_MESSAGE" });
  }, []);

  const handleCloseExpiryWarningModal = useCallback(() => {
    dispatch({ type: "SET_EXPIRY_WARNING_MODAL_OPEN", payload: false });
    dispatch({ type: "SET_WARNING_MODAL_DISMISSED", payload: true });
    warningDismissedRef.current = true;
  }, []);

  const value: SensitiveDataContextType = {
    state,
    requestVerificationCode,
    verifyCode,
    clearRequestError,
    clearVerifyError,
    clearRequestSuccessMessage,
    clearVerifySuccessMessage,
  };

  return (
    <SensitiveDataContext.Provider value={value}>
      {children}
      <ExpiryWarningModal
        isOpen={state.isExpiryWarningModalOpen}
        timeRemaining={state.timeRemaining}
        onClose={handleCloseExpiryWarningModal}
      />
    </SensitiveDataContext.Provider>
  );
}

export function useSensitiveData() {
  const context = useContext(SensitiveDataContext);
  if (context === undefined) {
    throw new Error(
      "useSensitiveData must be used within a SensitiveDataProvider"
    );
  }
  return context;
}
