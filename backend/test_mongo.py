# backend/test_mongo.py
import os
import pymongo

MONGO_URL = os.environ.get("MONGO_URL")

try:
    client = pymongo.MongoClient(MONGO_URL)
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")