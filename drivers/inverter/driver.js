'use strict'

/*
Copyright (c) 2019 Ramón Baas

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// SunSpec Inverter Driver

const Homey = require('homey');
const SunSpec = require('sunspec-api');

class SunSpecDriver extends Homey.Driver {

	onInit() {
	};

	onPair(socket) {
		this.log('SunSpec Inverter pairing has started...');
		let completed = false;
		let inverter;

		// Search for the SunSpec Inverter once we received IP address and port
		socket.on('search', (data, callback) => {
			this.log('Request to search for SunSpec Inverter on', data.ip + ':' + data.port);
			// Add default settings
			let settings = {
				ip: data.ip,
				port: Number(data.port),
				idModBus: Number(data.id),
				baseModBus: Number(data.base),
				interval: 10
			}
			inverter = new SunSpec(data.ip, data.port, settings.idModBus, settings.baseModBus, this.log);
			inverter.on('found', data => {
				if (data.found && data.id != null) {
					let registered = this.getInverterIds();
					if (registered[data.id] == null) {
						data.device = {
							name: data.name,
							data: {	id: data.id },
							settings: settings
						}
						this.inverters[data.id] = inverter;
					} else {
						// Inverter already present
						data.found = false;
					}
				}
				socket.emit('found', data);
			});
			callback(null, true);
		});

		// Check if the pairing was finished, otherwise close connection
		socket.on('disconnect', () => {
			if (!completed) {
				this.log('Pairing not completed, closing connection')
				inverter.closeConnection();
			}
		})

		// Fully add Inverter when successful
		socket.on('completed', (device_data) => {
			inverter.closeConnection();
			completed = true;
		});
	}

	// Return array of inverter devices
	getInverterIds() {
		let devices = this.getDevices();
		let result = [];
		if (devices) {
			result.forEach(e => result.push(e.data.id));
		}
		return result;
	}

	// Get inverter device by ID
	getInverter(id) {
		let device = this.getDevice({ id: id });
		let result;
		if (device) {
			result = device.inverter;
		}
		return result;
	}
}

module.exports = SunSpecDriver;
