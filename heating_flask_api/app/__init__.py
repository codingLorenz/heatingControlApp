from flask_sqlalchemy import SQLAlchemy
from flask.app import Flask
from flask_cors import CORS
import logging
from flask.templating import render_template
from mongoengine import connect

logging.basicConfig(filename='api.log', encoding='utf-8',filemode='w', level=logging.WARNING, format='%(asctime)s %(levelname)s %(name)s %(message)s')

app = Flask(__name__)

app.config['MONGODB_SETTINGS'] = {
    "db": "heatControlDB",
}

connect('heatControlDB')
app.config['SECRET_KEY']='Th1s1ss3cr3t'
CORS(app)

from app.modbus_service.models import HeatingControlConfig, MeasurementValue, Relay, Sensor, User

def init_db():
    Sensor.drop_collection()
    Relay.drop_collection()
    User.drop_collection()
    MeasurementValue.drop_collection()
    HeatingControlConfig.drop_collection()
    sensor1 = Sensor(temperature=10,tolerance=0.5,name='Außentemperatur',registerAddress=0)
    sensor2 = Sensor(temperature=22,tolerance=0.5,name='Vorlauftemperatur',registerAddress=1,idealTemperature=20)
    relay1 = Relay(heating=False,name='Heizung +',registerAddress=16)
    relay2 = Relay(heating=False,name='Heizung -',registerAddress=17)
    sensor1.save()
    sensor2.save()
    relay1.save()
    relay2.save()
    user = User(username='andreas',password='heizung')
    user.password = User.hash_password(user.password)
    user.save()
    initialHeatingConfig = HeatingControlConfig(REGULATION_DURATION_SECONDS=60,REGULATION_INTERVALL_SECONDS=3,REGULATION_TEMPERATURE_TOLERANCE=3)
    initialHeatingConfig.save()

    

init_db() 
from app.modbus_service import service, controllers
from datetime import datetime,timedelta
from bson.objectid import ObjectId
import random

def prepareTestMVs():
    startDateTime = datetime(2021,4,1,10,10,10)
    endDateTime = startDateTime+timedelta(days=13)
    while startDateTime < endDateTime:
        mv1 = MeasurementValue(temperature=(random.uniform(-4,20)),sensor_id=ObjectId(oid='604f8ad039a49e14e2db20df'),timestamp=startDateTime)
        mv2 = MeasurementValue(temperature=(random.uniform(15,25)),sensor_id=ObjectId(oid='604f8ad039a49e14e2db20e0'),timestamp=startDateTime)
        mv1.save()
        mv2.save()
        startDateTime = startDateTime+timedelta(minutes=10)
# prepareTestMVs()