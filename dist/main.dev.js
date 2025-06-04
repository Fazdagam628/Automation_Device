"use strict";

var endpoint = "http://192.168.18.30";
var buttonMode = document.getElementById("buttonMode");
var isAuto = true;
var buttonRelay = document.getElementById("buttonRelay");
var buttonLed1 = document.getElementById("buttonLed1");
var tempEl = document.getElementById("temperature");
var humEl = document.getElementById("humidity");
var ctx = document.getElementById("chart").getContext("2d");
var chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Suhu (°C)",
      borderColor: "rgb(255, 99, 132)",
      data: [],
      tension: 0.2
    }, {
      label: "Kelembapan (%)",
      borderColor: "rgb(54, 162, 235)",
      data: [],
      tension: 0.2
    }]
  },
  options: {
    animation: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Waktu"
        }
      },
      y: {
        beginAtZero: true
      }
    }
  }
});

function getData() {
  var res, data, time;
  return regeneratorRuntime.async(function getData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(fetch("".concat(endpoint, "/data")));

        case 3:
          res = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(res.json());

        case 6:
          data = _context.sent;
          time = new Date().toLocaleTimeString(); // Update teks

          tempEl.textContent = data.temperature + " °C";
          humEl.textContent = data.humidity + " %"; // Update grafik

          chart.data.labels.push(time);
          chart.data.datasets[0].data.push(data.temperature);
          chart.data.datasets[1].data.push(data.humidity); // Batasi data terakhir 10 titik

          if (chart.data.labels.length > 10) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(function (ds) {
              return ds.data.shift();
            });
          }

          chart.update();
          _context.next = 20;
          break;

        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](0);
          console.error("Gagal ambil data:", _context.t0);

        case 20:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 17]]);
}

function getLed1() {
  fetch(endpoint + "/led1", {
    method: "GET"
  }).then(function (response) {
    if (!response.ok) {
      // Check if the response status is not in the 200-299 range
      throw new Error("HTTP error! status: ".concat(response.status));
    }

    return response.text();
  }).then(function (result) {
    if (result == "ON") {
      buttonLed1.textContent = "Matikan";
      buttonLed1.classList.add("btn-danger");
    } else {
      buttonLed1.textContent = "Hidupkan";
      buttonLed1.classList.add("btn-primary");
    }
  })["catch"](function (error) {
    console.error("Error fetching LED status:", error); // Log any errors

    alert("Failed to get LED status.");
  });
}

function setLed1() {
  buttonLed1.classList.remove("btn-primary");
  buttonLed1.classList.add("btn-danger");
  buttonLed1.textContent = "Memproses...";
  buttonLed1.disabled = true;
  fetch(endpoint + "/led1", {
    method: "POST"
  }).then(function (response) {
    if (!response.ok) {
      throw new Error("HTTP error! status: ".concat(response.status));
    }

    return response.text();
  }).then(function (result) {
    // Ubah tampilan tombol sesuai hasil dari server
    if (result === "ON") {
      buttonLed1.textContent = "Matikan";
      buttonLed1.classList.remove("btn-primary");
      buttonLed1.classList.add("btn-danger");
    } else {
      buttonLed1.textContent = "Hidupkan";
      buttonLed1.classList.remove("btn-danger");
      buttonLed1.classList.add("btn-primary");
    }
  })["catch"](function (error) {
    console.error("Error setting LED status:", error);
    alert("Failed to set LED status.");
  })["finally"](function () {
    buttonLed1.disabled = false;
  });
}

function getRelay() {
  fetch(endpoint + "/fan", {
    method: "GET"
  }).then(function (response) {
    if (!response.ok) {
      // Check if the response status is not in the 200-299 range
      throw new Error("HTTP error! status: ".concat(response.status));
    }

    return response.text();
  }).then(function (result) {
    if (result == "ON") {
      buttonRelay.textContent = "Matikan";
      buttonRelay.classList.add("btn-danger");
    } else {
      buttonRelay.textContent = "Hidupkan";
      buttonRelay.classList.add("btn-primary");
    }
  })["catch"](function (error) {
    console.error("Error fetching Fan status:", error); // Log any errors

    alert("Failed to get Fan status.");
  });
}

function setRelay() {
  console.log("Sending request to toggle relay...");
  buttonRelay.classList.remove("btn-primary");
  buttonRelay.classList.add("btn-danger");
  buttonRelay.textContent = "Memproses...";
  buttonRelay.disabled = true;
  fetch(endpoint + "/fan", {
    method: "POST"
  }).then(function (response) {
    if (!response.ok) {
      throw new Error("HTTP error! status: ".concat(response.status));
    }

    return response.text();
  }).then(function (result) {
    // Ubah tampilan tombol sesuai hasil dari server
    if (result === "ON") {
      buttonRelay.textContent = "Matikan";
      buttonRelay.classList.remove("btn-primary");
      buttonRelay.classList.add("btn-danger");
    } else {
      buttonRelay.textContent = "Hidupkan";
      buttonRelay.classList.remove("btn-danger");
      buttonRelay.classList.add("btn-primary");
    }
  })["catch"](function (error) {
    console.error("Error setting Fan status:", error);
    alert("Failed to set Fan status.");
  })["finally"](function () {
    buttonRelay.disabled = false;
  });
}

function getMode() {
  fetch(endpoint + "/mode").then(function (res) {
    return res.text();
  }).then(function (mode) {
    isAuto = mode === "AUTO";
    buttonMode.textContent = isAuto ? "Ubah ke Manual" : "Ubah ke Otomatis";
    buttonMode.className = isAuto ? "btn btn-outline-success" : "btn btn-outline-warning"; // Nonaktifkan tombol kipas jika AUTO

    buttonRelay.disabled = isAuto;
    buttonRelay.title = isAuto ? "Kipas dikendalikan otomatis" : "";
  })["catch"](function (err) {
    console.error("Gagal ambil mode:", err);
    buttonMode.textContent = "Gagal Ambil Mode";
  });
}

function toggleMode() {
  var newMode = isAuto ? "MANUAL" : "AUTO";
  buttonMode.disabled = true;
  buttonMode.textContent = "Mengubah...";
  fetch(endpoint + "/mode", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "mode=".concat(newMode)
  }).then(function (res) {
    return res.text();
  }).then(function () {
    getMode(); // Refresh status mode dan UI
  })["catch"](function (err) {
    console.error("Gagal ubah mode:", err);
    alert("Gagal ubah mode");
  })["finally"](function () {
    buttonMode.disabled = false;
  });
}

setInterval(getData, 10000);
getData();
getLed1();
getRelay();
getMode();