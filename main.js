const endpoint = "http://192.168.18.30";

const buttonMode = document.getElementById("buttonMode");

let isAuto = true;
const buttonRelay = document.getElementById("buttonRelay");
const buttonLed1 = document.getElementById("buttonLed1");
const tempEl = document.getElementById("temperature");
const humEl = document.getElementById("humidity");
const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Suhu (°C)",
        borderColor: "rgb(255, 99, 132)",
        data: [],
        tension: 0.2,
      },
      {
        label: "Kelembapan (%)",
        borderColor: "rgb(54, 162, 235)",
        data: [],
        tension: 0.2,
      },
    ],
  },
  options: {
    animation: true,
    scales: {
      x: { title: { display: true, text: "Waktu" } },
      y: { beginAtZero: true },
    },
  },
});

async function getData() {
  try {
    const res = await fetch(`${endpoint}/data`);
    const data = await res.json();
    const time = new Date().toLocaleTimeString();

    // Update teks
    tempEl.textContent = data.temperature + " °C";
    humEl.textContent = data.humidity + " %";

    // Update grafik
    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(data.temperature);
    chart.data.datasets[1].data.push(data.humidity);

    // Batasi data terakhir 10 titik
    if (chart.data.labels.length > 10) {
      chart.data.labels.shift();
      chart.data.datasets.forEach((ds) => ds.data.shift());
    }

    chart.update();
  } catch (err) {
    console.error("Gagal ambil data:", err);
  }
}

function getLed1() {
  fetch(endpoint + "/led1", {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        // Check if the response status is not in the 200-299 range
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((result) => {
      if (result == "ON") {
        buttonLed1.textContent = "Matikan";
        buttonLed1.classList.add("btn-danger");
      } else {
        buttonLed1.textContent = "Hidupkan";
        buttonLed1.classList.add("btn-primary");
      }
    })
    .catch((error) => {
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
    method: "POST",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((result) => {
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
    })
    .catch((error) => {
      console.error("Error setting LED status:", error);
      alert("Failed to set LED status.");
    })
    .finally(() => {
      buttonLed1.disabled = false;
    });
}

function getRelay() {
  fetch(endpoint + "/fan", {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        // Check if the response status is not in the 200-299 range
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((result) => {
      if (result == "ON") {
        buttonRelay.textContent = "Matikan";
        buttonRelay.classList.add("btn-danger");
      } else {
        buttonRelay.textContent = "Hidupkan";
        buttonRelay.classList.add("btn-primary");
      }
    })
    .catch((error) => {
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
    method: "POST",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((result) => {
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
    })
    .catch((error) => {
      console.error("Error setting Fan status:", error);
      alert("Failed to set Fan status.");
    })
    .finally(() => {
      buttonRelay.disabled = false;
    });
}

function getMode() {
  fetch(endpoint + "/mode")
    .then((res) => res.text())
    .then((mode) => {
      isAuto = mode === "AUTO";
      buttonMode.textContent = isAuto ? "Ubah ke Manual" : "Ubah ke Otomatis";
      buttonMode.className = isAuto
        ? "btn btn-outline-success"
        : "btn btn-outline-warning";

      // Nonaktifkan tombol kipas jika AUTO
      buttonRelay.disabled = isAuto;
      buttonRelay.title = isAuto ? "Kipas dikendalikan otomatis" : "";
    })
    .catch((err) => {
      console.error("Gagal ambil mode:", err);
      buttonMode.textContent = "Gagal Ambil Mode";
    });
}

function toggleMode() {
  const newMode = isAuto ? "MANUAL" : "AUTO";

  buttonMode.disabled = true;
  buttonMode.textContent = "Mengubah...";

  fetch(endpoint + "/mode", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `mode=${newMode}`,
  })
    .then((res) => res.text())
    .then(() => {
      getMode(); // Refresh status mode dan UI
    })
    .catch((err) => {
      console.error("Gagal ubah mode:", err);
      alert("Gagal ubah mode");
    })
    .finally(() => {
      buttonMode.disabled = false;
    });
}

setInterval(getData, 10000);
getData();
getLed1();
getRelay();
getMode();
