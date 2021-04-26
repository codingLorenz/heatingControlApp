# Statement for enabling the development environment
DEBUG = True

# Define the application directory
import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))  

# Define the database - we are working with
# SQLite for this example
# SQLALCHEMY_DATABASE_URI = 'sqlite:///heatControl.db'

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///heatControl.db'
DATABASE_CONNECT_OPTIONS = {}