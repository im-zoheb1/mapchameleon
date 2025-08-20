// MapChameleon Demo Script - Shows actual provider initialization

// Import provider classes (this would be from the built library)
// For demo purposes, we'll define them inline

// Simplified provider classes for demo
class LeafletProvider {
  constructor(config) {
    this.config = config;
    this.map = null;
  }

  initialize(elementId, config) {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }
    
    // Initialize Leaflet map
    this.map = L.map(elementId).setView(config?.center || [51.505, -0.09], config?.zoom || 13);
    
    // Add default tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    console.log('Leaflet map initialized successfully');
  }

  createMarker(options) {
    if (!this.map) throw new Error('Map not initialized');
    
    const marker = L.marker([options.lat, options.lng]).addTo(this.map);
    if (options.popup) {
      marker.bindPopup(options.popup);
    }
    return marker;
  }

  removeMarker(marker) {
    if (this.map && marker) {
      this.map.removeLayer(marker);
    }
  }

  createPolyline(options) {
    if (!this.map) throw new Error('Map not initialized');
    
    const polyline = L.polyline(options.coordinates, {
      color: options.color || '#3388ff',
      weight: options.weight || 3
    }).addTo(this.map);
    return polyline;
  }

  removePolyline(polyline) {
    if (this.map && polyline) {
      this.map.removeLayer(polyline);
    }
  }

  setView(center, zoom) {
    if (this.map) {
      this.map.setView(center, zoom);
    }
  }

  getCenter() {
    if (!this.map) return [0, 0];
    const center = this.map.getCenter();
    return [center.lat, center.lng];
  }

  getZoom() {
    return this.map ? this.map.getZoom() : 0;
  }
}

class MapLibreProvider {
  constructor(config) {
    this.config = config;
    this.map = null;
  }

  initialize(elementId, config) {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }
    
    // Initialize MapLibre map
    this.map = new maplibregl.Map({
      container: elementId,
      style: config?.style || 'https://demotiles.maplibre.org/style.json',
      center: config?.center ? [config.center[1], config.center[0]] : [-0.09, 51.505],
      zoom: config?.zoom || 13
    });
    
    console.log('MapLibre map initialized successfully');
  }

  createMarker(options) {
    if (!this.map) throw new Error('Map not initialized');
    
    const marker = new maplibregl.Marker()
      .setLngLat([options.lng, options.lat])
      .addTo(this.map);
    
    if (options.popup) {
      marker.setPopup(new maplibregl.Popup().setText(options.popup));
    }
    return marker;
  }

  removeMarker(marker) {
    if (marker) {
      marker.remove();
    }
  }

  createPolyline(options) {
    if (!this.map) throw new Error('Map not initialized');
    
    // Convert coordinates to GeoJSON format
    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: options.coordinates.map(coord => [coord[1], coord[0]])
      },
      properties: {}
    };
    
    const sourceId = `polyline-${Date.now()}`;
    const layerId = `polyline-layer-${Date.now()}`;
    
    this.map.addSource(sourceId, {
      type: 'geojson',
      data: geojson
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
    
    return { sourceId, layerId };
  }

  removePolyline(polyline) {
    if (this.map && polyline) {
      if (this.map.getLayer(polyline.layerId)) {
        this.map.removeLayer(polyline.layerId);
      }
      if (this.map.getSource(polyline.sourceId)) {
        this.map.removeSource(polyline.sourceId);
      }
    }
  }

  setView(center, zoom) {
    if (this.map) {
      this.map.setCenter([center[1], center[0]]);
      this.map.setZoom(zoom);
    }
  }

  getCenter() {
    if (!this.map) return [0, 0];
    const center = this.map.getCenter();
    return [center.lat, center.lng];
  }

  getZoom() {
    return this.map ? this.map.getZoom() : 0;
  }
}

class ArcGISProvider {
  constructor(config) {
    this.config = config;
    this.map = null;
  }

  initialize(elementId, config) {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }
    
    // For demo purposes, show placeholder
    element.innerHTML = `
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
          <p>Center: [${config?.center?.[0] || 51.505}, ${config?.center?.[1] || -0.09}]</p>
          <p>Zoom: ${config?.zoom || 13}</p>
        </div>
      </div>
    `;
    
    // Placeholder map object
    this.map = {
      initialized: true,
      elementId,
      config,
      markers: [],
      polylines: []
    };
    
    console.log('ArcGIS map placeholder initialized');
  }

  createMarker(options) {
    if (!this.map) throw new Error('Map not initialized');
    
    const marker = {
      lat: options.lat,
      lng: options.lng,
      popup: options.popup,
      id: Date.now()
    };
    
    this.map.markers.push(marker);
    console.log('ArcGIS marker would be created:', marker);
    return marker;
  }

  removeMarker(marker) {
    if (this.map && marker) {
      const index = this.map.markers.findIndex(m => m.id === marker.id);
      if (index > -1) {
        this.map.markers.splice(index, 1);
        console.log('ArcGIS marker removed:', marker);
      }
    }
  }

  createPolyline(options) {
    if (!this.map) throw new Error('Map not initialized');
    
    const polyline = {
      coordinates: options.coordinates,
      color: options.color || '#3388ff',
      weight: options.weight || 3,
      id: Date.now()
    };
    
    this.map.polylines.push(polyline);
    console.log('ArcGIS polyline would be created:', polyline);
    return polyline;
  }

  removePolyline(polyline) {
    if (this.map && polyline) {
      const index = this.map.polylines.findIndex(p => p.id === polyline.id);
      if (index > -1) {
        this.map.polylines.splice(index, 1);
        console.log('ArcGIS polyline removed:', polyline);
      }
    }
  }

  setView(center, zoom) {
    if (this.map) {
      this.map.config = { ...this.map.config, center, zoom };
      console.log('ArcGIS map view set to:', { center, zoom });
    }
  }

  getCenter() {
    if (!this.map || !this.map.config) return [0, 0];
    return this.map.config.center || [51.505, -0.09];
  }

  getZoom() {
    if (!this.map || !this.map.config) return 13;
    return this.map.config.zoom || 13;
  }
}

// Demo application state
let currentProvider = null;
let currentProviderType = 'leaflet';
let markers = [];
let polylines = [];

// Provider factory
function createProvider(type, config) {
  switch (type) {
    case 'leaflet':
      return new LeafletProvider(config);
    case 'maplibre':
      return new MapLibreProvider(config);
    case 'arcgis':
      return new ArcGISProvider(config);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

// Initialize map with selected provider
function initializeMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found');
    return;
  }

  // Clear existing map
  mapContainer.innerHTML = '';
  markers = [];
  polylines = [];

  try {
    // Create new provider instance
    currentProvider = createProvider(currentProviderType);
    
    // Initialize the map
    currentProvider.initialize('map', {
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
  
  const marker = currentProvider.createMarker({
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
  
  const polyline = currentProvider.createPolyline({
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

  markers.forEach(marker => currentProvider.removeMarker(marker));
  polylines.forEach(polyline => currentProvider.removePolyline(polyline));
  
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