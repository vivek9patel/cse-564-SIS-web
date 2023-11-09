import requests
from datetime import datetime, timedelta

def weatherData():
    # Determine the current month and year, then adjust to the previous year
    current_date = datetime.now()
    previous_year = current_date.year - 1
    current_month = current_date.month

    # Construct the start and end dates for the API request
    start_date = datetime(previous_year, current_month, 1).strftime('%Y-%m-%d')
    end_date = (datetime(previous_year, current_month + 1, 1) - timedelta(days=1)).strftime('%Y-%m-%d')

    # API endpoint with formatted start_date and end_date
    api_url = f"https://archive-api.open-meteo.com/v1/archive?latitude=52.52&longitude=13.41&start_date={start_date}&end_date={end_date}&daily=temperature_2m_mean,precipitation_sum,et0_fao_evapotranspiration"

    # Send a request to the API
    response = requests.get(api_url)
    data = response.json()

    # Function to calculate the average of a list
    def calculate_average(data_list):
        average = sum(data_list) / len(data_list)
        return float("{:.3f}".format(average))

    average_precipitation = calculate_average(data['daily']['precipitation_sum'])
    average_evapotranspiration = calculate_average(data['daily']['et0_fao_evapotranspiration'])

    return average_precipitation, average_evapotranspiration