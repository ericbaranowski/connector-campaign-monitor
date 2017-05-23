'use strict';
/**
 * Service for handling Intellibook requests
 */

module.exports.config = config;
module.exports.getBookingData = getBookingData;
module.exports.getProductData = getProductData;

const request = require('request');

const authData = {};
let ibBaseUrl;
const productCache = {};

/**
 * Configure service with provided parameters
 *
 * @param {Object} parameters
 */
function config(parameters) {
  authData.user = parameters.ib.apiUser;
  authData.pass = parameters.ib.apiKey;
  ibBaseUrl = parameters.ib.baseUrl;
}

/**
 * Get booking information by booking id
 *
 * @param {number} bookingId
 * @param {Function} cb
 */
function getBookingData(bookingId, cb) {
  request.get(`${ibBaseUrl}/api/bookings?bookingId=${bookingId}`, {
    auth: authData,
    json: true,
  }, (err, res, body) => {
    if (err) {
      return cb(err);
    }

    return cb(null, body[0]);
  });
}

/**
 * Get product information by product id
 *
 * @param {number} productId
 * @param {Function} cb
 */
function getProductData(productId, cb) {
  if (productCache.hasOwnProperty(productId)) {
    return cb(null, productCache[productId]);
  }

  request.get(`${ibBaseUrl}/api/products?productId=${productId}`, {
    auth: authData,
    json: true,
  }, (err, res, body) => {
    if (err) {
      return cb(err);
    }

    productCache[productId] = body[0];
    return cb(null, body[0]);
  });
}
