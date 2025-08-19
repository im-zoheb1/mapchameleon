/**
 * MapChameleon Example Script
 * Demonstrates the usage of MapChameleon library with both Leaflet and MapLibre providers
 */

// Global state
let currentMap = null;
let markerCount = 0;
let polylineCount = 0;
let currentProvider = "leaflet";

// Configuration
const DEFAULT_CONFIG = {
  center: [51.505, -0.09], // London coordinates
  zoom: 13,
  container: "map",
};

// Sample locations for demo
const DEMO_LOCATIONS = [
  { lat: 51.505, lng: -0.09, name: "London Eye" },
  { lat: 51.515, lng: -0.1, name: "Oxford Street" },
  { lat: 51.52, lng: -0.08, name: "British Museum" },
  { lat: 51.495, lng: -0.07, name: "Westminster Bridge" },
  { lat: 51.508, lng: -0.128, name: "Buckingham Palace" },
];

// Demo polyline routes
const DEMO_ROUTES = [
  {
    name: "Thames Walk",
    coordinates: [
      [51.505, -0.09],
      [51.51, -0.1],
      [51.52, -0.08],
      [51.515, -0.075],
    ],
    color: "#e74c3c",
  },
  {
    name: "Park Route",
    coordinates: [
      [51.508, -0.128],
      [51.512, -0.125],
      [51.515, -0.122],
      [51.518, -0.119],
    ],
    color: "#2ecc71",
  },
];

/**
 * Mock MapChameleon implementation for demonstration
 * Replace this with actual MapChameleon import when the library is built
 */
class MockMapChameleon {
  constructor(config) {
    this.config = config;
    this.provider = config.provider;
    this.markers = [];
    this.polylines = [];
    this.initMap();
  }

  /**
   * Initialize the map based on the selected provider
   */
  initMap() {
    const container = document.getElementById(this.config.container);
    if (!container) {
      throw new Error(`Container with id '${this.config.container}' not found`);
    }

    // Clear existing map
    container.innerHTML = "";

    try {
      if (this.provider === "leaflet") {
        this.initLeafletMap();
      } else if (this.provider === "maplibre") {
        this.initMapLibreMap();
      } else {
        throw new Error(`Unsupported provider: ${this.provider}`);
      }

      showNotification(
        `${this.provider.charAt(0).toUpperCase() + this.provider.slice(1)} map initialized successfully`,
        "success",
      );
    } catch (error) {
      console.error("Map initialization failed:", error);
      showNotification(
        `Failed to initialize ${this.provider} map: ${error.message}`,
        "error",
      );
    }
  }

  /**
   * Initialize Leaflet map
   */
  initLeafletMap() {
    if (typeof L === "undefined") {
      throw new Error("Leaflet library not loaded");
    }

    this.map = L.map(this.config.container).setView(
      this.config.center,
      this.config.zoom,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Add map event listeners
    this.map.on("click", (e) => {
      console.log("Map clicked at:", e.latlng);
    });
  }

  /**
   * Initialize MapLibre map
   */
  initMapLibreMap() {
    if (typeof maplibregl === "undefined") {
      throw new Error("MapLibre GL library not loaded");
    }

    this.map = new maplibregl.Map({
      container: this.config.container,
      style: "https://demotiles.maplibre.org/style.json",
      center: [this.config.center[1], this.config.center[0]], // MapLibre uses [lng, lat]
      zoom: this.config.zoom,
    });

    // Add map event listeners
    this.map.on("click", (e) => {
      console.log("Map clicked at:", e.lngLat);
    });

    this.map.on("load", () => {
      console.log("MapLibre map loaded");
    });
  }

  /**
   * Add a marker to the map
   */
  addMarker(options) {
    try {
      let marker;

      if (this.provider === "leaflet") {
        marker = L.marker([options.lat, options.lng]).addTo(this.map);
        if (options.popup) {
          marker.bindPopup(options.popup).openPopup();
        }
      } else if (this.provider === "maplibre") {
        marker = new maplibregl.Marker({ color: options.color || "#3498db" })
          .setLngLat([options.lng, options.lat])
          .addTo(this.map);

        if (options.popup) {
          marker.setPopup(
            new maplibregl.Popup({ offset: 25 }).setText(options.popup),
          );
        }
      }

      this.markers.push(marker);
      return marker;
    } catch (error) {
      console.error("Failed to add marker:", error);
      showNotification("Failed to add marker", "error");
      return null;
    }
  }

  /**
   * Add a polyline to the map
   */
  addPolyline(options) {
    try {
      let polyline;

      if (this.provider === "leaflet") {
        polyline = L.polyline(options.coordinates, {
          color: options.color || "#3388ff",
          weight: options.weight || 3,
          opacity: options.opacity || 0.8,
        }).addTo(this.map);

        if (options.popup) {
          polyline.bindPopup(options.popup);
        }
      } else if (this.provider === "maplibre") {
        // For MapLibre, we need to add the polyline as a source and layer
        const id = `polyline-${Date.now()}`;

        this.map.addSource(id, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: options.coordinates.map((coord) => [
                coord[1],
                coord[0],
              ]), // Convert to [lng, lat]
            },
          },
        });

        this.map.addLayer({
          id: id,
          type: "line",
          source: id,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": options.color || "#3388ff",
            "line-width": options.weight || 3,
            "line-opacity": options.opacity || 0.8,
          },
        });

