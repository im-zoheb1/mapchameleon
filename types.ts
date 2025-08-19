////////////////////////////////
// Provider Types
// /////////////////////////////
export interface ProviderConfig {
  initialize(elementId: string, config?: MapConfig): void;
  createMarker(options: MarkerOptions): any;
  removeMarker(marker: any): void;
  createPolyline(options: PolylineOptions): any;
  removePolyline(polyline: any): void;
  setView(center: [number, number], zoom: number): void;
  getCenter(): [number, number];
  getZoom(): number;
}

////////////////////////////////
// Map Types
// /////////////////////////////

export interface MapConfig {
  provider: 'leaflet' | 'maplibre' | 'arcgis';
  container: string | HTMLElement;
  center: [number, number];
  zoom: number;
  style?: string | any;
}

export interface MarkerOptions {
  lat: number;
  lng: number;
  popup?: string;
  icon?: any;
}

export interface PolylineOptions {
  coordinates: [number, number][];
  color?: string;
  weight?: number;
}
