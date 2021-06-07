import EventEmitter from 'events';

class Linking {
  protected emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  emit(event: string, value: unknown) {
    this.emitter.emit(event, value);
  }

  addEventListener(event: string, callback: Parameters<EventEmitter['on']>[1]) {
    this.emitter.on(event, callback);
  }

  removeEventListener(
    event: string,
    callback: Parameters<EventEmitter['on']>[1]
  ) {
    this.emitter.off(event, callback);
  }

  openURL(url: string) {
    window.location.href = url;
  }
}

const linking = new Linking();
export default linking;
