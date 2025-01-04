// Initialize the map
var map = L.map("map").setView([47.1635, 7.2904], 16);
var geojsonLayer1 = L.geoJSON().addTo(map);

// Add OpenStreetMap basemap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Load GeoJSON file and create pie charts with random values
function addGeoJSONWithRandomCharts(url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      L.geoJSON(data, {
        onEachFeature: function (feature, layer) {
          const properties = feature.properties;
          const randomValues = [
            properties["Energy Con"],
            properties["Current En"],
            properties["Potential"],
          ];

          if (!Array.isArray(randomValues) || randomValues.length === 0) {
            console.error("Invalid random values:", randomValues);
            return;
          }

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

            const popupContent = `
                <div>
                <table style="width: 100%; border-collapse: collapse;">
                <tr>
                <!-- First Column -->
                <td style="width: 40%; vertical-align: top;">
                <p><strong>Energy Consumption:</strong> ${properties["Energy Con"]}</p>
                <p><strong>Current Energy:</strong> ${properties["Current En"]}</p>
                <p><strong>Potential:</strong> ${properties["Potential"]}</p>
                </td>

                <!-- Second Column -->
                <td style="width: 60%; vertical-align: top;">
                <div id="myChart" style="width:300px; height:150px;"></div>
                </td>
                </tr>
                </table>
            `;

            // Open the popup
            const popup = L.popup()
              .setLatLng(center)
              .setContent(popupContent)
              .openOn(map);

            // Wait for the popup to render and the DOM to have #myChart
            setTimeout(() => {
              google.charts.setOnLoadCallback(() => {
                const data = google.visualization.arrayToDataTable([
                  ["Metric", "Value"],
                  ["Energy Consumption", properties["Energy Con"]],
                  ["Current Energy Production", properties["Current En"]],
                  ["Potential Energy Production", properties["Potential"]],
                ]);

                const options = {
                  pieHole: 0.4, // Example: Add a donut hole
                  colors: ["#ff6384", "#36a2eb", "#FFCD56"], // Optional: Chart colors
                  legend: { position: "right" }, // Optional: Legend position
                  backgroundColor: "white",
                  chartArea: { width: "90%", height: "90%" },
                };

                const chartContainer = document.getElementById("myChart");
                if (chartContainer) {
                  const chart = new google.visualization.PieChart(
                    chartContainer
                  );
                  chart.draw(data, options);
                } else {
                  console.error("Chart container not found in popup content.");
                }
              });
            }, 200); // Delay to ensure the DOM is updated
          });
        },
      }).addTo(map);
    })
    .catch((err) => console.error("Error loading GeoJSON:", err));
}

// Function to load GeoJSON dynamically
function loadGeoJSON(layer, url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      layer.clearLayers(); // Clear previous data
      layer.addData(data); // Add new data

      // Check if data has valid geometry for zooming
      if (layer.getBounds().isValid()) {
        map.fitBounds(layer.getBounds()); // Zoom to layer bounds
      } else {
        console.error("Loaded GeoJSON has invalid bounds.");
      }
    })
    .catch((err) => console.error("Error loading GeoJSON:", err));
}

// Load GeoJSON file
addGeoJSONWithRandomCharts("Data/Building.geojson"); // Replace with your GeoJSON file path
//loadGeoJSON(geojsonLayer1, "Data/Boundary.geojson"); // Replace with your first file path
