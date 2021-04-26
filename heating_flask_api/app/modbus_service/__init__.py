

import minimalmodbus
from app.modbus_service.models import HeatingControlConfig
from serial.serialutil import SerialException
import logging

# from common.models import Relay, Sensor

adamSensorModule = None
adamRelayModule = None
port = 'COM1'#'COM3' #/dev/ttyUSB0 for linux
heatingConfig:HeatingControlConfig = None

try:
	adamSensorModule = minimalmodbus.Instrument(port,1) 
	adamSensorModule.close_port_after_each_call = False
	adamSensorModule.serial.baudrate = 9600	
	adamRelayModule = minimalmodbus.Instrument(port,3)
	adamRelayModule.close_port_after_each_call = False
	adamRelayModule.serial.baudrate = 9600
	heatingConfig = HeatingControlConfig.objects().first()	
except (SerialException,FileNotFoundError) as e:
	logging.error('Check connectivity between server and sensor devices')
	# raise SystemExit
