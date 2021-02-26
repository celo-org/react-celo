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
    let ua = navigator.userAgent.toLowerCase();
    let isAndroid = ua.indexOf('android') > -1; // android check
    let isIphone = ua.indexOf('iphone') > -1; // ios check

    if (isIphone == true) {
      let app = {
        launchApp: function () {
          setTimeout(function () {
            window.location.href =
              'https://itunes.apple.com/us/app/appname/appid';
          }, 25);
          window.location.href = url; //which page to open(now from mobile, check its authorization)
        },
        openWebApp: function () {
          window.location.href =
            'https://itunes.apple.com/us/app/appname/appid';
        },
      };
      app.launchApp();
    } else if (isAndroid == true) {
      let app = {
        launchApp: function () {
          window.open(url);
        },
        // openWebApp: function () {
        //   window.location.href =
        //     'https://play.google.com/store/apps/details?id=packagename';
        // },
      };
      app.launchApp();
    } else {
      //navigate to website url
    }
  }
}

const linking = new Linking();
export default linking;
