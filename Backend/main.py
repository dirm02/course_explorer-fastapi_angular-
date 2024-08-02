from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from data_handler import check_and_refresh_data, refresh_data, courses_collection, categories_collections
from datetime import datetime, timezone
import re
import math

app = FastAPI()

class Course(BaseModel):
    UniversityID: int = Field(None)
    CityID: int = Field(None)
    CountryID: int = Field(None)
    CourseName: str = Field(None)
    CourseDescription: str = Field(None)
    StartDate: str = Field(None)
    EndDate: str = Field(None)
    Price: float = Field(None)
    CurrencyID: int = Field(None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    check_and_refresh_data()
    yield
    # Any cleanup actions can be done here, if needed

app.router.lifespan_context = lifespan

def get_category_name(collection_name, category_name, id_value):
    """Helper function to get category data from category collection"""
    collection = categories_collections[collection_name]
    result = collection.find_one({"{}ID".format(category_name): id_value})
    return result[category_name] if result else ""

def convert_object_ids(doc):
    """Helper function to convert ObjectId to string in a MongoDB document."""
    if isinstance(doc, list):
        for item in doc:
            item['_id'] = str(item['_id'])
    else:
        doc['_id'] = str(doc['_id'])
    return doc

def merge_course_data(course):
    """Helper function to merge course data with category names."""
    course['University'] = get_category_name('universities', 'University', course['UniversityID'])
    course['City'] = get_category_name('cities', 'City', course['CityID'])
    course['Country'] = get_category_name('countries', 'Country', course['CountryID'])
    course['Currency'] = get_category_name('currencies', 'Currency', course['CurrencyID'])
    keys_to_delete = ['UniversityID', 'CityID', 'CountryID', 'CurrencyID']
    for key in keys_to_delete:
        course.pop(key, None)

    return course

def text_search(courses, query):
    """Helper function to perform text search on merged course data."""
    regex = re.compile(query, re.IGNORECASE)
    filtered_courses = []
    for course in courses:
        if (
            regex.search(course['University']) or
            regex.search(course['City']) or
            regex.search(course['Country']) or
            regex.search(course['CourseName']) or
            regex.search(course['CourseDescription']) or
            regex.search(course['Currency'])
        ):
            filtered_courses.append(course)
    return filtered_courses

@app.get("/courses/")
async def get_courses(query: str = "", page: int = 1, limit: int = 10):
    try:
        if query:
            # Fetch all courses
            courses = list(courses_collection.find())
            for course in courses:
                convert_object_ids(course)
                merge_course_data(course)
            # Perform text search
            courses = text_search(courses, query)
            total_courses = len(courses)
            # Apply pagination on the filtered list
            paginated_courses = courses[(page - 1) * limit: page * limit]
        else:
            total_courses = courses_collection.count_documents({})
            # Fetch paginated courses directly from the database
            paginated_courses = list(courses_collection.find().skip((page - 1) * limit).limit(limit))
            for course in paginated_courses:
                convert_object_ids(course)
                merge_course_data(course)

        total_pages = math.ceil(total_courses / limit)

        return {
            "total_pages": total_pages,
            "current_page": page,
            "courses": paginated_courses
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching courses: {str(e)}")

@app.post("/courses/")
async def create_course(course: Course):
    try:
        new_course = course.model_dump()
        new_course['createdAt'] = datetime.now(timezone.utc)        
        result = courses_collection.insert_one(new_course)
        print(f'Response to POST request: {result}')
        return {"_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while creating the course: {str(e)}")

@app.put("/courses/{course_id}")
async def update_course(course_id: str, course: Course):
    try:
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID")
        update_data = {k: v for k, v in course.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No data provided for update")
        result = courses_collection.update_one({"_id": ObjectId(course_id)}, {"$set": update_data})
    
        if result.matched_count == 1:
            updated_course = courses_collection.find_one({"_id": ObjectId(course_id)})            
            convert_object_ids(updated_course)
            merge_course_data(updated_course)
            print(f'Response to PUT request: {updated_course}')
            # return updated_course
            return {"success": True}
        raise HTTPException(status_code=404, detail="Course not found")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while updating the course: {str(e)}")

@app.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    try:
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID")
        result = courses_collection.delete_one({"_id": ObjectId(course_id)})
        if result.deleted_count == 1:
            return {"success": True}
        raise HTTPException(status_code=404, detail="Course not found")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while deleting the course: {str(e)}")

@app.post("/refresh/")
async def refresh_database():
    try:
        refresh_data()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while refreshing the database: {str(e)}")

@app.get("/categories/{category}")
async def get_category(category: str):
    try:
        if category not in categories_collections:
            raise HTTPException(status_code=400, detail="Invalid category")
        collection = categories_collections[category]
        categories = list(collection.find({}, {'_id': False}))
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching categories: {str(e)}")
    
# run using:
# uvicorn main:app --reload
