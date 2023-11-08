from flask import Flask, jsonify, abort
import constants.constants as constants
import getWeatherData
import util.utility as util

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

if __name__ == '__main__':
    app.run(debug=True)
