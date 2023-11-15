const int moistureSensorPin = A0;
const int motorPin = 7; 
const int moistureThreshold = 270;

void setup() {
  pinMode(moistureSensorPin, INPUT);
  pinMode(motorPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(moistureSensorPin);
  Serial.println(sensorValue); 

  if (sensorValue < moistureThreshold) {
    digitalWrite(motorPin, HIGH);
  } else {
    digitalWrite(motorPin, LOW);
  }

  delay(1000);
}

