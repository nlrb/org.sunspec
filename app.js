'use strict';

const Homey = require('homey');
const SunSpec = require('sunspec-api');

class SunSpecApp extends Homey.App {

	onInit() {
		this.log('SunSpec Solar App is running...');
	}

	pollValues(id) {
		let inverter = this.homey.drivers.getDriver('inverter').getInverter(id);
		let result = 'Unknown inverter ' + id;
		if (inverter) {
			inverter.pollModBus();
			result = 'Polled values for ' + id;
		}
		return result;
	}

	getValues(id) {
		let inverter = this.homey.drivers.getDriver('inverter').getInverter(id);
		let result = 'Unknown inverter ' + id;
		if (inverter) {
			result = inverter.getValues();
		}
		return result;
	}

}

module.exports = SunSpecApp;
