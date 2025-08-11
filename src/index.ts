import { MapConfig, MarkerOptions, PolylineOptions } from '../types';
import { LeafletProvider } from '../providers/leaflet';
import { MapLibreProvider } from '../providers/maplibre';

export class MapChameleon {
  private provider: any;

  constructor(config: MapConfig) {
    if (config.provider === 'leaflet') {
      this.provider = new LeafletProvider(config);
    } else if (config.provider === 'maplibre') {
      this.provider = new MapLibreProvider(config);
    } else {
      throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  addMarker(options: MarkerOptions) {
    return this.provider.addMarker(options);
  }

  addPolyline(options: PolylineOptions) {
    return this.provider.addPolyline(options);
  }

  // Add more unified methods...
}

export function createChameleon(config: MapConfig): MapChameleon {
  return new MapChameleon(config);
}

export * from '../types';
