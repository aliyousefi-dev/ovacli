import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../../ova-angular-sdk/websocket/web-socket.service';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.page.html',
})
export class StatsPage implements OnInit {
  private ws = inject(WebSocketService);

  // Property to hold the last message for the UI
  public lastReceived: any = null;

  ngOnInit(): void {
    this.ws.status$.subscribe((message) => {
      this.lastReceived = message;
    });

    // Ensure connection is established
    this.ws.connect();
  }

  // Method triggered by the button
  sendTestMessage(): void {
    this.ws.sendHello();
  }
}
