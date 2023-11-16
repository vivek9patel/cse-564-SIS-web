import json
import math
from flask import abort
from datetime import datetime, timezone

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
    file_path = 'database/irrigationTracker.json'
    with open(file_path, 'r') as file:
        data = json.load(file)

    if str(plant_id) in data:
        data[str(plant_id)]['last_irrigation_date'] = new_date

        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)  # Using indent for pretty-printing
        return True
    else:
        return False

def update_soil_moisture(plant_id, moisture_level, new_date):
    file_path = 'database/irrigationTracker.json'
    with open(file_path, 'r') as file:
        data = json.load(file)

    if str(plant_id) in data:
        data[str(plant_id)]['daily_moisture_level'] = moisture_level
        data[str(plant_id)]['moisture_record_time'] = new_date
        data[str(plant_id)]['moistureHistory'].pop()
        data[str(plant_id)]['moistureHistory'].append({
            "date": new_date,
            "moisture": moisture_level
        })
        

        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)  # Using indent for pretty-printing
        return True
    else:
        return False

def get_soil_moisture(plant_id):
    file_path = 'database/irrigationTracker.json'
    with open(file_path, 'r') as file:
        data = json.load(file)

    if str(plant_id) in data:
        return [data[str(plant_id)]['daily_moisture_level'], data[str(plant_id)]['moisture_record_time']]

def list_all_modules():
    file_path = 'database/plantData.json'
    modules = dict()
    with open(file_path, 'r') as file:
        data = json.load(file)
        for item in data:
            if data[item]['location'] in modules:
                modules[data[item]['location']].append(item)
            else:
                modules[data[item]['location']] = [item]
    return modules

def manual_override(plantId, totalWaterAdded, new_date):
    file_path = 'database/plantData.json'
    irrigation_file = 'database/irrigationTracker.json'
    with open(file_path, 'r') as file:
        data = json.load(file)
        
        soil_volume_liters = math.pi * (data[str(plantId)]['soil_radius_cm'] ** 2) * data[str(plantId)]['soil_depth_cm'] / 1000
        increase_in_moisture = totalWaterAdded / soil_volume_liters
    
    with open(irrigation_file, 'r') as ir_file:
        irr_Data = json.load(ir_file)
        new_moisture = irr_Data[str(plantId)]['daily_moisture_level'] + increase_in_moisture
        irr_Data[str(plantId)]['daily_moisture_level'] = round(new_moisture, 2)
        irr_Data[str(plantId)]['moisture_record_time'] = new_date

        lastRecordedDate = irr_Data[str(plantId)]['moistureHistory'][-1]["date"]
        print("Last rec: ", lastRecordedDate)
        lastDate = datetime.fromisoformat(lastRecordedDate.replace("Z", "+00:00"))

        if (lastDate.date() == datetime.now(timezone.utc).date()):
            irr_Data[str(plantId)]['moistureHistory'][-1]["date"] = new_date
            irr_Data[str(plantId)]['moistureHistory'][-1]["moisture"] = round(new_moisture, 2)
        else:
            irr_Data[str(plantId)]['moistureHistory'].pop()
            irr_Data[str(plantId)]['moistureHistory'].append({
            "date": new_date,
            "moisture": round(new_moisture, 2)
            })
    
    with open(irrigation_file, 'w') as file:
        json.dump(irr_Data, file, indent=4)
    return round(new_moisture, 2)

def update_plant_data(plantId, newData):
    file_path = 'database/plantData.json'
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            data[str(plantId)] = newData
            
            with open(file_path, 'w') as file:
                json.dump(data, file, indent=4)
                return True
    except:
        return False

def load_graph_data(plant_id):
    file_path = 'database/irrigationTracker.json'
    print(plant_id)
    with open(file_path, 'r') as file:
        data = json.load(file)

    if str(plant_id) in data:
        return data[str(plant_id)]['moistureHistory']

def get_surface_area(plant_id):
    file_path = 'database/plantData.json'
    with open(file_path, 'r') as file:
        data = json.load(file)

    if str(plant_id) in data:
        return round(math.pi * (data[str(plant_id)]['soil_radius_cm'] ** 2), 2)