const noble = require('noble');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const {Rules} = require('./parse_rules');

const siteConfig = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './config.yaml')));


function cleanUUID(uuid) {
  return uuid.replace(/-/g, '');
}

let displayChar = null;
let ruleManager = null;
function updateDisplay(text) {
  displayChar.write(new Buffer(text), false, (err) => console.log('err writing', err));
}

const ble_handlers = {
  TEMP: (data) => {
    return data.readFloatLE();
  },
  AIR_QUALITY: (data) => {
    return data.readUIntLE();
  },
  AMBIENT_LIGHT: (data) => {
    return data.readUIntLE();
  },
};


const characteristics = siteConfig['read_ble'].reduce((acum, bleChar) => {
  const charUUID = cleanUUID(bleChar.characteristic);
  acum[charUUID] = {
    uuid: charUUID,
    fn: ble_handlers[bleChar.type],
    type: bleChar.type,
  };
  return acum;
}, {});
console.log('characteristics map', characteristics);

const sensorData = Object.values(characteristics).reduce((acum, cur) => (acum[cur.type] = null, acum), {});

function hasCharacteristics(err, services, devcharacteristics) {
	console.log('has characteristics', services)
  devcharacteristics.forEach((devcharacteristic) => {
    console.log('char uuid', devcharacteristic.uuid);
    devcharacteristic.subscribe((err) => err && console.log('subscribe err', err));
    devcharacteristic.on('data', (data) => {
      sensorData[characteristics[devcharacteristic.uuid].type] = characteristics[devcharacteristic.uuid].fn(data);
      if (ruleManager) {
        console.log('updating rulesmanager', sensorData);
        ruleManager.handleData(sensorData);
      }
      console.log('updating sensorData');
    });
    if (devcharacteristic.uuid === cleanUUID(siteConfig.write_ble_screen)) {
      displayChar = devcharacteristic;
      ruleManager = new Rules(siteConfig, updateDisplay);
    }
  });
}

noble.on('stateChange', (state) => {
  console.log('has state change', state);
  if (state == 'poweredOn') {
    console.log('scanning');
    noble.startScanning([cleanUUID(siteConfig.ble_device_service)]);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  console.log('has device', peripheral.advertisement);
	const serviceUUID = cleanUUID(siteConfig.ble_device_service);
	console.log('listening to ', Object.keys(characteristics));
  peripheral.connect((err) => {
    peripheral.discoverSomeServicesAndCharacteristics(
			[serviceUUID],
			[...Object.keys(characteristics), cleanUUID(siteConfig.write_ble_screen)],
			hasCharacteristics,
    );
  });
});
