'use strict';
/**
 * Main logic service
 */

module.exports.subscribeNewlyRegisteredClients = subscribeNewlyRegisteredClients;

const waterfall = require('async/waterfall');

const cmClient = require('./campaign-monitor.service').cmClient;
const IntellibookService = require('./intellibook.service');

/**
 * Try to subscribe newly registered clients to a list
 *
 * @param {number} bookingId
 * @param {Object[]} travellers
 * @param {Function} cb
 */
function subscribeNewlyRegisteredClients(bookingId, travellers, cb) {
  waterfall([
    /**
     * Get booking data to get a product information
     *
     * @param {Function} cb
     */
    (cb) => IntellibookService.getBookingData(bookingId, cb),
    /**
     * Get product information by booking data
     *
     * @param {Object} bookingData
     * @param {Function} cb
     */
      (bookingData, cb) => IntellibookService.getProductData(bookingData.ProductId, (err, productData) => cb(err, bookingData, productData)),
    /**
     * Get currently available lists
     *
     * @param {Object} bookingData
     * @param {Object} productData
     * @param {Function} cb
     */
      (bookingData, productData, cb) => cmClient.clients.getLists(cmClient.$clientId, (err, lists) => cb(err, bookingData, productData, lists)),
    /**
     * Check whether a list exists and if not, create a new one
     *
     * @param {Object} bookingData
     * @param {Object} productData
     * @param {Object[]} lists
     * @param {Function} cb
     */
      (bookingData, productData, lists, cb) => {
      // Iterate through the available lists and return if an existing list is found
      for (let list of lists) {
        if (productData.Name === list.Name) {
          return cb(null, list.ListID, bookingData, productData);
        }
      }

      // Create a new list
      cmClient.lists.createList(
        cmClient.$clientId,
        {
          Title: productData.Name,
          UnsubscribePage: '',
          UnsubscribeSetting: 'OnlyThisList',
          ConfirmedOptIn: false,
          ConfirmationSuccessPage: ''
        },
        (err, list) => cb(err, list.listId, bookingData, productData)
      );
    },
    /**
     * Add subscribers to a list
     *
     * @param {string} listId
     * @param {object} bookingData
     * @param {object} productData
     * @param {Function} cb
     */
      (listId, bookingData, productData, cb) => {
      // Generate the required subscribers array
      const subscribers = travellers.map(t => {
        return {
          EmailAddress: t.Email,
          Name: `${t.FirstName} ${t.LastName}`,
          CustomFields: [
            {
              Key: 'BookingID',
              Value: t.BookingId,
            },
            {
              Key: 'ProductName',
              Value: productData.Name,
            },
            {
              Key: 'ProductOptionID',
              Value: bookingData.ProductOptionId,
            },
          ],
        }
      });
      cmClient.subscribers.import(listId, {Subscribers: subscribers}, cb);
    },
  ], cb);
}
