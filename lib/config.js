var Config = global.Config = require('nconf');
var Path = require('path');

Config.file(Path.resolve(__dirname, '../config.json'));

Config.defaults({
  service: {
    listen: 9101
  },
  datadog: {
    enable: false,
    stat: 'node.express',
    path: true,
    method: true,
    protocol: true,
    response_code: true
  }
});
