'use strict';

const app = require('express')();
const parameters = require('./parameters').getParameters(process.env.NODE_ENV || 'development');

// Configure the app
require('./config')(app, parameters);
// Attach api handlers
require('./api')(app);
// Launch the app
app.listen(parameters.port, parameters.ip);

process.on('uncaughtException', err => {
  require('./services/logging.service').getClient().trackException(err);
});
