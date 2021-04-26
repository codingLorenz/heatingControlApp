from mongoengine import *
from mongoengine.fields import *
from flask import json
from dataclasses import dataclass
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Sensor(Document):
    idealTemperature:float
    tolerance:int
    temperature:float
    name:str
    registerAddress:int
    registerAddress=IntField(required=True,unique=True)
    idealTemperature = FloatField()
    tolerance = FloatField(required=True)
    temperature = FloatField(required=True)
    name = StringField(required=True)
    # measurements = EmbeddedDocumentListField(MeasurementValue)

    def __repr__(self):
        return '<Sensor %r>' % self.id

    def toJSON(self):
        return json.dumps(self)
        

class Relay(Document):
    heating:bool
    name:str
    registerAddress:int
    registerAddress = IntField(unique=True)
    heating=BooleanField(required=True)
    name = StringField(required=True)


class User(Document):
    username = StringField()
    password = StringField()
    
    @staticmethod
    def hash_password(password):
        return generate_password_hash(password)
    
    @staticmethod
    def check_password(savedPassword,inputPassword):
        return check_password_hash(savedPassword,inputPassword)

class MeasurementValue(Document):
    temperature:float
    timestamp:datetime
    sensor_id=ObjectIdField()
    temperature=FloatField(required=True)
    timestamp=DateTimeField(required=True,default=datetime.utcnow())


class HeatingControlConfig(Document):
    REGULATION_DURATION_SECONDS=IntField(required=True)
    REGULATION_INTERVALL_SECONDS=IntField(required=True)
    REGULATION_TEMPERATURE_TOLERANCE=FloatField(required=True)

