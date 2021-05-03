
import platform
import minimalmodbus
from app.modbus_service.models import HeatingControlConfig
from serial.serialutil import SerialException
import logging

# from common.models import Relay, Sensor

adamSensorModule = None
adamRelayModule = None
port = '/dev/ttyUSB0' #'COM3' #/dev/ttyUSB0 for linux
heatingConfig = 12

def initModbusService():
	global heatingConfig
	heatingConfig = HeatingControlConfig.objects().first()	
	try:
		if 'Windows' in platform.system():
			port = "COM3" 
		adamSensorModule = minimalmodbus.Instrument(port,1) 
		adamSensorModule.close_port_after_each_call = False
		adamSensorModule.serial.baudrate = 9600	
		adamRelayModule = minimalmodbus.Instrument(port,3)
		adamRelayModule.close_port_after_each_call = False
		adamRelayModule.serial.baudrate = 9600
	except (SerialException,FileNotFoundError) as e:
		logging.error('Check connectivity between server and sensor devices')
		# raise SystemExit

initModbusService()