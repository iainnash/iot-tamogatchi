const DarkSky = require('dark-sky');
const {debounce} = require('lodash');

const messageStack = [];

const weatherData = {};

const iconMap = {
  cry: 'c',
  dead: 'd',
  sick: 'n',
  happy: 'f',
  eat: 'e',
  cool: 'b',
  music: 'j',
  selfie: 'l',
};

function Card(sev, icon, text, desc) {
  console.log('creating card', sev, icon, text, desc)
  this.draw = () => {
    return iconMap[icon] + text;
  }
  return this;
}

function weatherModule(attrs, config, sensorData) {
  const cards = [];
	if (!this.weatherData) return cards;
	if (!sensorData.TEMP) return cards;
  if (sensorData.TEMP >= config.WEATHER.comfortable_low &&
      sensorData.TEMP <= config.WEATHER.comfortable_high) {
    const tempDelta = Math.abs(sensorData.TEMP - this.weatherData.currently.temperature);
    if (tempDelta > config.WEATHER.max_delta) {
      cards.push(new Card(2, 'sick', 'Inside temp too intense'), {
        tempDelta,
      });
    } else {
      cards.push(new Card(-1, 'cool', 'Temp is good :)'));
    }
  }
  return cards;
}

function sleepModule(attrs, config, sensorData) {
  const nowHr = new Date().getHours();
  if (sensorData.AMBIENT_LIGHT === null) return;
  if (nowHr > config.SLEEP.typical_bedtime) {
    if (sensorData.AMBIENT_LIGHT > config.SLEEP.ambient_light) {
      return [new Card(2, 'dead', 'Time to sleep!')];
    }
  }
}

function airQuality(attrs, config, sensorData) {
  if (!sensorData.AIR_QUALITY) return [];
  if (sensorData.AIR_QUALITY > config.AIR_QUALITY.error_max) {
    return [new Card(2, 'sick', 'Bad air quality :\'(')];
  } else if (sensorData.AIR_QUALITY > config.AIR_QUALITY.warn_max) {
    return [new Card(1, 'sick', 'OK air quality')];
  }
}

function happyModule(attrs, config, sensorData) {
  const nowHr = new Date().getHours();
  if (nowHr > 9 && nowHr < 10 || nowHr >= 12 && nowHr <= 2 || nowHr >= 6 && nowHr <= 8) {
    return [new Card(0, 'eat', 'Eating nomz')];
  }
  const rnd = Math.random();
  if (rnd < 0.3) {
    return [new Card(-1, 'happy', ':)')]
  } else if (rnd < 0.6) {
    return [new Card(-1, 'selfie', '~~ chillin ~~')]
  } else if (rnd < 0.9) {
    return [new Card(-1, 'music', '~ jammin')];
  } else {
    return [new Card(-1, 'cool', 'yo')];
  }
}

const ruleModules = [happyModule, weatherModule, sleepModule, airQuality];

class Rules {
  constructor(config, remoteUpdate) {
    this.config = config;
    this.currentTick = 0;
    this.remoteUpdate = remoteUpdate;
    this.sensorData = {};
		this.getWeather();
    this.updateDisplay();
		this.messages = [];
	}

	updateDisplay() {
    this.currentTick++;
    let toShow = [];
    ruleModules.forEach((ruleModule) => {
      toShow = toShow.concat(ruleModule(this, this.config.rules, this.sensorData) || []);
    });

    console.log('hasToShow', toShow);
    if (toShow.length) {
      console.log('updating display');
      this.remoteUpdate(toShow[this.currentTick % toShow.length].draw());
    } else {
      console.log('nothing to show :(');
    }
    setTimeout(() => this.updateDisplay(), 20 * 1000);
	}

	getWeather() {
		new DarkSky(this.config.live_data.darksky_key)
		.latitude(this.config.live_data.location.lat)
		.longitude(this.config.live_data.location.lng)
		.language('en')
		.exclude('minutely')
		.get()
		.then((data) => {
      console.log('has weather', data);
      this.weatherData = data;
			setTimeout(this.getWeather, 1*60*60*1000);
		});
	}

	handleData(sensorData) {
    this.sensorData = sensorData;
	}
}

module.exports = {Rules};
