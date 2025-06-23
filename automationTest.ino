#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>

WebServer server(80);

#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Definisikan channel PWM untuk tiap warna
#define RED_CHANNEL 0
#define GREEN_CHANNEL 1
#define BLUE_CHANNEL 2

#define RED_PIN 12
#define GREEN_PIN 13
#define BLUE_PIN 14

const char *ssid = "Indihon";
const char *password = "12233344";
// const char *ssid = "Redmi Note 13 Pro 5G";
// const char *password = "123456789";

int ledPin1 = 19;
int ledPinFlash = 18;
int ledPinWiFi = 27;
int pirPin = 26;
int RELAY_PIN = 17;

bool led1State = false;
bool relayState = false;

bool autoMode = true;                     // Default: auto mode
unsigned long lastMotionTime = 0;         // Waktu terakhir gerakan terdeteksi
const unsigned long motionTimeout = 5000; // 5000 ms = 5 detik

// Forward declaration
void handleRoot();
void handleInfo();

// Endpoint: /
void handleRoot()
{
  String html = R"rawliteral(
    <!DOCTYPE html>
    <html>
    <head>
      <title>ESP32 Web Server</title>
      <style>
        body { font-family: Arial; text-align: center; margin-top: 50px; }
        h1 { color: #007BFF; }
        p { font-size: 18px; }
      </style>
    </head>
    <body>
      <h1>Halo dari ESP32!</h1>
      <p>Ini adalah halaman HTML yang dikirim dari server ESP32.</p>
      <p><a href="/info">Lihat informasi WiFi</a></p>
    </body>
    </html>
  )rawliteral";

  server.send(200, "text/html", html);
}

// Endpoint: /info
void handleInfo()
{
  String info = "WiFi SSID: ";
  info += ssid;
  info += "<br>IP Address: ";
  info += WiFi.localIP().toString();

  server.send(200, "text/html", info);
}

void readDHT11()
{
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h))
  {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(500, "application/json", "{\"error\":\"Sensor error\"}");
    return;
  }

  String json = "{\"temperature\":" + String(t) + ",\"humidity\":" + String(h) + "}";
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

void dhtSetup()
{
  dht.begin();
}
void ledSetup()
{
  pinMode(ledPin1, OUTPUT);
  digitalWrite(ledPin1, LOW);
  pinMode(ledPinFlash, OUTPUT);
  digitalWrite(ledPinFlash, LOW);
  pinMode(ledPinWiFi, OUTPUT);
  digitalWrite(ledPinWiFi, LOW);
}

void relaySetup()
{
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // OFF saat awal (relay aktif LOW)
  relayState = false;
}

void pirSetup()
{
  pinMode(pirPin, INPUT_PULLDOWN);
}

void readPirMove()
{
  if (!autoMode)
    return; // Abaikan PIR jika mode manual

  int val = digitalRead(pirPin);

  if (val == HIGH)
  {
    digitalWrite(ledPinFlash, HIGH);
    relayState = true;
    digitalWrite(RELAY_PIN, LOW); // Aktifkan relay
    lastMotionTime = millis();    // Simpan waktu gerakan
  }
  else
  {
    if (relayState && (millis() - lastMotionTime >= motionTimeout))
    {
      relayState = false;
      digitalWrite(RELAY_PIN, HIGH); // Matikan relay
      digitalWrite(ledPinFlash, LOW);
    }
  }
}

void wiFiSetup()
{
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.print(".");
    digitalWrite(ledPinWiFi, HIGH);
  }

  digitalWrite(ledPinWiFi, LOW);
  Serial.println("");
  Serial.println("Connected to WiFi!");
  Serial.println(WiFi.localIP());
}
void reconnectWiFi()
{
  Serial.println("WiFi disconnected. Attempting to reconnect...");
  WiFi.disconnect(); // Putuskan koneksi dulu untuk reset
  WiFi.begin(ssid, password);

  // int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED) //&& retryCount < 10) {
  {
    delay(1000);
    Serial.print(".");
    digitalWrite(ledPinWiFi, !digitalRead(ledPinWiFi)); // LED berkedip
    // retryCount++;
  }

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("");
    Serial.println("Reconnected to WiFi!");
    Serial.println(WiFi.localIP());
    digitalWrite(ledPinWiFi, LOW); // Matikan LED berkedip jika reconnect berhasil
  }
  else
  {
    Serial.println("");
    Serial.println("Failed to reconnect to WiFi.");
  }
}

