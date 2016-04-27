"use strict";

var SunSpec = require('sunspec-api');

function init() {
	Homey.log("SunSpec Solar App starting");
}

module.exports = {
	api: { pollValues: SunSpec.pollValues },
	init: init
}