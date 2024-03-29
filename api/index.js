'use strict';
/**
 * Attach api handlers
 */

module.exports = api;

const MainController = require('../controllers/main.controller');

function api(app) {
    app.post('/api/subscribe-new-clients', MainController.subscribeNewlyRegisteredClients);
    app.post('/api/unsubscribe-clients', MainController.unsubscribeClients);
    app.get('/api/info', function(req, res){
        res.send('hello world');
    });
}
