from flask import Flask, request
import datetime

app = Flask(__name__)

# Dummy database list
data_store = []

@app.route('/data', methods=['GET'])
def receive_data():
    value = request.args.get('value')
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data_store.append({'timestamp': timestamp, 'value': value})
    return 'Data received'

@app.route('/getdata', methods=['GET'])
def send_data():
    return {'data': data_store}

if __name__ == '__main__':
    app.run(debug=True, port=5000)