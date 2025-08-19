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
