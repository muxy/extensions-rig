const rp = require('request-promise');
const readline = require('readline');
const os = require('os');

let statCheck = null;

// We use different node modules to get PC info depending on the platform
if (os.platform() === 'win32') {
  statCheck = require('./statcheck_win32');
}
else {
  statCheck = require('./statcheck_unix');
}

let token = null;
let pin = null;

let rl = null;

const startCheckingForPin = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // wait for the user to hit Enter
  rl.on('line', (input) => {
    checkJWT();
  });
};

// Fetch a new token and pin from the server for the App ID hardware_monitor
const getToken = () => {
  rp({
    method: 'POST',
    uri: 'https://sandbox.api.muxy.io/v1/e/unauthed/pin',
    body: {
      identifier: '1ssqhiy6xaoyisxbtvkiusxtjzkof2'
    },
    json: true
  })
    .then((data) => {
      token = data.token;
      pin = data.pin;

      startCheckingForPin();

      console.log('To connect to your extension please enter this pin in the config page:');
      console.log(data.pin);
      console.log('Press return when complete to verify connection.')
    })
    .catch((err) => {
      console.log('Failed to get a game pin.');
      console.log(err);
    });
};

// Check to see if the user has successfully validated the pin.
const checkJWT = () => {
  rp({
    method: 'POST',
    uri: 'https://sandbox.api.muxy.io/v1/e/unauthed/validate_pin',
    body: {
      identifier: '1ssqhiy6xaoyisxbtvkiusxtjzkof2',
      jwt: token
    },
    json: true
  })
    .then(() => {
      // Start getting PC stats
      startPollingStats();
    })
    .catch((err) => {
      console.log('There was an error authorizing the pin, ensure you\'ve entered it into the config page and try again.');
      console.log(err);
    });
};

const postLoadInfo = (info) => {
  // Send the PC stats to the json_store
  rp({
    method: 'POST',
    uri: 'https://sandbox.api.muxy.io/v1/e/json_store?id=hardware_stats',
    headers: {
      Authorization: `1ssqhiy6xaoyisxbtvkiusxtjzkof2 ${token}`
    },
    body: info,
    json: true
  });
};

const pollStats = () => {
  statCheck.getStats()
    .then((stats) => {
      postLoadInfo(stats);
    })
    .catch((err) => {
      console.log(err);
    });
};

const startPollingStats = () => {
  // Fetch PC stats every second
  setInterval(pollStats, 1000);
};

getToken();
