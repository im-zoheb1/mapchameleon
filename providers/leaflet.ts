import { ProviderConfig, MarkerOptions, PolylineOptions, MapConfig } from '../types';

export class LeafletProvider implements ProviderConfig {
  private map: any;

  constructor(config: any) {}

  initialize(elementId: string, config?: MapConfig): void {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }

    // Destroy existing map if already initialized
    if (this.map) {
      this.destroy();
    }

    // Clear the container to prevent reinitialization errors
    element.innerHTML = '';
    
    // Initialize Leaflet map
    this.map = (window as any).L.map(elementId).setView(config?.center || [51.505, -0.09], config?.zoom || 13);
    
    // Add default tile layer
    (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  createMarker(options: MarkerOptions): any {
    if (!this.map) throw new Error('Map not initialized');
    
    const marker = (window as any).L.marker([options.lat, options.lng]).addTo(this.map);
    if (options.popup) {
      marker.bindPopup(options.popup);
    }
    return marker;
  }

  removeMarker(marker: any): void {
    if (this.map && marker) {
      this.map.removeLayer(marker);
    }
  }

  createPolyline(options: PolylineOptions): any {
    if (!this.map) throw new Error('Map not initialized');
    
    const polyline = (window as any).L.polyline(options.coordinates, {
      color: options.color || '#3388ff',
      weight: options.weight || 3
    }).addTo(this.map);
    return polyline;
  }

  removePolyline(polyline: any): void {
    if (this.map && polyline) {
      this.map.removeLayer(polyline);
    }
  }

  setView(center: [number, number], zoom: number): void {
    if (this.map) {
      this.map.setView(center, zoom);
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

  destroy(): void {
    if (this.map) {
      try {
        // Remove the map and clean up all layers and event listeners
        this.map.remove();
        this.map = null;
      } catch (error) {
        console.error('Failed to destroy Leaflet map:', error);
      }
    }
  }
}
