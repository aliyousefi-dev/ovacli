import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../../ova-angular-sdk/web-socket.service';

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
      console.log('Received WebSocket message in StatsPage:', message);
      this.lastReceived = message;
    });

    // Ensure connection is established
    this.ws.connect();
  }

  // Method triggered by the button
  sendTestMessage(): void {
    const testData = {
      action: 'hello',
      timestamp: new Date().toISOString(),
      client: 'Angular-Dashboard',
    };

    console.log('Sending test message to WebSocket:', testData);
    this.ws.sendMessage(testData);
  }
}
