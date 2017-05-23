/**
 * Service for handling CampaignMonitor logic
 */

module.exports.config = config;
module.exports.cmClient = {};

const createsend = require('createsend-node');

/**
 * Configure Campaign Monitor service
 *
 * @param parameters
 */
function config(parameters) {
  // Create CM client
  const cmClient = new createsend({apiKey: parameters.cm.apiKey});
  cmClient.$clientId = parameters.cm.clientId;

  Object.assign(module.exports.cmClient, cmClient);
}
