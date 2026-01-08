import { Injectable, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { OVASDKConfig } from './global-config';

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
      // Send the "hello" action you requested in the Go code
      this.sendMessage({ action: 'hello' });
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

  sendMessage(msg: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    }
  }
}
