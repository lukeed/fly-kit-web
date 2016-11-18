'use strict';

var $ = require('./demo');

var obj = $.generate();

var str;
for (var k in obj) {
	str = [k, obj[k]].map($.capitalize).join(' ');
	console.log(str);
}
