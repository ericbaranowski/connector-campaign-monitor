'use strict';
/**
 * @description
 * Configuration provider module
 */

module.exports.getParameters = getParameters;

let parameters;

function getParameters(env) {
  // If `parameters` is not undefined
  if (parameters) {
    return parameters;
  }

  // parameters = require('./parameters.json')[env] || {}; // It's possible to use file as a parameters source
  parameters = {};

  // Set core parameters
  parameters.env = env;
  parameters.ip = process.env.IP || parameters.ip || '127.0.0.1';
  parameters.port = process.env.CMC_PORT || parameters.port || 80;
  parameters.subscriberTimezone = process.env.CMC_SUBSCRIBER_TIMEZONE || parameters.subscriberTimezone || null;
  parameters.aiKey = process.env.CMC_AI_KEY || parameters.aiKey || null;

  // Set security parameters
  parameters.security = parameters.security || {};
  parameters.security.username = process.env.CMC_SECURITY_USERNAME || parameters.security.username || null;
  parameters.security.password = process.env.CMC_SECURITY_PASSWORD || parameters.security.password || null;

  // Set Intellibook parameters
  parameters.ib = parameters.ib || {};
  parameters.ib.baseUrl = process.env.CMC_IB_BASE_URL || parameters.ib.baseUrl || null;
  parameters.ib.apiUser = process.env.CMC_IB_API_USER || parameters.ib.apiUser || null;
  parameters.ib.apiKey = process.env.CMC_IB_API_KEY || parameters.ib.apiKey || null;

  // Set Campaign Monitor parameters
  parameters.cm = parameters.cm || {};
  parameters.cm.clientId = process.env.CMC_CM_CLIENT_ID || parameters.cm.clientId || null;
  parameters.cm.apiKey = process.env.CMC_CM_API_KEY || parameters.cm.apiKey || null;

  // Protect the parameters from further changes
  Object.freeze(parameters);

  return parameters;
}
