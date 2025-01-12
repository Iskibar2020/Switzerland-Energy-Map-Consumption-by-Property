// Initialize the map
var map = L.map("map").setView([47.1635, 7.2904], 16);
var geojsonLayer1;
var originalGeoJSONData;

// Add OpenStreetMap basemap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Function to set up sliders dynamically based on min and max values
function setupSliders(minMaxValues) {
  ["Energy Con", "Current En", "Potential"].forEach((key) => {
    const min = minMaxValues[key].min;
    const max = minMaxValues[key].max;
    const sliderId = `${key.replace(" ", "").toLowerCase()}Slider`;
    const valueId = `${key.replace(" ", "").toLowerCase()}Value`;

    const slider = document.getElementById(sliderId);
    const valueLabel = document.getElementById(valueId);

    slider.min = min;
    slider.max = max;
    slider.value = max; // Default to max
    valueLabel.textContent = max;
  });
}

// Load GeoJSON and initialize the map layer with pie charts
function addGeoJSONWithRandomCharts(data) {
  geojsonLayer1 = L.geoJSON(data, {
    onEachFeature: function (feature, layer) {
      const properties = feature.properties;
      const randomValues = [
        properties["Energy Con"],
        properties["Current En"],
        properties["Potential"],
      ];

      const center = layer.getBounds().getCenter();

      const pieChart = L.minichart(center, {
        data: randomValues,
        type: "pie",
        colors: ["#ff6384", "#36a2eb", "#cc65fe"],
        width: 50,
      });

      map.addLayer(pieChart);

      pieChart.on("click", function () {
        google.charts.load("current", { packages: ["corechart"] });
        console.log(properties["Building N"]);

        const popupContent = `
          <div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 40%; vertical-align: top;">
                  <p><strong>Building Name:</strong> ${properties["Building N"]}</p>
                  <p><strong>Building Level:</strong> ${properties["Building L"]}</p>
                  <p><strong>Address:</strong> ${properties["Address"]}</p>
                  <p><strong>Energy Consumption:</strong> ${properties["Energy Con"]}</p>
                  <p><strong>Current Energy:</strong> ${properties["Current En"]}</p>
                  <p><strong>Potential:</strong> ${properties["Potential"]}</p>
                </td>
                <td style="width: 60%; vertical-align: top;">
                  <div id="myChart" style="width:300px; height:150px;"></div>
                </td>
              </tr>
            </table>
          </div>
        `;

        const popup = L.popup()
          .setLatLng(center)
          .setContent(popupContent)
          .openOn(map);

        setTimeout(() => {
          google.charts.setOnLoadCallback(() => {
            const data = google.visualization.arrayToDataTable([
              ["Metric", "Value"],
              ["Energy Consumption", properties["Energy Con"]],
              ["Current Energy", properties["Current En"]],
              ["Potential", properties["Potential"]],
            ]);

            const options = {
              pieHole: 0.4,
              colors: ["#ff6384", "#36a2eb", "#FFCD56"],
              legend: { position: "right" },
              backgroundColor: "white",
              chartArea: { width: "90%", height: "90%" },
            };

            const chartContainer = document.getElementById("myChart");
            if (chartContainer) {
              const chart = new google.visualization.PieChart(chartContainer);
              chart.draw(data, options);
            } else {
              console.error("Chart container not found in popup content.");
            }
          });
        }, 200);
      });

      feature.layer = layer;
      feature.pieChart = pieChart;
    },
  }).addTo(map);
}

// Load initial GeoJSON data and calculate min/max values
fetch("Data/Building.geojson")
  .then((response) => response.json())
  .then((data) => {
    originalGeoJSONData = data;

    // Calculate min and max values for the sliders
    const minMaxValues = {
      "Energy Con": { min: Infinity, max: -Infinity },
      "Current En": { min: Infinity, max: -Infinity },
      Potential: { min: Infinity, max: -Infinity },
    };

    data.features.forEach((feature) => {
      ["Energy Con", "Current En", "Potential"].forEach((key) => {
        const value = feature.properties[key];
        if (value < minMaxValues[key].min) minMaxValues[key].min = value;
        if (value > minMaxValues[key].max) minMaxValues[key].max = value;
      });
    });

    // Set up sliders with calculated values
    setupSliders(minMaxValues);

    // Add the GeoJSON data to the map with pie charts
    addGeoJSONWithRandomCharts(data);
  })
  .catch((err) => console.error("Error loading GeoJSON:", err));

// Filter GeoJSON data and show/hide elements
function filterGeoJSON() {
  var energyConThreshold = document.getElementById("energyconSlider").value;
  var currentEnThreshold = document.getElementById("currentenSlider").value;
  var potentialThreshold = document.getElementById("potentialSlider").value;

  originalGeoJSONData.features.forEach((feature) => {
    const { layer, pieChart, properties } = feature;

    if (
      properties["Energy Con"] <= energyConThreshold &&
      properties["Current En"] <= currentEnThreshold &&
      properties["Potential"] <= potentialThreshold
    ) {
      if (!map.hasLayer(layer)) {
        map.addLayer(layer);
      }
      if (!map.hasLayer(pieChart)) {
        map.addLayer(pieChart);
      }
    } else {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
      if (map.hasLayer(pieChart)) {
        map.removeLayer(pieChart);
      }
    }
  });
}

function setupSliders(minMaxValues) {
  ["Energy Con", "Current En", "Potential"].forEach((key) => {
    const min = Math.round(minMaxValues[key].min);
    const max = Math.round(minMaxValues[key].max);
    const sliderId = `${key.replace(" ", "").toLowerCase()}Slider`;
    const minId = `${key.replace(" ", "").toLowerCase()}Min`;
    const maxId = `${key.replace(" ", "").toLowerCase()}Max`;
    const valueId = `${key.replace(" ", "").toLowerCase()}Value`;

    const slider = document.getElementById(sliderId);
    const minLabel = document.getElementById(minId);
    const maxLabel = document.getElementById(maxId);
    const valueLabel = document.getElementById(valueId);

    slider.min = min;
    slider.max = max;
    slider.value = max; // Default to max
    minLabel.textContent = min;
    maxLabel.textContent = max;
    valueLabel.textContent = max;
  });
}

// Add event listeners to sliders
["energycon", "currenten", "potential"].forEach((id) => {
  document.getElementById(`${id}Slider`).addEventListener("input", function () {
    document.getElementById(`${id}Value`).textContent = this.value;
    filterGeoJSON();
  });
});
