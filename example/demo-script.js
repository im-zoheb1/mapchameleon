// MapChameleon Demo Script - Using actual providers from library

// Note: In a real implementation, these would be imported from the built library
// import { createChameleon } from '../dist/index.js';

// For demo purposes, we'll import from source (requires build step)
// Simulating the MapChameleon functionality with the actual provider pattern

// Demo application state
let currentProvider = null;
let currentProviderType = 'leaflet';
let markers = [];
let polylines = [];

// Simplified MapChameleon implementation for demo
class DemoMapChameleon {
  constructor(config) {
    this.config = config;
    this.provider = config.provider;
    this.markers = [];
    this.polylines = [];
    
    this.initialize();
  }

  initialize() {
    const container = document.getElementById(this.config.container);
    if (!container) {
      throw new Error(`Container with id '${this.config.container}' not found`);
    }

    container.innerHTML = '';

    try {
      if (this.provider === 'leaflet') {
        this.initLeafletMap();
      } else if (this.provider === 'maplibre') {
        this.initMapLibreMap();
      } else if (this.provider === 'arcgis') {
        this.initArcGISMap();
      } else {
        throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Map initialization failed:', error);
      throw error;
    }
  }

  initLeafletMap() {
    if (typeof L === 'undefined') {
      throw new Error('Leaflet library not loaded');
    }

    this.map = L.map(this.config.container).setView(
      this.config.center || [51.505, -0.09], 
      this.config.zoom || 13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  initMapLibreMap() {
    if (typeof maplibregl === 'undefined') {
      throw new Error('MapLibre GL library not loaded');
    }

    this.map = new maplibregl.Map({
      container: this.config.container,
      style: this.config.style || 'https://demotiles.maplibre.org/style.json',
      center: this.config.center ? [this.config.center[1], this.config.center[0]] : [-0.09, 51.505],
      zoom: this.config.zoom || 13
    });
  }

  initArcGISMap() {
    const container = document.getElementById(this.config.container);
    container.innerHTML = `
      <div style="
        height: 100%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        background: #f0f0f0; 
        border: 2px dashed #ccc;
        font-family: Arial, sans-serif;
        color: #666;
      ">
        <div style="text-align: center;">
          <h3>🗺️ ArcGIS Map Placeholder</h3>
          <p>ArcGIS requires proper SDK setup</p>
          <p>Center: [${this.config.center?.[0] || 51.505}, ${this.config.center?.[1] || -0.09}]</p>
          <p>Zoom: ${this.config.zoom || 13}</p>
        </div>
      </div>
    `;
    
    this.map = {
      initialized: true,
      config: this.config,
      markers: [],
      polylines: []
    };
  }

  addMarker(options) {
    let marker;

    if (this.provider === 'leaflet') {
      marker = L.marker([options.lat, options.lng]).addTo(this.map);
      if (options.popup) {
        marker.bindPopup(options.popup);
      }
    } else if (this.provider === 'maplibre') {
      marker = new maplibregl.Marker()
        .setLngLat([options.lng, options.lat])
        .addTo(this.map);
      if (options.popup) {
        marker.setPopup(new maplibregl.Popup().setText(options.popup));
      }
    } else if (this.provider === 'arcgis') {
      marker = {
        lat: options.lat,
        lng: options.lng,
        popup: options.popup,
        id: Date.now()
      };
      this.map.markers.push(marker);
      console.log('ArcGIS marker would be created:', marker);
    }

    this.markers.push(marker);
    return marker;
  }

  addPolyline(options) {
    let polyline;

    if (this.provider === 'leaflet') {
      polyline = L.polyline(options.coordinates, {
        color: options.color || '#3388ff',
        weight: options.weight || 3
      }).addTo(this.map);
    } else if (this.provider === 'maplibre') {
      const sourceId = `polyline-${Date.now()}`;
      const layerId = `polyline-layer-${Date.now()}`;
      
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: options.coordinates.map(coord => [coord[1], coord[0]])
          },
          properties: {}
        }
      });
      
      this.map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': options.color || '#3388ff',
          'line-width': options.weight || 3
        }
      });
      
      polyline = { sourceId, layerId };
    } else if (this.provider === 'arcgis') {
      polyline = {
        coordinates: options.coordinates,
        color: options.color || '#3388ff',
        weight: options.weight || 3,
        id: Date.now()
      };
      this.map.polylines.push(polyline);
      console.log('ArcGIS polyline would be created:', polyline);
    }

    this.polylines.push(polyline);
    return polyline;
  }

  clear() {
    this.markers.forEach(marker => {
      if (this.provider === 'leaflet') {
        this.map.removeLayer(marker);
      } else if (this.provider === 'maplibre') {
        marker.remove();
      }
    });

    this.polylines.forEach(polyline => {
      if (this.provider === 'leaflet') {
        this.map.removeLayer(polyline);
      } else if (this.provider === 'maplibre' && polyline.layerId) {
        if (this.map.getLayer(polyline.layerId)) {
          this.map.removeLayer(polyline.layerId);
        }
        if (this.map.getSource(polyline.sourceId)) {
          this.map.removeSource(polyline.sourceId);
        }
      }
    });

    this.markers = [];
    this.polylines = [];

    if (this.provider === 'arcgis') {
      this.map.markers = [];
      this.map.polylines = [];
    }
  }
}

