var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/diff/:file1/:file2', function(req, res, next){
	console.log(req.params);
	res.send(200);
});

router.get('/read', function(req, res, next){
	res.send("ok google");
});

module.exports = router;