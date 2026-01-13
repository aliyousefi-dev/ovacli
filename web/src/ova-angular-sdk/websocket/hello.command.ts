import { WebSocketService } from './web-socket.service';

export function sendHelloCommand(ws: WebSocketService) {
  ws.sendMessage('hello', {
    client: 'Angular-Dashboard',
    timestamp: Date.now(),
  });
}
