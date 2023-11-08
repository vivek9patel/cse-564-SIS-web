from flask import Flask, jsonify, abort
import math
import json
import constants.constants as constants
import getWeatherData

app = Flask(__name__)

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

@app.route('/getPlantFrequency/<int:plantId>', methods=['GET'])
def get_plant_frequency(plantId):
    plant_data = load_plant_data(plantId)
    average_et, average_precipitation = getWeatherData.weatherData()

    if not plant_data:
        abort(404, description="Plant not found")
    
    soil_volume = calculate_soil_volume(plant_data['soil_radius_cm'], plant_data['soil_depth_cm'])
    irrigation_amount = constants.irrigationPumpFlow * constants.irrigationTime
    water_needed = calculate_water_needed_for_ideal_moisture(soil_volume, plant_data['ideal_moisture_low'], plant_data['ideal_moisture_low'], plant_data['moisture_holding_capacity'])
    
    if water_needed > irrigation_amount:
        return jsonify({
            'error': 'Irrigation system is underpowered for one-time watering to ideal moisture level.'
        }), 400
    
    watering_info = calculate_watering_frequency(
        soil_volume,
        average_et,
        average_precipitation,
        irrigation_amount,
        constants.daysInAMonth
    )
    
    if isinstance(watering_info, str):
        response = {'message': watering_info}
    else:
        num_irrigations, days_between = watering_info
        response = {
            'num_irrigations': num_irrigations,
            'days_between_irrigations': days_between
        }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
