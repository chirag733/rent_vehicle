from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date
from dateutil import parser


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class VehicleType(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    wheels: int  # 2 or 4
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VehicleTypeCreate(BaseModel):
    name: str
    wheels: int

class Vehicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    model: str
    type_id: str
    wheels: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VehicleCreate(BaseModel):
    model: str
    type_id: str
    wheels: int

class BookingRequest(BaseModel):
    first_name: str
    last_name: str
    wheels: int
    vehicle_type_id: str
    vehicle_id: str
    start_date: date
    end_date: date

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    wheels: int
    vehicle_type_id: str
    vehicle_id: str
    start_date: date
    end_date: date
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper functions for MongoDB date serialization
def prepare_for_mongo(data):
    """Convert Python date objects to strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, date) and not isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    """Convert date strings back to Python date objects"""
    if item and isinstance(item, dict):
        for key, value in item.items():
            if key in ['start_date', 'end_date'] and isinstance(value, str):
                try:
                    item[key] = parser.parse(value).date()
                except (ValueError, TypeError):
                    pass
            elif key in ['created_at'] and isinstance(value, str):
                try:
                    item[key] = parser.parse(value)
                except (ValueError, TypeError):
                    pass
    return item

# Initialize database with seed data
async def seed_database():
    """Seed the database with initial vehicle types and vehicles"""
    
    # Check if data already exists
    existing_types = await db.vehicle_types.count_documents({})
    if existing_types > 0:
        return  # Data already seeded
    
    # Vehicle types (3 car types, 1 bike type)
    vehicle_types = [
        {"id": "hatchback", "name": "Hatchback", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "suv", "name": "SUV", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "sedan", "name": "Sedan", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "cruiser", "name": "Cruiser", "wheels": 2, "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    
    await db.vehicle_types.insert_many(vehicle_types)
    
    # Vehicles for each type
    vehicles = [
        # Hatchbacks
        {"id": "swift", "model": "Maruti Swift", "type_id": "hatchback", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "i20", "model": "Hyundai i20", "type_id": "hatchback", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "polo", "model": "Volkswagen Polo", "type_id": "hatchback", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        
        # SUVs
        {"id": "creta", "model": "Hyundai Creta", "type_id": "suv", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "thar", "model": "Mahindra Thar", "type_id": "suv", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "fortuner", "model": "Toyota Fortuner", "type_id": "suv", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        
        # Sedans
        {"id": "city", "model": "Honda City", "type_id": "sedan", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "verna", "model": "Hyundai Verna", "type_id": "sedan", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "camry", "model": "Toyota Camry", "type_id": "sedan", "wheels": 4, "created_at": datetime.now(timezone.utc).isoformat()},
        
        # Cruisers
        {"id": "bullet", "model": "Royal Enfield Bullet", "type_id": "cruiser", "wheels": 2, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "thunderbird", "model": "Royal Enfield Thunderbird", "type_id": "cruiser", "wheels": 2, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "harley", "model": "Harley Davidson Street 750", "type_id": "cruiser", "wheels": 2, "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    
    await db.vehicles.insert_many(vehicles)

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Vehicle Rental API"}

@api_router.get("/vehicle-types", response_model=List[VehicleType])
async def get_vehicle_types(wheels: Optional[int] = None):
    """Get all vehicle types, optionally filtered by number of wheels"""
    query = {}
    if wheels:
        query["wheels"] = wheels
    
    types = await db.vehicle_types.find(query).to_list(1000)
    return [VehicleType(**parse_from_mongo(vtype)) for vtype in types]

@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles(type_id: Optional[str] = None, wheels: Optional[int] = None):
    """Get all vehicles, optionally filtered by type_id or wheels"""
    query = {}
    if type_id:
        query["type_id"] = type_id
    if wheels:
        query["wheels"] = wheels
    
    vehicles = await db.vehicles.find(query).to_list(1000)
    return [Vehicle(**parse_from_mongo(vehicle)) for vehicle in vehicles]

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_request: BookingRequest):
    """Create a new booking with overlap validation"""
    
    # Check for overlapping bookings for the same vehicle
    overlap_query = {
        "vehicle_id": booking_request.vehicle_id,
        "$or": [
            # New booking starts during existing booking
            {
                "start_date": {"$lte": booking_request.start_date.isoformat()},
                "end_date": {"$gte": booking_request.start_date.isoformat()}
            },
            # New booking ends during existing booking
            {
                "start_date": {"$lte": booking_request.end_date.isoformat()},
                "end_date": {"$gte": booking_request.end_date.isoformat()}
            },
            # New booking completely encompasses existing booking
            {
                "start_date": {"$gte": booking_request.start_date.isoformat()},
                "end_date": {"$lte": booking_request.end_date.isoformat()}
            }
        ]
    }
    
    existing_booking = await db.bookings.find_one(overlap_query)
    if existing_booking:
        raise HTTPException(
            status_code=400,
            detail=f"Vehicle is already booked for the selected dates. Existing booking from {existing_booking['start_date']} to {existing_booking['end_date']}"
        )
    
    # Validate date range
    if booking_request.start_date >= booking_request.end_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date"
        )
    
    # Validate that start date is not in the past
    if booking_request.start_date < datetime.now(timezone.utc).date():
        raise HTTPException(
            status_code=400,
            detail="Start date cannot be in the past"
        )
    
    # Create the booking
    booking = Booking(**booking_request.dict())
    booking_dict = prepare_for_mongo(booking.dict())
    
    await db.bookings.insert_one(booking_dict)
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings():
    """Get all bookings"""
    bookings = await db.bookings.find().to_list(1000)
    return [Booking(**parse_from_mongo(booking)) for booking in bookings]

# Seed database on startup
@app.on_event("startup")
async def startup_event():
    await seed_database()

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()