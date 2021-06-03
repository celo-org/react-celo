import EventEmitter from 'events';

class Linking {
  protected emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  emit(event: string, value: any) {
    this.emitter.emit(event, value);
  }

  addEventListener(event: string, callback: any) {
    this.emitter.on(event, callback);
  }

  removeEventListener(event: string, callback: any) {
    this.emitter.off(event, callback);
  }

  openURL(url: string) {
    window.location.href = url;
  }
}

const linking = new Linking();
export default linking;