// Factory function mimicking createChameleon
function createChameleon(config) {
  return new DemoMapChameleon(config);
}

// Initialize map with selected provider
function initializeMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found');
    return;
  }

  // Clear existing map
  markers = [];
  polylines = [];

  try {
    // Create new MapChameleon instance using the provider pattern
    currentProvider = createChameleon({
      provider: currentProviderType,
      container: 'map',
      center: [51.505, -0.09],
      zoom: 13
    });

    updateUI();
    console.log(`${currentProviderType} provider initialized successfully`);
  } catch (error) {
    console.error('Failed to initialize map:', error);
    mapContainer.innerHTML = `
      <div style="
        height: 100%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        background: #ffebee; 
        color: #c62828;
        font-family: Arial, sans-serif;
      ">
        <div>Error: ${error.message}</div>
      </div>
    `;
  }
}

// Add a random marker
function addRandomMarker() {
  if (!currentProvider) return;

  const lat = 51.505 + (Math.random() - 0.5) * 0.02;
  const lng = -0.09 + (Math.random() - 0.5) * 0.02;
  
  const marker = currentProvider.addMarker({
    lat: lat,
    lng: lng,
    popup: `Random Marker #${markers.length + 1}`
  });

  markers.push(marker);
  updateUI();
}

// Add a sample polyline
function addPolyline() {
  if (!currentProvider) return;

  const coordinates = [
    [51.505, -0.09],
    [51.51, -0.1],
    [51.52, -0.08],
    [51.515, -0.075]
  ];
  
  const polyline = currentProvider.addPolyline({
    coordinates: coordinates,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    weight: 3
  });

  polylines.push(polyline);
  updateUI();
}

// Clear all markers and polylines
function clearMap() {
  if (!currentProvider) return;

  currentProvider.clear();
  
  markers = [];
  polylines = [];
  updateUI();
}

// Switch to different provider
function switchProvider() {
  const providers = ['leaflet', 'maplibre', 'arcgis'];
  const currentIndex = providers.indexOf(currentProviderType);
  const nextIndex = (currentIndex + 1) % providers.length;
  
  currentProviderType = providers[nextIndex];
  
  // Update radio button
  const radio = document.querySelector(`input[value="${currentProviderType}"]`);
  if (radio) radio.checked = true;
  
  initializeMap();
}

// Update UI elements
function updateUI() {
  const providerElement = document.getElementById('current-provider');
  const markerCountElement = document.getElementById('marker-count');
  const polylineCountElement = document.getElementById('polyline-count');

  if (providerElement) {
    providerElement.textContent = currentProviderType.charAt(0).toUpperCase() + currentProviderType.slice(1);
  }
  if (markerCountElement) {
    markerCountElement.textContent = markers.length;
  }
  if (polylineCountElement) {
    polylineCountElement.textContent = polylines.length;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initialize map on page load
  initializeMap();

  // Button event listeners
  const addMarkerBtn = document.getElementById('add-marker');
  const addPolylineBtn = document.getElementById('add-polyline');
  const clearMapBtn = document.getElementById('clear-map');
  const switchProviderBtn = document.getElementById('switch-provider');

  if (addMarkerBtn) addMarkerBtn.addEventListener('click', addRandomMarker);
  if (addPolylineBtn) addPolylineBtn.addEventListener('click', addPolyline);
  if (clearMapBtn) clearMapBtn.addEventListener('click', clearMap);
  if (switchProviderBtn) switchProviderBtn.addEventListener('click', switchProvider);

  // Provider radio button listeners
  document.querySelectorAll('input[name="provider"]').forEach(radio => {
    radio.addEventListener('change', function(e) {
      currentProviderType = e.target.value;
      initializeMap();
    });
  });

  console.log('MapChameleon demo initialized');
});