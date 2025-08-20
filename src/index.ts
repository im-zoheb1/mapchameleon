import { MapConfig, MarkerOptions, PolylineOptions, ProviderConfig } from '../types';
import { LeafletProvider } from '../providers/leaflet';
import { MapLibreProvider } from '../providers/maplibre';
import { ArcGISProvider } from '../providers/arcgis';

export class MapChameleon {
  private provider: ProviderConfig;
  private initializationPromise: Promise<void>;

  constructor(config: MapConfig) {
    if (config.provider === 'leaflet') {
      this.provider = new LeafletProvider(config);
    } else if (config.provider === 'maplibre') {
      this.provider = new MapLibreProvider(config);
    } else if (config.provider === 'arcgis') {
      this.provider = new ArcGISProvider(config);
    } else {
      throw new Error(`Unsupported provider: ${config.provider}`);
    }

    this.initializationPromise = this.initialize(config);
  }

  private async initialize(config: MapConfig): Promise<void> {
    await this.provider.initialize(
      typeof config.container === 'string' ? config.container : config.container.id || 'map',
      config
    );
  }

  async waitForInitialization(): Promise<void> {
    await this.initializationPromise;
  }

  addMarker(options: MarkerOptions) {
    return this.provider.createMarker(options);
  }

  removeMarker(marker: any) {
    return this.provider.removeMarker(marker);
  }

  addPolyline(options: PolylineOptions) {
    return this.provider.createPolyline(options);
  }

  removePolyline(polyline: any) {
    return this.provider.removePolyline(polyline);
  }

  setView(center: [number, number], zoom: number) {
    return this.provider.setView(center, zoom);
  }

  getCenter(): [number, number] {
    return this.provider.getCenter();
  }

  getZoom(): number {
    return this.provider.getZoom();
  }

  clear() {
    // This method would need to be implemented by tracking markers/polylines
    // For now, we'll leave it as a placeholder
  }

  destroy() {
    if (this.provider && typeof (this.provider as any).destroy === 'function') {
      (this.provider as any).destroy();
    }
  }
}

export async function createChameleon(config: MapConfig): Promise<MapChameleon> {
  const chameleon = new MapChameleon(config);
  await chameleon.waitForInitialization();
  return chameleon;
}

export function createChameleonSync(config: MapConfig): MapChameleon {
  return new MapChameleon(config);
}

export * from '../types';
