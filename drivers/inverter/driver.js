"use strict";

// SunSpec Inverter Driver

var SunSpec = require('sunspec-api');
	
var self = module.exports = {
	
	init: function(devices, callback) {
		devices.forEach(function(device) {
			self.getSettings(device, function(err, settings){
				SunSpec.addInverter(self, device, settings);
			})
		});
		
		// we're ready
		callback();
	},
	
	capabilities: {
		measure_power: {
			get: function(device, callback) {
					if (typeof callback == 'function') {
						SunSpec.getValue('INV.W', device.id, function(err, val) {
							SunSpec.debug('measure_power ' + err + ':' + val);
							callback(err, val);
						});
					}
			}
		},
		meter_power: {
			get: function(device, callback) {
					if (typeof callback == 'function') {
						SunSpec.getValue('INV.WH', device.id, function(err, val) {
							SunSpec.debug('meter_power ' + err + ':' + val);
							callback(err, val / 1000);
						});
					}
			}
		},
		measure_temperature: {
			get: function(device, callback) {
					if (typeof callback == 'function') {
						SunSpec.getValue('INV.TmpSnk', device.id, function(err, val) {
							SunSpec.debug('measure_temperature ' + err + ':' + val);
							callback(err, val);
						});
					}
			}
		}
	},
	
	deleted: function(device_data) {
		// run when the user has deleted the inverter from Homey
		SunSpec.deleteInverter(device_data.id);
	},
	
	settings: function(device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
		// run when the user has changed the device's settings in Homey.
		// changedKeysArr contains an array of keys that have been changed, for your convenience :)
		SunSpec.updateSettings(device_data.id, changedKeysArr, newSettingsObj);
		// always fire the callback, or the settings won't change!
		// if the settings must not be saved for whatever reason:
		// callback( "Your error message", null );
		// else
		callback(null, true);
	},
	
	pair: function(socket) {
		Homey.log('SunSpec Inverter pairing has started...');

		// Search for the SunSpec Inverter once we received IP address and port
		socket.on('search', function(data, callback) {
			SunSpec.debug('Request to search for SunSpec Inverter on ' + data.ip + ':' + data.port);
			// Add default settings
			var settings = {
				ip: data.ip,
				port: Number(data.port)
			}
			SunSpec.addInverter(self, null, settings);
			callback(null, true);
		});
		
		// Fully add Inverter when successful
		socket.on('completed', function(device_data) {
			var device = device_data.data;
			SunSpec.addInverterActions(self, device);
		});
		
		// Notify the front-end if a SunSpec Inverter has been found
		Homey.on('found', function(data) {
			socket.emit('found', data);
		});
	}
}
