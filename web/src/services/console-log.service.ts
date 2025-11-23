import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConsoleLogService {
  private intervalId: any;

  constructor() {
    console.log('ConsoleLogService instantiated');
    this.startLogging('This is the message'); // Start logging automatically on service instantiation
  }

  startLogging(message: string) {
    this.intervalId = setInterval(() => {
      console.log(message);
    }, 1000);
  }

  stopLogging() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
