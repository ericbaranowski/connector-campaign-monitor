'use strict';
/**
 * Handler for subscription requests
 */

module.exports.subscribeNewlyRegisteredClients = subscribeNewlyRegisteredClients;

const LoggingService = require('../services/logging.service');
const MainService = require('../services/main.service');

/**
 * Subscribe clients to a required list
 *
 * @param {Object} req
 * @param {Object} res
 */
function subscribeNewlyRegisteredClients(req, res) {
  // Add appinsights handler TODO maybe move to a separate middleware
  LoggingService.getClient().trackRequest(req, res);
  const bookingId = req.body.BookingId;
  const travellers = req.body.Travellers;

  if (!bookingId) {
    return res.status(400).json({message: 'Cannot proceed the request: missing "BookingId" parameter.'});
  }

  MainService.subscribeNewlyRegisteredClients(bookingId, travellers, (err, data) => {
    if (err) {
      return res.status(400).json({err});
    }
    return res.json({data});
  });
}
