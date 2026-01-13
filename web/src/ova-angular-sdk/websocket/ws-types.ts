export interface WsRequest {
  action: string;
  payload?: any;
}

export interface WsResponse<T = any> {
  event: string; // e.g., "heartbeat", "log_update"
  status: 'success' | 'error';
  data: T; // The actual payload (generic)
  message?: string; // Optional human-readable message
}

export function createWsRequest(action: string, payload: any = {}): WsRequest {
  return {
    action,
    payload,
  };
}
