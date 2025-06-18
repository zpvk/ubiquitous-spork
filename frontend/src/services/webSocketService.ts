export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private connectionStatusHandlers: ((isConnected: boolean) => void)[] = [];
  private isConnected: boolean = false;

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
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const WS_URL = `${protocol}//${window.location.host}/ws/tasks`;
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('🔌 WebSocket connected');
      this.isConnected = true;
      this.notifyConnectionStatus(true);
      if (this.reconnectTimer) {
        clearInterval(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected, attempting to reconnect...');
      this.isConnected = false;
      this.notifyConnectionStatus(false);
      if (!this.reconnectTimer) {
        this.reconnectTimer = setInterval(() => this.connect(), 5000);
      }
    };

    this.ws.onerror = (error) => {
      console.error('⚠️ WebSocket error:', error);
      this.isConnected = false;
      this.notifyConnectionStatus(false);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message:', data);
        this.messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  public addMessageHandler(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }

  public removeMessageHandler(handler: (data: any) => void) {
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