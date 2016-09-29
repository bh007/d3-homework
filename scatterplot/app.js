/// <reference path="typings/node/node.d.ts" />
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/body-parser/body-parser.d.ts" />
/// <reference path="typings/d3/d3.d.ts" />

var express = require('express');
var app = express();
app.use('/', express.static('./'));
app.get('/', function(req, res){
    res.sendFile('index.html', { root: __dirname });
});
app.listen(45000);