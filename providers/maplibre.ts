import { ProviderConfig, MarkerOptions, PolylineOptions, MapConfig } from '../types';

export class MapLibreProvider implements ProviderConfig {
  private map: any;

  constructor(config: any) {}

  initialize(elementId: string, config?: MapConfig): void {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }
    
    // Initialize MapLibre map
    this.map = new (window as any).maplibregl.Map({
      container: elementId,
      style: config?.style || 'https://demotiles.maplibre.org/style.json',
      center: config?.center ? [config.center[1], config.center[0]] : [-0.09, 51.505],
      zoom: config?.zoom || 13
    });
  }

  createMarker(options: MarkerOptions): any {
    if (!this.map) throw new Error('Map not initialized');
    
    const marker = new (window as any).maplibregl.Marker()
      .setLngLat([options.lng, options.lat])
      .addTo(this.map);
    
    if (options.popup) {
      marker.setPopup(new (window as any).maplibregl.Popup().setText(options.popup));
    }
    return marker;
  }

  removeMarker(marker: any): void {
    if (marker) {
      marker.remove();
    }
  }

  createPolyline(options: PolylineOptions): any {
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

  removePolyline(polyline: any): void {
    if (this.map && polyline) {
      if (this.map.getLayer(polyline.layerId)) {
        this.map.removeLayer(polyline.layerId);
      }
      if (this.map.getSource(polyline.sourceId)) {
        this.map.removeSource(polyline.sourceId);
      }
    }
  }

  setView(center: [number, number], zoom: number): void {
    if (this.map) {
      this.map.setCenter([center[1], center[0]]);
      this.map.setZoom(zoom);
    }
  }

  getCenter(): [number, number] {
    if (!this.map) return [0, 0];
    const center = this.map.getCenter();
    return [center.lat, center.lng];
  }

  getZoom(): number {
    return this.map ? this.map.getZoom() : 0;
  }
}
