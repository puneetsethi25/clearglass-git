var express = require('express');
var router = express.Router();
var costExplorer = require('../models/costExplorer')

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send({ success: false, message: "please check url" });
});

router.get('/cost-test', function (req, res) {
    res.send({ success: false, message: "please check url" });
    var query = {};
    if (req.query.hasOwnProperty('projects') && req.query.projects) {
        query.projects = req.query.projects;
    }
    if (req.query.hasOwnProperty('clients') && req.query.clients) {
        query.clients = req.query.clients;
    }
    if (req.query.hasOwnProperty('cost_types') && req.query.cost_types) {
        query.cost_types = req.query.cost_types;
    }
    costExplorer.__find(query, function (err, response) {
        if (!err) {
            res.send({ success: true, results: response });
        } else {
            res.send({ success: false, error: err });
        }
    })
})

router.get('/cost-explorer', function (req, res) {
    var query = {};
    if (req.query.hasOwnProperty('projects') && req.query.projects) {
        query.projects = req.query.projects;
    }
    if (req.query.hasOwnProperty('clients') && req.query.clients) {
        query.clients = req.query.clients;
    }
    if (req.query.hasOwnProperty('cost_types') && req.query.cost_types) {
        query.cost_types = req.query.cost_types;
    }
    costExplorer.find({ params: query }, function (err, response) {
        if (!err) {
            res.send({ success: true, results: response });
        } else {
            res.send({ success: false, error: err });
        }
    })
})


module.exports = router;