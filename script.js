// Initialize the map
var map = L.map("map").setView([47.1635, 7.2904], 16);

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
          // Generate random values for the pie chart
          const randomValues = [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
          ];

          // Ensure random values are valid
          if (!Array.isArray(randomValues) || randomValues.length === 0) {
            console.error("Invalid random values:", randomValues);
            return;
          }

          // Get building's center to position the chart
          const center = layer.getBounds().getCenter();

          // Create a pie chart using Leaflet.minichart
          const pieChart = L.minichart(center, {
            data: randomValues,
            type: "pie",
            colors: ["#ff6384", "#36a2eb", "#cc65fe"], // Pie chart colors
            width: 50, // Size of the pie chart
          });

          // Add the pie chart to the map
          map.addLayer(pieChart);
        },
      }).addTo(map);
    })
    .catch((err) => console.error("Error loading GeoJSON:", err));
}

// Load GeoJSON file
addGeoJSONWithRandomCharts("Data/Building.geojson"); // Replace with your GeoJSON file path