        polyline = { id, type: "maplibre-polyline" };
      }

      this.polylines.push(polyline);
      return polyline;
    } catch (error) {
      console.error("Failed to add polyline:", error);
      showNotification("Failed to add polyline", "error");
      return null;
    }
  }

  /**
   * Clear all markers and polylines from the map
   */
  clear() {
    try {
      // Clear markers
      this.markers.forEach((marker) => {
        if (this.provider === "leaflet") {
          this.map.removeLayer(marker);
        } else if (this.provider === "maplibre") {
          marker.remove();
        }
      });

      // Clear polylines
      this.polylines.forEach((polyline) => {
        if (this.provider === "leaflet") {
          this.map.removeLayer(polyline);
        } else if (this.provider === "maplibre" && polyline.id) {
          if (this.map.getLayer(polyline.id)) {
            this.map.removeLayer(polyline.id);
          }
          if (this.map.getSource(polyline.id)) {
            this.map.removeSource(polyline.id);
          }
        }
      });

      this.markers = [];
      this.polylines = [];

      showNotification("Map cleared successfully", "success");
    } catch (error) {
      console.error("Failed to clear map:", error);
      showNotification("Failed to clear map", "error");
    }
  }

  /**
   * Get current map bounds
   */
  getBounds() {
    if (this.provider === "leaflet") {
      return this.map.getBounds();
    } else if (this.provider === "maplibre") {
      return this.map.getBounds();
    }
  }

  /**
   * Fit map to show all markers
   */
  fitToMarkers() {
    if (this.markers.length === 0) return;

    try {
      if (this.provider === "leaflet") {
        const group = new L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1));
      } else if (this.provider === "maplibre") {
        // Calculate bounds for MapLibre
        let bounds = new maplibregl.LngLatBounds();
        this.markers.forEach((marker) => {
          bounds.extend(marker.getLngLat());
        });
        this.map.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error("Failed to fit to markers:", error);
    }
  }
}

/**
 * Factory function to create MapChameleon instance
 */
function createChameleon(config) {
  return new MockMapChameleon(config);
}

/**
 * Initialize the map with current provider
 */
function initMap() {
  try {
    if (currentMap) {
      currentMap.clear();
    }

    currentMap = createChameleon({
      provider: currentProvider,
      container: DEFAULT_CONFIG.container,
      center: DEFAULT_CONFIG.center,
      zoom: DEFAULT_CONFIG.zoom,
    });

    // Reset counters
    markerCount = 0;
    polylineCount = 0;

    updateUI();
  } catch (error) {
    console.error("Map initialization failed:", error);
    showNotification("Failed to initialize map", "error");
  }
}

/**
 * Add a random marker to the map
 */
function addRandomMarker() {
  if (!currentMap) return;

  const location =
    DEMO_LOCATIONS[Math.floor(Math.random() * DEMO_LOCATIONS.length)];
  const jitter = 0.01; // Add some randomness to position

  const marker = currentMap.addMarker({
    lat: location.lat + (Math.random() - 0.5) * jitter,
    lng: location.lng + (Math.random() - 0.5) * jitter,
    popup: `${location.name} - Marker #${markerCount + 1}`,
    color: getRandomColor(),
  });

  if (marker) {
    markerCount++;
    updateUI();
  }
}

/**
 * Add a predefined polyline route
 */
function addPolyline() {
  if (!currentMap) return;

  const route = DEMO_ROUTES[polylineCount % DEMO_ROUTES.length];

  const polyline = currentMap.addPolyline({
    coordinates: route.coordinates,
    color: route.color,
    weight: 4,
    opacity: 0.8,
    popup: `${route.name} - Route #${polylineCount + 1}`,
  });

  if (polyline) {
    polylineCount++;
    updateUI();
  }
}

