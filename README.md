# IoT Dashboard Monitoring & Control System

This project is a **web-based dashboard** for monitoring and controlling IoT devices such as **temperature and humidity sensors, an LED, a fan, and automatic/manual mode toggling**. The interface communicates with a microcontroller (e.g., ESP32/ESP8266) running the `automationTest.ino` firmware.

---

## 🖥️ Features

- 🌡️ Real-time display of temperature and humidity
- 📊 Historical graph using Chart.js
- 💡 Manual control of an LED
- 🌬️ Manual or automatic control of a fan
- 🔄 Switch between **Automatic** and **Manual** modes
- 📱 Responsive UI built with Bootstrap 5

---

## 📁 Project Structure

├── index.html # Main frontend dashboard page

├── main.js # JavaScript logic for fetching data and device control

├── automationTest.ino # Microcontroller code for ESP32/ESP8266

---

## ⚙️ API Endpoints

The frontend sends requests to this base URL:

http://192.168.18.30

Ensure your microcontroller is connected to the same local network and serves the following endpoints:

| Endpoint       | Method     | Description                      |
|----------------|------------|----------------------------------|
| `/data`        | GET        | Retrieve temperature and humidity |
| `/led1`        | GET/POST   | Get or toggle the LED state       |
| `/fan`         | GET/POST   | Get or toggle the fan state       |
| `/mode`        | GET/POST   | Get or change control mode        |

---

## 🚀 How to Run

### 1. Microcontroller (ESP32/ESP8266)
- Upload `automationTest.ino` using the Arduino IDE.
- Ensure Wi-Fi credentials and REST endpoints are properly configured.

### 2. Frontend (Web Dashboard)
- Open `index.html` in a modern browser.
- Ensure your device and the microcontroller are on the same network.

---

## 📦 Technologies Used

- HTML5 + CSS3 (Bootstrap 5)
- JavaScript (Fetch API, Chart.js)
- ESP32/ESP8266 with Arduino framework
- Simple REST API communication

---

## 🛡️ Security Notes

- This system does not include authentication and is intended for local network or educational use only.
- **Do not expose this system to the public internet** without adding appropriate security measures.

---

## 🧑‍💻 Contributing

Feel free to fork the repository, submit a pull request, or adapt it for your own IoT applications.
