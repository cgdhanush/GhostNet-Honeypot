import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type { SSHLog, Session, Stats } from "../types/logs";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

class APIClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add error interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: unknown) => {
        console.error("API Error:", error);
        return Promise.reject(error);
      },
    );
  }

  // Fetch all logs
  async getLogs(): Promise<SSHLog[]> {
    try {
      const response = await this.client.get<SSHLog[]>("/logs");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      throw error;
    }
  }

  // Fetch all sessions (grouped by CONN_ID)
  async getSessions(): Promise<Session[]> {
    try {
      const response = await this.client.get<Session[]>("/sessions");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      throw error;
    }
  }

  // Fetch detailed session by CONN_ID
  async getSessionDetail(connId: string): Promise<Session> {
    try {
      const response = await this.client.get<Session>(`/sessions/${connId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch session ${connId}:`, error);
      throw error;
    }
  }

  // Fetch statistics
  async getStats(): Promise<Stats> {
    try {
      const response = await this.client.get<Stats>("/stats");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      throw error;
    }
  }

  // Set authorization token for future requests
  setAuthToken(token?: string) {
    if (token) {
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common.Authorization;
    }
  }

  // Login user and return auth payload
  async login(credentials: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>(
        "/auth/login",
        credentials,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to log in:", error);
      throw error;
    }
  }

  // Register a new user
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>(
        "/auth/register",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to register:", error);
      throw error;
    }
  }

  // Fetch logs with filters
  async getLogsFiltered(
    eventType?: string,
    ipAddress?: string,
    limit?: number,
  ): Promise<SSHLog[]> {
    try {
      const params: Record<string, string | number> = {};
      if (eventType) params.event_type = eventType;
      if (ipAddress) params.ip = ipAddress;
      if (limit) params.limit = limit;

      const response = await this.client.get<SSHLog[]>("/logs", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch filtered logs:", error);
      throw error;
    }
  }
}

export default new APIClient();
