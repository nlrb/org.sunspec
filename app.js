'use strict';

const Homey = require('homey');
const SunSpec = require('sunspec-api');

class SunSpecApp extends Homey.App {

	onInit() {
		this.driver = Homey.ManagerDrivers.getDriver('inverter');
		this.log('SunSpec Solar App is running...');
	}

	pollValues(id) {
		let inverter = this.driver.getInverter(id);
		let result = 'Unknown inverter ' + id;
		if (inverter) {
			inverter.pollModBus();
			result = 'Polled values for ' + id;
		}
		return result;
	}

	getValues(id) {
		let inverter = this.driver.getInverter(id);
		let result = 'Unknown inverter ' + id;
		if (inverter) {
			result = inverter.values;
		}
		return result;
	}

}

module.exports = SunSpecApp;
