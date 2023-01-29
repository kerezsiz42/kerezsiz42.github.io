const STARTING_RETRY_DELAY_MS = 128;
const MAX_RETRY_DELAY_MS = STARTING_RETRY_DELAY_MS * Math.pow(2, 7);

export class ReconnectingWebSocket {
  private timeoutId?: number;
  private ws?: WebSocket;
  private isConnected: boolean;
  private previousIsConnected: boolean;
  private retryDelay: number;
  private onStateChange?: (isConnected: boolean) => void;
  private onMessage?: (message: Blob) => void;
  private shouldBeOpen: boolean;

  constructor(signal?: AbortSignal) {
    this.isConnected = false;
    this.previousIsConnected = false;
    this.retryDelay = STARTING_RETRY_DELAY_MS;
    this.shouldBeOpen = false;
    signal?.addEventListener("abort", () => {
      this.shouldBeOpen = false;
      this.ws?.close();
    });
  }

  public connect(
    url: string | URL,
    onStateChange: (isConnected: boolean) => void,
    onMessage: (message: Blob) => void | Promise<void>
  ): void {
    this.shouldBeOpen = true;
    this.ws = this._connect(url);
    this.onStateChange = onStateChange;
    this.onMessage = onMessage;
  }

  private setState(newState: boolean): void {
    this.previousIsConnected = this.isConnected;
    this.isConnected = newState;
    if (this.previousIsConnected !== this.isConnected) {
      this.onStateChange?.(this.isConnected);
    }
  }

  private _connect(url: string | URL) {
    clearTimeout(this.timeoutId);
    const ws = new WebSocket(url);
    ws.onopen = () => {
      this.setState(true);
      this.retryDelay = STARTING_RETRY_DELAY_MS;
    };
    ws.onmessage = (e: MessageEvent<Blob>) => {
      this.onMessage?.(e.data);
    };
    ws.onclose = () => {
      this.setState(false);
      if (!this.shouldBeOpen) {
        return;
      }
      if (this.previousIsConnected === false && this.isConnected === false) {
        this.retryDelay *= 2;
      }
      this.timeoutId = window.setTimeout(
        () => this._connect(url),
        Math.min(MAX_RETRY_DELAY_MS, this.retryDelay)
      );
    };
    this.ws = ws;
    return ws;
  }

  public send(data: Blob) {
    this.ws?.send(data);
  }
}
