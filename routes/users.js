var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	res.send('File Not found');
});

router.get('/callback', function(req, res, next){
	res.send('You are entering to callback Section inside Users');
});

module.exports = router;