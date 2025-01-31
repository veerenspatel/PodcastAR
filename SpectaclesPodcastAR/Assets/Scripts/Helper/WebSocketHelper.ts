import Event from "SpectaclesInteractionKit/Utils/Event";

const HOST = "wss://arvprojects.com/ws";

export class WebSocketConnection {
  private remoteServiceModule: RemoteServiceModule = require("LensStudio:RemoteServiceModule");
  private webSocket: WebSocket;

  private onMessageEvent = new Event<WebSocketMessageEvent>();
  public readonly onMessage = this.onMessageEvent.publicApi();

  private onErrorEvent = new Event<WebSocketErrorEvent>();
  public readonly onError = this.onErrorEvent.publicApi();

  private onOpenEvent = new Event<WebSocketEvent>();
  public readonly onOpen = this.onOpenEvent.publicApi();

  private onCloseEvent = new Event<WebSocketCloseEvent>();
  public readonly onClose = this.onCloseEvent.publicApi();

  private user: string;
  private room: string;
  private displayName: string;

  constructor() {
    this.connect();
  }

  private connect() {
    this.webSocket = this.remoteServiceModule.createWebSocket(HOST);

    this.webSocket.addEventListener("error", this._onError.bind(this));
    this.webSocket.addEventListener("message", this._onMessage.bind(this));
    this.webSocket.addEventListener("open", this._onOpen.bind(this));
    this.webSocket.addEventListener("close", this._onClose.bind(this));
  }

  private _onOpen(event: WebSocketEvent) {
    print("WebSocket opened");
    this.onOpenEvent.invoke(event);
  }
  private _onClose(event: WebSocketCloseEvent) {
    print("WebSocket closed");
    this.onCloseEvent.invoke(event);
  }
  private _onError(event: WebSocketErrorEvent) {
    this.onErrorEvent.invoke(event);
  }
   private async _onMessage(event: WebSocketMessageEvent) {
    print("Received Message");
           
    this.onMessageEvent.invoke(event);
  }

  send(data: any) {
    this.webSocket.send(data);
  }

  close() {
    this.webSocket.close();
  }
}