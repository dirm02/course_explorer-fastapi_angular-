import pandas as pd
import requests
from io import StringIO
from pymongo import MongoClient
from datetime import datetime, timezone
from config import MONGO_URL, DB_NAME, COLLECTION_NAME, CSV_URL

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
courses_collection = db[COLLECTION_NAME]
categories_collections = {
    'universities': db['universities'],
    'cities': db['cities'],
    'countries': db['countries'],
    #'course_names': db['course_names'],
    'currencies': db['currencies']
}

def download_and_normalize_data():
    response = requests.get(CSV_URL)
    df = pd.read_csv(StringIO(response.text))
    df_normalized, categories = normalize_data(df)
    df_normalized['createdAt'] = datetime.now(timezone.utc)
    return df_normalized, categories

def normalize_data(df):
    universities = df['University'].drop_duplicates().reset_index(drop=True).reset_index().rename(columns={'index': 'UniversityID'})
    cities = df['City'].drop_duplicates().reset_index(drop=True).reset_index().rename(columns={'index': 'CityID'})
    countries = df['Country'].drop_duplicates().reset_index(drop=True).reset_index().rename(columns={'index': 'CountryID'})
    #course_names = df['CourseName'].drop_duplicates().reset_index(drop=True).reset_index().rename(columns={'index': 'CourseID'})
    currencies = df['Currency'].drop_duplicates().reset_index(drop=True).reset_index().rename(columns={'index': 'CurrencyID'})

    categories = {
        'universities': universities.to_dict(orient='records'),
        'cities': cities.to_dict(orient='records'),
        'countries': countries.to_dict(orient='records'),
        #'course_names': course_names.to_dict(orient='records'),
        'currencies': currencies.to_dict(orient='records')
    }

    df = df.merge(universities, on='University').merge(cities, on='City').merge(countries, on='Country').merge(currencies, on='Currency')

    df_normalized = df.drop(columns=['University', 'City', 'Country', 'Currency']).rename(columns={
        'UniversityID': 'UniversityID',
        'CityID': 'CityID',
        'CountryID': 'CountryID',
        #CourseID': 'CourseID',
        'CurrencyID': 'CurrencyID'
    })

    df_normalized = df_normalized[['UniversityID', 'CityID', 'CountryID', 'CourseName', 'CourseDescription', 'StartDate', 'EndDate', 'Price', 'CurrencyID']]

    return df_normalized, categories

def save_data_to_mongodb(data, categories):
    courses_collection.insert_many(data.to_dict('records'))
    for category, records in categories.items():
        collection = categories_collections[category]
        collection.drop()
        collection.insert_many(records)
        collection.create_index("createdAt", expireAfterSeconds=600)

    # Create text index on required fields
    print("Creating text index on CourseDescription field...")
    courses_collection.create_index([('CourseDescription', 'text')])

def check_and_refresh_data():
    if courses_collection.estimated_document_count() == 0:
        df_normalized, categories = download_and_normalize_data()
        save_data_to_mongodb(df_normalized, categories)

def refresh_data():
    courses_collection.drop()
    df_normalized, categories = download_and_normalize_data()
    save_data_to_mongodb(df_normalized, categories)
