/**
 * User data types for authentication and user management
 */

export interface UserData {
  user_id: string;
  email: string;
  name: string;
  email_verification: boolean;
  labels: string[];
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    service: string;
    version: string;
  };
  message: string;
}

export interface UserAuthResponse extends ApiResponse<UserData> {}

export interface ConnectionTestResponse extends ApiResponse<{
  backend_status: string;
  timestamp: string;
  auth_required: boolean;
}> {}
