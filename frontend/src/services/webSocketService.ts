import type { WebSocketMessageData } from '../types/websocket';

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private messageHandlers: ((data: WebSocketMessageData) => void)[] = [];
  private connectionStatusHandlers: ((isConnected: boolean) => void)[] = [];
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  private constructor() {
    this.connect();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private connect() {
    // Don't try to reconnect forever
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum WebSocket reconnect attempts reached');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const WS_URL = `${protocol}//${window.location.host}/ws/tasks`;
    
    try {
      this.ws = new WebSocket(WS_URL);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('🔌 WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      this.notifyConnectionStatus(true);
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected, attempting to reconnect...');
      this.isConnected = false;
      this.notifyConnectionStatus(false);
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('⚠️ WebSocket error:', error);
      this.isConnected = false;
      this.notifyConnectionStatus(false);
      // Error will trigger onclose, so reconnect will be handled there
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Basic validation that message follows our expected format
        if (!data || !data.type) {
          console.error('Invalid WebSocket message format:', data);
          return;
        }
        
        // Type check for recognized message types
        if (!['snapshot', 'task_created', 'task_updated'].includes(data.type)) {
          console.warn('Unknown WebSocket message type:', data.type);
          return;
        }
        
        console.log('📨 WebSocket message:', data);
        this.messageHandlers.forEach(handler => handler(data as WebSocketMessageData));
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  private scheduleReconnect() {
    if (!this.reconnectTimer) {
      this.reconnectAttempts++;
      // Exponential backoff - wait longer between each attempt
      const delay = Math.min(30000, 1000 * Math.pow(1.5, this.reconnectAttempts));
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, delay);
    }
  }

  public addMessageHandler(handler: (data: WebSocketMessageData) => void) {
    this.messageHandlers.push(handler);
  }

  public removeMessageHandler(handler: (data: WebSocketMessageData) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  public addConnectionStatusHandler(handler: (isConnected: boolean) => void) {
    this.connectionStatusHandlers.push(handler);
    // Immediately notify of current status
    handler(this.isConnected);
  }

  public removeConnectionStatusHandler(handler: (isConnected: boolean) => void) {
    this.connectionStatusHandlers = this.connectionStatusHandlers.filter(h => h !== handler);
  }

  private notifyConnectionStatus(isConnected: boolean) {
    this.connectionStatusHandlers.forEach(handler => handler(isConnected));
  }
}