import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client;
  private taskUpdatesSubject = new Subject<any>();
  public taskUpdates$: Observable<any> =
    this.taskUpdatesSubject.asObservable();
  constructor() {
    this.client = new Client({
      webSocketFactory: () =>
        new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: () => {}
    });
    this.client.onConnect = () => {
      console.log('✅ WebSocket connected');
      this.client.subscribe(
        '/topic/task-updates',
        (message: IMessage) => {
          try {
            const data = JSON.parse(message.body);
            console.log('📡 Task update received:', data);
            this.taskUpdatesSubject.next(data);
          } catch (error) {
            console.log(
              '📡 Task update received:',
              message.body
            );
            this.taskUpdatesSubject.next(message.body);
          }
        }
      );
    };
    this.client.onStompError = (frame) => {
      console.error(
        '❌ WebSocket STOMP error:',
        frame.headers['message']
      );
      console.error(
        'Details:',
        frame.body
      );
    };
    this.client.onWebSocketError = (error) => {
      console.error(
        '❌ WebSocket connection error:',
        error
      );
    };
  }
  connect(): void {
    if (!this.client.active) {
      console.log('🔌 Connecting to WebSocket...');
      this.client.activate();
    }
  }
  disconnect(): void {
    if (this.client.active) {
      this.client.deactivate();
      console.log('🔌 WebSocket disconnected');
    }
  }
}