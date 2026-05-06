/**
 * SSH Honeypot Log Types
 */

export type EventType =
  | "NEW_CONNECTION"
  | "RAW_IN"
  | "VERSION_EXCHANGE"
  | "KEXINIT"
  | "USERAUTH_REQUEST";

export interface SSHLog {
  _id?: string;
  EVENT: EventType;
  SRC_HOST: string;
  SRC_PORT: number;
  DST_HOST: string;
  DST_PORT: number;
  LOCALVERSION?: string;
  CONN_ID: string;
  timestamp?: string;
  REMOTE_PEER_VERSION?: string;
  USERNAME?: string;
  PASSWORD?: string;
  KEY_TYPE?: string;
  COMMAND?: string;
  [key: string]: any;
}

export interface Session {
  CONN_ID: string;
  SRC_HOST: string;
  SRC_PORT: number;
  DST_HOST: string;
  DST_PORT: number;
  first_seen: string;
  last_seen: string;
  event_count: number;
  last_event_type: EventType;
  events: SSHLog[];
}

export interface Stats {
  total_connections: number;
  unique_ips: number;
  total_auth_attempts: number;
  event_type_counts: Record<EventType, number>;
}

export interface APIResponse<T> {
  data: T;
  status: number;
  message?: string;
}
