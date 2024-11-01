import { Notification } from '../app/models/notification.model';

declare module '@stomp/stompjs' {
  export class Client {
    constructor(options: any);
    activate(): void;
    deactivate(): void;
    subscribe(
      destination: string,
      callback: (response: Notification) => void
    ): void;
  }
}
