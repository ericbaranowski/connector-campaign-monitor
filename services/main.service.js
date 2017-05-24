'use strict';
/**
 * Main logic service
 */

module.exports.config = config;
module.exports.subscribeNewlyRegisteredClients = subscribeNewlyRegisteredClients;
module.exports.unsubscribeClients = unsubscribeClients;

const each = require('async/each');
const moment = require('moment-timezone');
const waterfall = require('async/waterfall');

const cmClient = require('./campaign-monitor.service').cmClient;
const IntellibookService = require('./intellibook.service');

let timezone;

/**
 * Configure Main Service with given parameters
 *
 * @param {Object} parameters
 */
function config(parameters) {
    timezone = parameters.subscriberTimezone;
}

function formatUtcDate(utcValue) {
    var result = moment.utc(utcValue).tz(timezone).format('YYYY-MM-DD');
    return result;
}

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
         * Add custom fields to list if they don't exist
         *
         * @param {string} listId
         * @param {object} bookingData
         * @param {object} productData
         * @param {Function} cb
         */
            (listId, bookingData, productData, cb) => {
            // TODO: maybe move to external JSON file to be more like a configurable parameter, because it's contents doesn't directly affect the logic
            const customFields = [
                {"FieldName": "Booking ID", "DataType": "Text", "VisibleInPreferenceCenter": false},
                {"FieldName": "Product Name", "DataType": "Text", "VisibleInPreferenceCenter": false},
                {"FieldName": "Product Option ID", "DataType": "Number", "VisibleInPreferenceCenter": false},
                {"FieldName": "Booking Created", "DataType": "Date", "VisibleInPreferenceCenter": false},
            ];

            // Get currently available custom fields for a list
            cmClient.lists.getCustomFields(listId, (err, availableFields) => {
                const availableFieldsNames = availableFields.map(f => f.FieldName);

                // Iterate through the custom fields
                each(customFields, (field, cb) => {
                    // If field is already added
                    if (availableFieldsNames.indexOf(field.FieldName) !== -1) {
                        return cb(null);
                    }

                    // Adding a new field
                    cmClient.lists.createCustomField(listId, field, cb);

                }, err => {
                    cb(err, listId, bookingData, productData);
                });
            });
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
                        {
                            Key: 'Booking Created',
                            Value: formatUtcDate(bookingData.CreatedUtc)
                        },
                    ],
                }
            });
            cmClient.subscribers.import(listId, {Subscribers: subscribers}, cb);
        },
    ], cb);
}

/**
 * Unsubscribe travellers from a list
 *
 * @param {number} bookingId
 * @param {Object[]} travellers
 * @param {Function} cb
 */
function unsubscribeClients(bookingId, travellers, cb) {
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
            (bookingData, cb) => IntellibookService.getProductData(bookingData.ProductId, cb),
        /**
         * Get currently available lists
         *
         * @param {Object} productData
         * @param {Function} cb
         */
            (productData, cb) => cmClient.clients.getLists(cmClient.$clientId, (err, lists) => cb(err, productData, lists)),
        /**
         * Check whether a list exists
         *
         * @param {Object} productData
         * @param {Object[]} lists
         * @param {Function} cb
         */
            (productData, lists, cb) => {
            // Iterate through the available lists and return if an existing list is found
            for (let list of lists) {
                if (productData.Name === list.Name) {
                    return cb(null, list.ListID);
                }
            }

            // Return null list id in case if a list doesn't exist
            cb(null, null);
        },
        /**
         * Remove subscribers from a list
         *
         * @param {string|null} listId
         * @param {Function} cb
        */
        (listId, cb) => {
            // If a list doesn't exist
            if (!listId) {
                return cb(null);
            }

            // Iterate through clients emails
            each(travellers.map(t => t.Email), (email, cb) => {
                // Try to unsubscibe a client
                cmClient.subscribers.unsubscribeSubscriber(listId, email, err => {
                    if (err) {
                        // If error is tolerable
                        // 1 - wrong email address format,
                        // 101 - no list with the specified id
                        // 203 - email not subscribed to a list
                        if ([1, 101, 203].indexOf(err.Code) !== -1) {
                            return cb(null);
                        }

                        return cb(err);
                    }

                    cb(null);
                });
            }, cb);
        },
    ], cb);
}

