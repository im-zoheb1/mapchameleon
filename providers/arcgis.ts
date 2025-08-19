import { ProviderConfig, MarkerOptions, PolylineOptions } from '../types';

export class ArcGISProvider implements ProviderConfig {
  constructor(config: any) {}

  createMarker(options: MarkerOptions): any {
    // ArcGIS marker implementation
  }

  removeMarker(marker: any): void {
    // Remove ArcGIS marker
  }

  createPolyline(options: PolylineOptions): any {
    // ArcGIS polyline implementation
  }

  removePolyline(polyline: any): void {
    // Remove ArcGIS polyline
  }

  setView(center: [number, number], zoom: number): void {
    // Set ArcGIS map view
  }

  getCenter(): [number, number] {
    // Get ArcGIS map center
    return [0, 0];
  }

  getZoom(): number {
    // Get ArcGIS map zoom
    return 0;
  }
}