/**
 * Clear all markers and polylines
 */
function clearMap() {
  if (!currentMap) return;

  currentMap.clear();
  markerCount = 0;
  polylineCount = 0;
  updateUI();
}

/**
 * Switch between map providers
 */
function switchProvider() {
  const newProvider = currentProvider === "leaflet" ? "maplibre" : "leaflet";
  setProvider(newProvider);
}

/**
 * Set the map provider
 */
function setProvider(provider) {
  if (provider === currentProvider) return;

  currentProvider = provider;

  // Update radio button
  const radio = document.querySelector(`input[value="${provider}"]`);
  if (radio) radio.checked = true;

  // Reinitialize map
  initMap();
}

/**
 * Fit map to show all markers
 */
function fitToMarkers() {
  if (!currentMap || markerCount === 0) {
    showNotification("No markers to fit to", "error");
    return;
  }

  currentMap.fitToMarkers();
  showNotification("Map fitted to markers", "success");
}

/**
 * Update the UI with current state
 */
function updateUI() {
  const elements = {
    provider: document.getElementById("current-provider"),
    markers: document.getElementById("marker-count"),
    polylines: document.getElementById("polyline-count"),
  };

  if (elements.provider) {
    elements.provider.textContent =
      currentProvider.charAt(0).toUpperCase() + currentProvider.slice(1);
  }

  if (elements.markers) {
    elements.markers.textContent = markerCount;
  }

  if (elements.polylines) {
    elements.polylines.textContent = polylineCount;
  }
}

/**
 * Get a random color for markers/polylines
 */
function getRandomColor() {
  const colors = [
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Show notification to user
 */
function showNotification(message, type = "info") {
  // Remove existing notification
  const existing = document.querySelector(".notification");
  if (existing) {
    existing.remove();
  }

  // Create new notification
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => notification.classList.add("show"), 100);

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Generate code example based on current state
 */
function updateCodeExample() {
  const codeExample = document.getElementById("code-example");
  if (!codeExample) return;

  const code = `// Import MapChameleon
import { createChameleon } from 'mapchameleon';

// Create a map instance with ${currentProvider.charAt(0).toUpperCase() + currentProvider.slice(1)}
const map = createChameleon({
    provider: '${currentProvider}',
    container: 'map',
    center: [${DEFAULT_CONFIG.center.join(", ")}],
    zoom: ${DEFAULT_CONFIG.zoom}
});

// Add a marker
map.addMarker({
    lat: ${DEFAULT_CONFIG.center[0]},
    lng: ${DEFAULT_CONFIG.center[1]},
    popup: 'Hello from MapChameleon!'
});

// Add a polyline
map.addPolyline({
    coordinates: [
        [${DEFAULT_CONFIG.center[0]}, ${DEFAULT_CONFIG.center[1]}],
        [${DEFAULT_CONFIG.center[0] + 0.01}, ${DEFAULT_CONFIG.center[1] + 0.01}],
        [${DEFAULT_CONFIG.center[0] + 0.02}, ${DEFAULT_CONFIG.center[1] - 0.01}]
    ],
    color: '#ff0000',
    weight: 3
});

// Clear the map
map.clear();`;

  codeExample.textContent = code;
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
  // Provider radio buttons
  document.querySelectorAll('input[name="provider"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      setProvider(e.target.value);
    });
  });

  // Button event listeners
  const buttons = {
    "add-marker": addRandomMarker,
    "add-polyline": addPolyline,
    "clear-map": clearMap,
    "switch-provider": switchProvider,
    "fit-markers": fitToMarkers,
  };

  Object.entries(buttons).forEach(([id, handler]) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener("click", handler);
    }
  });
}

/**
 * Initialize the application
 */
function init() {
  console.log("MapChameleon Example initializing...");

  // Check for required libraries
  const requiredLibs = {
    Leaflet: typeof L !== "undefined",
    "MapLibre GL": typeof maplibregl !== "undefined",
  };

  console.log("Library availability:", requiredLibs);

  // Initialize event listeners
  initEventListeners();

  // Initialize map
  initMap();

  // Update code example
  updateCodeExample();

  // Show welcome message
  setTimeout(() => {
    showNotification(
      "MapChameleon example loaded! Try adding markers and switching providers.",
      "success",
    );
  }, 1000);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Export functions for global access (for HTML onclick handlers)
window.MapChameleonDemo = {
  addRandomMarker,
  addPolyline,
  clearMap,
  switchProvider,
  fitToMarkers,
  setProvider,
};
