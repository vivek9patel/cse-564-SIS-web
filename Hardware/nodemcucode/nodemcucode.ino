#include <ESP8266WiFi.h>

const char* ssid = "SETUP-4B31"; //Wi-Fi Username
const char* password = "comedy7178cause"; //Wi-Fi Password
const char* host = "127.0.0.1"; // IP Address of Server
const int httpPort = 5000; //Port of Server

WiFiClient client;

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void loop() {
  if (Serial.available()) {

    String sensorValue = Serial.readStringUntil('\n');
    sensorValue.trim();

    if (!client.connect(host, httpPort)) {
      Serial.println("Connection failed");
      return;
    }
  
    String httpRequest = "GET /data?value=" + sensorValue + " HTTP/1.1\r\n" +
                         "Host: " + host + "\r\n" + 
                         "Connection: close\r\n\r\n";

    client.print(httpRequest);

    delay(1000);
  }
}