export interface VerificationCode {
    id: number;
    user_id: number;
    code: string;
    expires_at: string;
    used_at: string | null;
    created_at: string;
  }
  
  export interface AuditLog {
    id: number;
    user_id: number;
    event_type: string;
    event_data: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
  }
  
  export interface RateLimit {
    id: number;
    user_id: number;
    request_type: string;
    request_count: number;
    window_start: string;
  }
  
  export interface SensitiveDataToken {
    token: string;
    expiresAt: Date;
  } 