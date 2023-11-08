from flask import Flask, jsonify, abort
import constants.constants as constants
import getWeatherData
import util.utility as util
from flask import Flask, jsonify, request, abort
import constants.constants as constants
import getWeatherData
import util.utility as util
from datetime import datetime

app = Flask(__name__)

@app.route('/getPlantFrequency/<int:plantId>', methods=['GET'])
def get_plant_frequency(plantId):
    plant_data = util.load_plant_data(plantId)
    average_et, average_precipitation = getWeatherData.weatherData()

    if not plant_data:
        abort(404, description="Plant not found")
    
    soil_volume = util.calculate_soil_volume(plant_data['soil_radius_cm'], plant_data['soil_depth_cm'])
    irrigation_amount = constants.irrigationPumpFlow * constants.irrigationTime
    water_needed = util.calculate_water_needed_for_ideal_moisture(soil_volume, plant_data['ideal_moisture_low'], plant_data['ideal_moisture_low'], plant_data['moisture_holding_capacity'])
    
    if water_needed > irrigation_amount:
        return jsonify({
            'error': 'Irrigation system is underpowered for one-time watering to ideal moisture level.'
        }), 400
    
    watering_info = util.calculate_watering_frequency(
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

@app.route('/waterPlantIfNeeded/<int:plantId>', methods=['GET'])
def water_plant_if_needed(plantId):
    plant_data = util.load_plant_data(plantId)
    current_soil_moisture = util.getCurrentSoilMoisture(plantId)  # This function needs to be implemented

    if not plant_data:
        abort(404, description="Plant not found")
    
    if plant_data['ideal_moisture_low'] <= current_soil_moisture <= plant_data['ideal_moisture_high']:
        return jsonify({'message': 'Soil moisture is within the expected range. No watering needed.'})

    if current_soil_moisture < plant_data['ideal_moisture_low']:
        average_et, average_precipitation = getWeatherData.weatherData()
        
        soil_volume = util.calculate_soil_volume(plant_data['soil_radius_cm'], plant_data['soil_depth_cm'])
        irrigation_amount = constants.irrigationPumpFlow * constants.irrigationTime
        
        # Calculate water needed to last for the expected frequency days
        watering_info = util.calculate_watering_frequency(
            soil_volume,
            average_et,
            average_precipitation,
            irrigation_amount,
            constants.daysInAMonth
        )
        
        if isinstance(watering_info, str):
            return jsonify({'error': watering_info}), 400
        else:
            num_irrigations, days_between = watering_info
            additional_water_needed = util.calculate_water_needed_for_ideal_moisture(
                soil_volume,
                plant_data['ideal_moisture_low'],
                current_soil_moisture,
                plant_data['moisture_holding_capacity']
            )
            
            # This logic assumes that if the water needed is more than the irrigation amount,
            # the system will run as many cycles as necessary to reach the required water level.
            num_cycles_needed = int(additional_water_needed / irrigation_amount) + (additional_water_needed % irrigation_amount > 0)
            
            # Update last irrigation date
            util.update_last_irrigation_date(plantId, datetime.now().isoformat())  # This function needs to be implemented
            
            return jsonify({
                'message': 'Number of cycles to water the plant for is given',
                'num_irrigation_cycles_run': num_cycles_needed,
                'last_irrigation_date': datetime.now().isoformat()
            })
    else:
        # In case the soil moisture is above the ideal range (which might be a possible case)
        return jsonify({'message': 'Soil moisture is above the expected range. No watering needed.'})


if __name__ == '__main__':
    app.run(debug=True)