void serverSetup()
{
  // Rute endpoint
  server.on("/info", HTTP_GET, handleInfo); // Akses: /info
  server.on("/", handleRoot);
  server.on("/led1", HTTP_GET, getLed1);
  server.on("/led1", HTTP_POST, setLed1);
  server.on("/fan", HTTP_GET, getRelay);
  server.on("/fan", HTTP_POST, setRelay);
  server.on("/mode", HTTP_GET, getMode);  // Lihat mode
  server.on("/mode", HTTP_POST, setMode); // Atur mode
  server.on("/data", readDHT11);

  server.begin();
  Serial.println("Web server started.");
}

void rgbSetup()
{
  // Atur frekuensi PWM, resolusi, dan pin
  ledSetup(RED_CHANNEL, 5000, 8); // 5kHz, 8-bit
  ledAttachPin(RED_PIN, RED_CHANNEL);

  ledSetup(GREEN_CHANNEL, 5000, 8); // 5kHz, 8-bit
  ledAttachPin(GREEN_PIN, GREEN_CHANNEL);

  ledSetup(BLUE_CHANNEL, 5000, 8); // 5kHz, 8-bit
  ledAttachPin(BLUE_PIN, BLUE_CHANNEL);
}

void rgbLoop()
{
  ledWrite(RED_CHANNEL, 255);
  ledWrite(GREEN_CHANNEL, 0);
  ledWrite(BLUE_CHANNEL, 255);
  delay(1000);

  // Kuning
  ledWrite(RED_CHANNEL, 255);
  ledWrite(GREEN_CHANNEL, 255);
  ledWrite(BLUE_CHANNEL, 0);
  delay(1000);

  // Putih
  ledWrite(RED_CHANNEL, 255);
  ledWrite(GREEN_CHANNEL, 255);
  ledWrite(BLUE_CHANNEL, 255);
  delay(1000);
}

void setup()
{
  Serial.begin(115200);
  dhtSetup();
  ledSetup();
  wiFiSetup();
  serverSetup();
  pirSetup();
  relaySetup();
  rgbSetup();
}

void loop()
{
  // Auto reconnect jika WiFi terputus
  if (WiFi.status() != WL_CONNECTED)
  {
    reconnectWiFi();
  }

  rgbLoop();
  readPirMove();
  server.handleClient();
}

void setLed1()
{
  led1State = !led1State;

  digitalWrite(ledPin1, led1State ? HIGH : LOW);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", led1State ? "ON" : "OFF");
}
void getLed1()
{
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", led1State ? "ON" : "OFF");
}
void setRelay()
{
  if (autoMode)
  {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(403, "text/plain", "Relay dikendalikan otomatis oleh sensor.");
    return;
  }

  relayState = !relayState;
  digitalWrite(RELAY_PIN, relayState ? LOW : HIGH);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", relayState ? "ON" : "OFF");
}

void getRelay()
{
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", relayState ? "ON" : "OFF");
}

void getMode()
{
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", autoMode ? "AUTO" : "MANUAL");
}

void setMode()
{
  if (server.hasArg("mode"))
  {
    String modeArg = server.arg("mode");
    if (modeArg == "AUTO")
    {
      digitalWrite(ledPinFlash, HIGH);
      autoMode = true;
    }
    else if (modeArg == "MANUAL")
    {
      digitalWrite(ledPinFlash, LOW);
      autoMode = false;
    }
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", autoMode ? "AUTO" : "MANUAL");
}