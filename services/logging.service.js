'use strict';
/**
 * Service for handling logging
 */

const appInsights = require('applicationinsights');

module.exports.config = config;
module.exports.getClient = getClient;

let client;

/**
 * Configure Logging Service with given parameters
 *
 * @param {Object} parameters
 */
function config(parameters) {
    appInsights
        .setup(parameters.aiKey)
        .start();

    client = appInsights.client;
}

/**
 * Get appinsights client
 *
 * @return {Object|undefined}
 */
function getClient() {
    return client;
}
