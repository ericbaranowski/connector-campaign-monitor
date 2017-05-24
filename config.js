'use strict';
/**
 * Configure app
 */

module.exports = config;

const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');

/**
 * Configure app, it's middleware and services with given parameters
 *
 * @param {Object} app
 * @param {Object} parameters
 */
function config(app, parameters) {
    // Attach JSON parser middleware
    app.use(bodyParser.json());
    // Attach basic auth middleware
    app.use(basicAuth({
        users: {
            [parameters.security.username]: parameters.security.password,
        },
    }));

    require('./services/campaign-monitor.service').config(parameters);
    require('./services/intellibook.service').config(parameters);
    require('./services/logging.service').config(parameters);
    require('./services/main.service').config(parameters);
}
