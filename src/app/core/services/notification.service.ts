import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  visible = signal(false);
  title = signal('');
  message = signal('');
  type = signal<'error' |'success' | 'warning' |'info'>('info');
  private timer?: ReturnType<typeof setTimeout>;
  constructor() { }

  show(title: string, message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error') {
    if (this.timer) clearTimeout(this.timer);

    this.title.set(title);
    this.message.set(message);
    this.type.set(type);
    this.visible.set(true);

    this.timer = setTimeout(() => {
      this.close();
    }, 4500);
  }

  close() {
    this.visible.set(false);
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
  }

  showError(error: unknown) {
    console.log('FULL ERROR OBJECT => ', error);

    const info = this.translate(error);
    this.show(info.title, info.message, 'error');
  }

  showSuccess(title: string, message: string) {
    this.show(title, message, 'success');
  }

  showWarning(title: string, message: string) {
    this.show(title, message, 'warning');
  }

  showMessage(title: string, message: string) {
    this.show(title, message, 'info');
  }

  private translate(error: unknown) {
    const err = error as any;
    const backendMessage =
        err?.error?.message ||
        err?.error?.error ||
        err?.error?.msg ||
        err?.error;
    const browserMessage = err?.message || '';
    const status = err?.status;

    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return {
        title: 'Request failed',
        message: backendMessage
      };
    }

    if (browserMessage.includes('ERR_NAME_NOT_RESOLVED')) {
      return {
        title: 'Server unreachable',
        message: 'Backend server address could not be found. Backend may be offline.'
      };
    }

    if (browserMessage.includes('ERR_CONNECTION_REFUSED')) {
      return {
        title: 'Connection refused',
        message: 'Backend server is not accepting connections.'
      };
    }

    if (status == 401) {
      return {
        title: 'Request failed',
        message: browserMessage
      };
    }

    if (status == 0) {
      return {
        title: 'Network Error',
        message: 'Could not connect to backend server.'
      }
    }

    return {
      title: 'Unexpected error',
      message: 'Something went wrong while processing your request.'
    };
  }
}
