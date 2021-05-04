import minimalmodbus
from minimalmodbus import NoResponseError
from serial.serialutil import SerialException
import threading,time
from app.modbus_service.models import Relay, Sensor, User, MeasurementValue
from app.modbus_service import adamRelayModule,adamSensorModule, heatingConfig
# from app import db
from mongoengine import *
from bson.objectid import ObjectId
import logging
from datetime import datetime
from random import randint
from flask_sqlalchemy import SQLAlchemy



RELAY_REGISTER_START_ADRESS = 15

def getSensorValue(sensor):
	try:
		temperature = adamSensorModule.read_register(sensor.registerAddress,3) #3 digits after comma
		return temperature
	except (NoResponseError,SerialException,BaseException) as e:
		logging.exception(e)
	return sensor.temperature

def applyDBValuesToRelays():
	for relay in Relay.objects:
		try:
			adamRelayModule.write_bit(relay.registerAddress,relay.heating)
		except (NoResponseError,BaseException) as e:
			logging.exception(e)

def updateSensorTemperatureInDB():
	threading.Timer(heatingConfig.REGULATION_DURATION_SECONDS, updateSensorTemperatureInDB).start()
	for sensor in Sensor.objects:
		sensor_temperature = getSensorValue(sensor)
		sensor.update(temperature = sensor_temperature)
		sensor.save()

def saveSensorTemperatureToStat():
	threading.Timer(10*60,saveSensorTemperatureToStat).start() #every 10 minutes
	for sensor in Sensor.objects:
		mv = MeasurementValue(temperature=sensor.temperature,sensor_id=sensor.id,timestamp=datetime.utcnow())
		mv.save()

def regulatePreheaterTemperature():	
	threading.Timer(heatingConfig.REGULATION_INTERVALL_SECONDS+heatingConfig.REGULATION_DURATION_SECONDS, regulatePreheaterTemperature).start()
	logging.info("Regulating [REGULATION_INTERVALL_SECONDS/REGULATION_DURATION_SECONDS]"+str(heatingConfig.REGULATION_INTERVALL_SECONDS)+'/'+str(heatingConfig.REGULATION_DURATION_SECONDS))
	preheaterSensor = Sensor.objects.get(name='Vorlauftemperatur')
	outsideSensor = Sensor.objects.get(name='Außentemperatur')
	preheaterSensor.idealTemperature = -0.4*(outsideSensor.temperature) + 32
	preheaterSensor.save()
	relayWarm = Relay.objects.get(name="Heizung +")
	relayCold = Relay.objects.get(name="Heizung -")
	if preheaterSensor.idealTemperature > preheaterSensor.temperature+preheaterSensor.tolerance:
		relayCold.heating = False
		relayWarm.heating = True
	elif preheaterSensor.idealTemperature < preheaterSensor.temperature-preheaterSensor.tolerance:
		relayCold.heating = True
		relayWarm.heating = False
	else:
		relayCold.heating = False
		relayWarm.heating = False
	relayCold.save()
	relayWarm.save()
	applyDBValuesToRelays()
	time.sleep(heatingConfig.REGULATION_DURATION_SECONDS)
	relayCold.heating = False
	relayWarm.heating = False
	relayCold.save()
	relayWarm.save()
	applyDBValuesToRelays()

def db_getSensor(sensor_id=None):
	if sensor_id is not None:
		sensor = Sensor.objects(pk=ObjectId(sensor_id)).first()
		return sensor
	else:
		sensors = Sensor.objects
		return sensors

def db_getRelay(relay_id=None):
	if relay_id is not None:
		relay = Relay.objects(pk=ObjectId(relay_id)).first()
		return relay
	else:
		relays = Relay.objects
		return relays

def db_getUser(username)->User:
	user = User.objects.get(username=username)
	return user

updateSensorTemperatureInDB()
saveSensorTemperatureToStat()
regulatePreheaterTemperature()
