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
        return num_irrigations_needed, float("{:.3f}".format(days_between_irrigations))

def load_irrigation_data(plant_id):
    try:
        with open('database/irrigationTracker.json') as f:
            irrigation_data = json.load(f)
            return irrigation_data.get(str(plant_id))
    except FileNotFoundError:
        abort(404, description="Database file not found")
    except json.JSONDecodeError:
        abort(500, description="Error decoding JSON data from file")


def getCurrentSoilMoisture(id):
    irrigation_data = load_irrigation_data(id)
    print(irrigation_data)
    return irrigation_data["daily_moisture_level"]

def update_last_irrigation_date(plant_id, new_date):
    # Specify the path to your JSON file
    file_path = 'database/irrigationTracker.json'
    
    # Read the existing data
    with open(file_path, 'r') as file:
        data = json.load(file)

    # Check if the specific plant_id is in the data
    if str(plant_id) in data:
        # Update the last_irrigation_date field
        data[str(plant_id)]['last_irrigation_date'] = new_date

        # Write the data back to the file
        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)  # Using indent for pretty-printing
        return True
    else:
        return False
