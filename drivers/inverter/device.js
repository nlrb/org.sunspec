'use strict'

/*
Copyright (c) 2019 Ramón Baas

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// SunSpec Inverter Device

const Homey = require('homey');
const SunSpec = require('sunspec-api');

class SunSpecDevice extends Homey.Device {

  onInit() {
    // Register events to update capability values
    let settings = this.getSettings();
    this.inverter = new SunSpec(settings.ip, settings.port, settings.idModBus, settings.baseModBus, this.log);
    this.interval = settings.interval;
    this.registerEvents()
    // Set up timer
    if (this.interval > 0) {
      this.timer = setInterval(() => { this.inverter.pollModBus() }, 1000 * this.interval);
    } else if (this.interval === 0) {
      // Register inverter as producer with DSMR
  			this.log('Registering inverter with DSMR');
  			Homey.ManagerApi.put('/app/nl.dsmr.p1/register/', { id: id, callback: '/app/org.sunspec/poll/' }, (err, result) => {
  				this.log('Registration', err, ':', result);
  			});
		}
    this.log('Device', this.getData(), 'started');
  }

  onDeleted() {
    clearTimeout(this.timer);
		this.inverter.closeConnection();
	}

  registerEvents() {
    this.inverter.on('INV.W', value => {
      this.setCapabilityValue('measure_power', value)
        .catch(err => this.error(new Error(err)));
    })
    this.inverter.on('INV.WH', value => {
      this.setCapabilityValue('meter_power', value / 1000)
        .catch(err => this.error(new Error(err)));
    })
    this.inverter.on('INV.TmpSnk', value => {
      this.setCapabilityValue('measure_temperature', value)
        .catch(err => this.error(new Error(err)));
    })
    this.inverter.on('INV.PPVphAB', value => {
      this.setCapabilityValue('measure_voltage', value)
        .catch(err => this.error(new Error(err)));
    })
    this.inverter.on('INV.A', value => {
      this.setCapabilityValue('measure_current', value)
        .catch(err => this.error(new Error(err)));
    })
    this.inverter.on('INV.St', value => {
      this.setCapabilityValue('status', this.inverter.getStatus())
        .catch(err => this.error(new Error(err)));
    })
    this.inverter.on('measured', value => {
			if (this.interval === 0) { // external trigger mode
				this.log('Sending value to DSMR');
				Homey.ManagerApi.put('/app/nl.dsmr.p1/receive/', { id: id, value: value, err: null }, (err, result) => {
					this.log('Value sent to DSMR', err, ':', result);
				});
			}
		});
  }

}

module.exports = SunSpecDevice;
