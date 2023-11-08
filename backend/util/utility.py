import json
import math
from flask import abort

def load_plant_data(plant_id):
    try:
        with open('database/plantData.json') as f:
            plants_data = json.load(f)
            return plants_data.get(str(plant_id))
    except FileNotFoundError:
        abort(404, description="Database file not found")
    except json.JSONDecodeError:
        abort(500, description="Error decoding JSON data from file")

def calculate_soil_volume(radius, depth):
    return math.pi * (radius ** 2) * depth

def calculate_water_needed_for_ideal_moisture(soil_volume, current_moisture_percentage, ideal_moisture_percentage, moisture_holding_capacity):
    water_needed = soil_volume * (ideal_moisture_percentage - current_moisture_percentage) * moisture_holding_capacity
    return water_needed / 1000  # converting from cubic cm to liters

def calculate_watering_frequency(soil_volume, et_rate, precipitation, irrigation_amount, days_in_month):
    daily_water_loss = (et_rate - precipitation) * soil_volume / 1000  # convert to liters
    total_water_loss = daily_water_loss * days_in_month

    if daily_water_loss <= 0:
        return "No irrigation needed, precipitation is enough."
    else:
        num_irrigations_needed = math.ceil(total_water_loss / irrigation_amount)
        days_between_irrigations = days_in_month / num_irrigations_needed
        return num_irrigations_needed, days_between_irrigations