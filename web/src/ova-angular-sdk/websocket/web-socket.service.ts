import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { OVASDKConfig } from '../global-config';
import { createWsRequest } from './ws-types';
import * as Commands from './hello.command';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private config = inject(OVASDKConfig);
  private socket?: WebSocket;

  // A Subject to broadcast incoming messages to components
  private statusSubject = new Subject<any>();
  public status$ = this.statusSubject.asObservable();

  connect(): void {
    this.socket = new WebSocket(this.config.wsUrl);

    this.socket.onopen = () => {
      console.log('[WS] Connected to dedicated WebSocket server');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[WS] Received:', data);
      this.statusSubject.next(data);
    };

    this.socket.onerror = (error) => {
      console.error('[WS] Socket Error:', error);
    };

    this.socket.onclose = () => {
      console.warn('[WS] Connection closed. Retrying in 5 seconds...');
      setTimeout(() => this.connect(), 5000);
    };
  }

  sendHello(): void {
    Commands.sendHelloCommand(this);
  }

  sendMessage(action: string, payload: any = {}): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Create the request object using our helper
      const request = createWsRequest(action, payload);

      this.socket.send(JSON.stringify(request));
    } else {
      console.warn('[WS] Socket is closed. Message not sent:', action);
    }
  }
}
