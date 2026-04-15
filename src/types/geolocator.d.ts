declare module 'geolocator' {
  interface GeolocatorConfig {
    language?: string;
    google?: {
      version?: string;
      key?: string;
    };
  }

  interface GeolocatorOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    desiredAccuracy?: number;
    fallbackToIP?: boolean;
  }

  interface Coordinates {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
  }

  interface Address {
    city?: string;
    state?: string;
    region?: {
      name?: string;
      code?: string;
    };
    country?: {
      name?: string;
      code?: string;
    };
    countryCode?: string;
    zipCode?: string;
    street?: string;
    streetNumber?: string;
    neighborhood?: string;
  }

  interface Location {
    coords: Coordinates;
    address?: Address;
    timestamp?: number;
    city?: string;
    state?: string;
    country?: {
      name?: string;
      code?: string;
    };
    region?: {
      name?: string;
      code?: string;
    };
  }

  type LocationCallback = (err: Error | null, location?: Location) => void;

  export function config(options: GeolocatorConfig): void;
  export function locate(options: GeolocatorOptions, callback: LocationCallback): void;
  export function locateByIP(callback: LocationCallback): void;
}