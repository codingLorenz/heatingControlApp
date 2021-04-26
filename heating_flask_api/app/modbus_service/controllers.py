from app.modbus_service.models import Relay, Sensor, User, MeasurementValue, HeatingControlConfig
from app.modbus_service.service import db_getRelay, db_getSensor, db_getUser,heatingConfig
from flask import Flask,jsonify,json,g, request, make_response
from flask_cors import CORS
from app import app
from functools import wraps
import jwt
from datetime import datetime,timedelta
import logging
from mongoengine import *
from bson.objectid import ObjectId
from mongoengine.queryset.visitor import Q

def token_required(f):
   @wraps(f)
   def decorator(*args, **kwargs):
	   token = None
	   if 'Authorization' in request.headers:
		   token = request.headers['Authorization']
	   if not token:
		   return jsonify({'message':'a valid token is missing'},)
	   try:
		   data = jwt.decode(jwt=token,key=app.config['SECRET_KEY'], algorithms=["HS256"])
		   current_user = User.objects.get(username=data['username'])
	   except (Exception) as e:
		   logging.exception(e)
		   return jsonify({'message': 'token is invalid'})
	   return f(*args, **kwargs)
   return decorator

@app.route("/api/login",methods=["GET","POST"])
def login():
	print(request)
	try:
		auth = request.authorization
		if not auth or not auth.username or not auth.password:
			return make_response('cound not verify',401,{'WWW.Authentication': 'Basic realm: "login required"'})
		user:User = db_getUser(username=auth.username)
		if user and User.check_password(user.password,auth.password):
			token = jwt.encode({'username': user.username, 'exp' : datetime.utcnow() + timedelta(minutes=30)}, app.config['SECRET_KEY'])
			return jsonify({'token':token})
	except BaseException as e:
		logging.exception(e)
		return make_response('Check the Server Log File @ '+str(datetime.utcnow()),500)
	return make_response('Wrong Credentials',401,{'WWW.Authentication': 'Basic realm: "login required"'})

@app.route("/api/get_Sensor_Data/<string:sensor_id>", methods=["GET"])
def get_Sensor_Data(sensor_id):
	s = db_getSensor(sensor_id)
	return make_response(s.to_json())

@app.route("/api/get_Sensors", methods=["GET"])
@token_required
def get_Sensors():
	sensors =  db_getSensor()
	return make_response(sensors.to_json())

@app.route("/api/get_Relays", methods=["GET"])
@token_required
def get_Relays():
	relays = db_getRelay()
	return make_response(relays.to_json())

@app.route("/api/get_Relay_Status/<string:relayId>", methods=["GET"])
@token_required
def get_Relay_Status(relayId):
	relay = db_getRelay(relayId)
	return make_response(jsonify(relay.heating))

@app.route("/api/register",methods=["POST"])
def register_User():
	newUser = User(**request.json)
	if newUser.username is None or newUser.password is None:
		return jsonify({'invalid credentials'}),400
	# if User.query.filter_by(username=newUser.username).first() is not None:
	# 	return jsonify({'user already exists'}),400
	newUser.password = newUser.hash_password(newUser.password)
	print('password: '+str(newUser.hash_password(newUser.password)))
	newUser.save()
	return make_response(jsonify({'message':'registered successfully'}))

@app.route("/api/get_Sensors_Statistics/<string:sensorid>",methods=["GET"])
@token_required
def get_Sensors_Statistics(sensorid):
	try:
		sensor_MeasurementValues:MeasurementValue = MeasurementValue.objects(sensor_id=ObjectId(sensorid),timestamp__gt=(datetime.utcnow()-timedelta(days=20)))
		sensor_data_series=[]
		for mvValue in sensor_MeasurementValues:
			sensor_data_series.append({'name':mvValue.timestamp,'value':mvValue.temperature})
		sensorLineChartData = {'name':Sensor.objects(pk=ObjectId(sensorid)).first().name,'series':sensor_data_series}
		return jsonify(sensorLineChartData)
	except BaseException as e:
		logging.exception(e)
		return make_response({'object not found'},404)

@app.route('/api/get_Sensor_Stats_In_Date_Range',methods=["POST"])
@token_required
def get_Sensor_Stats_In_Date_Range():
	print(request)
	dateFormat = '%Y-%m-%dT%H:%M:%S'
	dates = {}
	for key,datestring in request.json.items(): #parse datestrings to datetimes
		dates[key]=(datetime.strptime(datestring[:19],dateFormat)) #19 - javascript datetime format cut to seconds
	dates['end'] = dates['end'] + timedelta(days=1) #so that date range is inclusive

	pipeline = []
	# aggregatedResult = Sensor.objects().aggregate(pipeline).to_json()
	# print(aggregatedResult)

	sensorsLineChartData = []
	for sensor in Sensor.objects: #get MV Values of every sensor
		sensor_MeasurementValues:MeasurementValue = MeasurementValue.objects(Q(sensor_id=sensor.id) & Q(timestamp__gte=(dates['start'])) & Q(timestamp__lte=(dates['end'])))
		sensor_data_series=[]
		for mv in sensor_MeasurementValues: # format Sensor MV Values in ngx data 'series' Format
			sensor_data_series.append({'name':mv.timestamp,'value':mv.temperature})
		sensorsLineChartData.append({'name':sensor.name,'series':sensor_data_series})	
	return make_response(jsonify(sensorsLineChartData))

@app.route('/api/get_Heating_Config',methods=["GET"])
@token_required
def get_Heating_Config():
	try:	
		heatingConfig = HeatingControlConfig.objects().exclude('id').first().to_json()
		return make_response(heatingConfig,200)
	except BaseException as baseException:
		return make_response(baseException,400)

@app.route('/api/write_Heating_Config',methods=["POST"])
@token_required
def write_Heating_Config():
	try:
		newHeatingConfig = HeatingControlConfig(**request.json)
		heatingConfig.REGULATION_DURATION_SECONDS=newHeatingConfig.REGULATION_DURATION_SECONDS
		heatingConfig.REGULATION_INTERVALL_SECONDS=newHeatingConfig.REGULATION_INTERVALL_SECONDS
		heatingConfig.REGULATION_TEMPERATURE_TOLERANCE=newHeatingConfig.REGULATION_TEMPERATURE_TOLERANCE
		heatingConfig.save()
		return make_response(jsonify('OK'),200)
	except BaseException as bE:
		logging.error(bE)
		return make_response(bE,400)