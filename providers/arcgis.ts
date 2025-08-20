import { ProviderConfig, MarkerOptions, PolylineOptions, MapConfig } from '../types';

declare global {
  interface Window {
    require: any;
  }
}

export class ArcGISProvider implements ProviderConfig {
  private map: any;
  private view: any;
  private markers: any[] = [];
  private polylines: any[] = [];
  private graphicsLayer: any;

  constructor(config: any) {}

  async initialize(elementId: string, config?: MapConfig): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }

    try {
      // Check if ArcGIS API is loaded
      if (typeof window.require === 'undefined') {
        throw new Error('ArcGIS Maps SDK for JavaScript not loaded. Please include the ArcGIS API script.');
      }

      // Load required ArcGIS modules
      const [Map, MapView, GraphicsLayer, Graphic, Point, Polyline, SimpleMarkerSymbol, SimpleLineSymbol] = await new Promise<any[]>((resolve, reject) => {
        window.require([
          'esri/Map',
          'esri/views/MapView',
          'esri/layers/GraphicsLayer',
          'esri/Graphic',
          'esri/geometry/Point',
          'esri/geometry/Polyline',
          'esri/symbols/SimpleMarkerSymbol',
          'esri/symbols/SimpleLineSymbol'
        ], (...modules: any[]) => {
          resolve(modules);
        }, (error: any) => {
          reject(error);
        });
      });

      // Create graphics layer for markers and polylines
      this.graphicsLayer = new GraphicsLayer();

      // Create map
      this.map = new Map({
        basemap: config?.style || 'streets-navigation-vector',
        layers: [this.graphicsLayer]
      });

      // Create map view
      this.view = new MapView({
        container: elementId,
        map: this.map,
        center: config?.center ? [config.center[1], config.center[0]] : [-0.09, 51.505], // ArcGIS uses [lng, lat]
        zoom: config?.zoom || 13
      });

      await this.view.when();
    } catch (error) {
      console.error('Failed to initialize ArcGIS map:', error);
      // Fallback to placeholder implementation
      this.initializePlaceholder(elementId, config);
    }
  }

  private initializePlaceholder(elementId: string, config?: MapConfig): void {
    console.warn('Using ArcGIS placeholder implementation. To use full ArcGIS features, include the ArcGIS Maps SDK for JavaScript.');
    console.log('ArcGIS map would be initialized here with:', {
      container: elementId,
      center: config?.center || [51.505, -0.09],
      zoom: config?.zoom || 13,
      style: config?.style || 'streets-navigation-vector'
    });
    
    this.map = {
      initialized: true,
      elementId,
      config,
      markers: [],
      polylines: []
    };
  }

  async createMarker(options: MarkerOptions): Promise<any> {
    if (!this.map) throw new Error('Map not initialized');

    try {
      if (this.view && this.graphicsLayer) {
        // Full ArcGIS implementation
        const [Graphic, Point, SimpleMarkerSymbol, PopupTemplate] = await new Promise<any[]>((resolve, reject) => {
          window.require([
            'esri/Graphic',
            'esri/geometry/Point',
            'esri/symbols/SimpleMarkerSymbol',
            'esri/PopupTemplate'
          ], (...modules: any[]) => {
            resolve(modules);
          }, (error: any) => {
            reject(error);
          });
        });

        const point = new Point({
          longitude: options.lng,
          latitude: options.lat
        });

        const symbol = new SimpleMarkerSymbol({
          color: [226, 119, 40],
          outline: {
            color: [255, 255, 255],
            width: 2
          }
        });

        const attributes = {
          name: 'Marker',
          description: options.popup || ''
        };

        const popupTemplate = options.popup ? new PopupTemplate({
          title: 'Marker',
          content: options.popup
        }) : undefined;

        const graphic = new Graphic({
          geometry: point,
          symbol: symbol,
          attributes: attributes,
          popupTemplate: popupTemplate
        });

        this.graphicsLayer.add(graphic);
        this.markers.push(graphic);
        return graphic;
      } else {
        // Fallback implementation
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
    } catch (error) {
      console.error('Failed to create marker:', error);
      // Fallback to placeholder
      const marker = {
        lat: options.lat,
        lng: options.lng,
        popup: options.popup,
        id: Date.now()
      };
      
      if (this.map.markers) {
        this.map.markers.push(marker);
      }
      console.log('ArcGIS marker would be created:', marker);
      return marker;
    }
  }

  removeMarker(marker: any): void {
    try {
      if (this.graphicsLayer && marker && typeof marker.geometry !== 'undefined') {
        // Full ArcGIS implementation
        this.graphicsLayer.remove(marker);
        const index = this.markers.indexOf(marker);
        if (index > -1) {
          this.markers.splice(index, 1);
        }
      } else if (this.map && marker) {
        // Fallback implementation
        const index = this.map.markers?.findIndex((m: any) => m.id === marker.id);
        if (index > -1) {
          this.map.markers.splice(index, 1);
          console.log('ArcGIS marker would be removed:', marker);
        }
      }
    } catch (error) {
      console.error('Failed to remove marker:', error);
    }
  }

  async createPolyline(options: PolylineOptions): Promise<any> {
    if (!this.map) throw new Error('Map not initialized');

    try {
      if (this.view && this.graphicsLayer) {
        // Full ArcGIS implementation
        const [Graphic, Polyline, SimpleLineSymbol] = await new Promise<any[]>((resolve, reject) => {
          window.require([
            'esri/Graphic',
            'esri/geometry/Polyline',
            'esri/symbols/SimpleLineSymbol'
          ], (...modules: any[]) => {
            resolve(modules);
          }, (error: any) => {
            reject(error);
          });
        });

        // Convert coordinates format - ArcGIS expects [lng, lat] arrays
        const paths = options.coordinates.map(coord => [coord[1], coord[0]]);

        const polyline = new Polyline({
          paths: [paths]
        });

        const symbol = new SimpleLineSymbol({
          color: options.color || '#3388ff',
          width: options.weight || 3
        });

        const graphic = new Graphic({
          geometry: polyline,
          symbol: symbol
        });

        this.graphicsLayer.add(graphic);
        this.polylines.push(graphic);
        return graphic;
      } else {
        // Fallback implementation
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
    } catch (error) {
      console.error('Failed to create polyline:', error);
      // Fallback to placeholder
      const polyline = {
        coordinates: options.coordinates,
        color: options.color || '#3388ff',
        weight: options.weight || 3,
        id: Date.now()
      };
      
      if (this.map.polylines) {
        this.map.polylines.push(polyline);
      }
      console.log('ArcGIS polyline would be created:', polyline);
      return polyline;
    }
  }

  removePolyline(polyline: any): void {
    try {
      if (this.graphicsLayer && polyline && typeof polyline.geometry !== 'undefined') {
        // Full ArcGIS implementation
        this.graphicsLayer.remove(polyline);
        const index = this.polylines.indexOf(polyline);
        if (index > -1) {
          this.polylines.splice(index, 1);
        }
      } else if (this.map && polyline) {
        // Fallback implementation
        const index = this.map.polylines?.findIndex((p: any) => p.id === polyline.id);
        if (index > -1) {
          this.map.polylines.splice(index, 1);
          console.log('ArcGIS polyline would be removed:', polyline);
        }
      }
    } catch (error) {
      console.error('Failed to remove polyline:', error);
    }
  }

  setView(center: [number, number], zoom: number): void {
    try {
      if (this.view) {
        // Full ArcGIS implementation - ArcGIS uses [lng, lat]
        this.view.goTo({
          center: [center[1], center[0]],
          zoom: zoom
        });
      } else if (this.map) {
        // Fallback implementation
        this.map.config = { ...this.map.config, center, zoom };
        console.log('ArcGIS map view would be set to:', { center, zoom });
      }
    } catch (error) {
      console.error('Failed to set view:', error);
    }
  }

  getCenter(): [number, number] {
    try {
      if (this.view && this.view.center) {
        // Full ArcGIS implementation - convert from [lng, lat] to [lat, lng]
        return [this.view.center.latitude, this.view.center.longitude];
      } else if (this.map && this.map.config) {
        return this.map.config.center || [51.505, -0.09];
      }
      return [51.505, -0.09];
    } catch (error) {
      console.error('Failed to get center:', error);
      return [51.505, -0.09];
    }
  }

  getZoom(): number {
    try {
      if (this.view && this.view.zoom !== undefined) {
        // Full ArcGIS implementation
        return this.view.zoom;
      } else if (this.map && this.map.config) {
        return this.map.config.zoom || 13;
      }
      return 13;
    } catch (error) {
      console.error('Failed to get zoom:', error);
      return 13;
    }
  }
}
