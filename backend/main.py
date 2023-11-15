from flask import Flask, jsonify, request, abort
import constants.constants as constants
import getWeatherData
import util.utility as util
from datetime import datetime

app = Flask(__name__)

@app.route('/getIrrigationFrequency/<int:plantId>', methods=['GET'])
def getIrrigationFrequency(plantId):
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

@app.route('/dailyIrrigationChecker/<int:plantId>', methods=['GET'])
def dailyIrrigationChecker(plantId):
    plant_data = util.load_plant_data(plantId)
    current_soil_moisture = util.getCurrentSoilMoisture(plantId)

    if not plant_data:
        abort(404, description="Plant not found")
    
    if plant_data['ideal_moisture_low'] <= current_soil_moisture <= plant_data['ideal_moisture_high']:
        return jsonify({'message': 'Soil moisture is within the expected range. No watering needed.'})

    if current_soil_moisture < plant_data['ideal_moisture_low']:
        average_et, average_precipitation = getWeatherData.weatherData()
        
        soil_volume = util.calculate_soil_volume(plant_data['soil_radius_cm'], plant_data['soil_depth_cm'])
        irrigation_amount = constants.irrigationPumpFlow * constants.irrigationTime
        
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
            additional_water_needed = util.calculate_water_needed_for_ideal_moisture(
                soil_volume,
                plant_data['ideal_moisture_low'],
                current_soil_moisture,
                plant_data['moisture_holding_capacity']
            )
            
            num_cycles_needed = int(additional_water_needed / irrigation_amount) + (additional_water_needed % irrigation_amount > 0)
            util.update_last_irrigation_date(plantId, datetime.now().isoformat())
            
            if num_cycles_needed > 0:
                return jsonify({
                    'message': 'Number of cycles to water the plant for is given',
                    'num_irrigation_cycles_run': num_cycles_needed,
                    'last_irrigation_date': datetime.now().isoformat()
                })
            else:
                return jsonify({
                    'message': "Soil moisture is within the expected range. No watering needed.",
                    'last_irrigation_date': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
                })

    else:
        return jsonify({'message': 'Soil moisture is above the expected range. No watering needed.'})

@app.route('/uploadPlantMoisture/<int:plantId>/<float(signed=True):soilMoisture>', methods=['POST'])
def dailySoilMoistureUpload(plantId, soilMoisture):
    util.update_soil_moisture(plantId, soilMoisture, datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'))
    return dailyIrrigationChecker(plantId)
 
@app.route('/getSoilMoisture/<int:plantId>', methods=['GET'])
def getSoilMoisture(plantId):
    soilMoisture, lastRecordedDate = util.get_soil_moisture(plantId)
    return jsonify({
        'soilMoisture': soilMoisture,
        'lastRecordedDate': lastRecordedDate
    })

@app.route('/getAllModules', methods=['GET'])
def getAllModules():
    allModules = util.list_all_modules()
    return jsonify({
        'moduleList': allModules,
    })

@app.route('/manualOverride/<int:plantId>/<int:cycles>', methods=['POST'])
def manualOverride(plantId, cycles):
    total_water_added = constants.irrigationPumpFlow * constants.irrigationTime * cycles
    return jsonify({
        'message': 'Irrigation system run for ' +  str(cycles) + ' cycles',
        'newMoisture': str(util.manual_override(plantId, total_water_added, datetime.now().isoformat())),
    }) 

@app.route('/updatePlantData/<int:plantId>', methods=['POST'])
def toggleManualState(plantId):
    newData = request.get_json()
    if util.update_plant_data(plantId, newData):
        return jsonify({
            'message': True,
        })
    else:
        return jsonify({
            'message': False,
        })

@app.route('/getPlantData/<int:plantId>', methods=['GET'])
def getPlantData(plantId):
    plant_data = util.load_plant_data(plantId)
    if plant_data:
        return jsonify(plant_data)
    else:
        abort(404, description="Plant not found")

@app.route('/getGraphData/<int:plantId>', methods=['GET'])
def getGraphData(plantId):
    graph_data = util.load_graph_data(plantId)
    if graph_data:
        return jsonify(graph_data)
    else:
        abort(404, description="Plant not found")

@app.route('/getSurfaceArea/<int:plantId>', methods=['GET'])
def getSurfaceArea(plantId):
    surface_area = util.get_surface_area(plantId)
    if surface_area:
        return jsonify({
            "plantID": plantId,
            "surfaceArea (in cm square)": surface_area
        })
    else:
        abort(404, description="Plant not found")


if __name__ == '__main__':
    app.run(debug=True)
