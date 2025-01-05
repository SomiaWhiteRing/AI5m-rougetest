export type BrowserName = 'Chrome' | 'Firefox' | 'Safari' | 'Edge';
export type DeviceType = 'Desktop' | 'Mobile' | 'Tablet';
export type OSType = 'Windows' | 'MacOS' | 'iOS' | 'Android' | 'iPadOS' | 'Generic';
export type PerformanceTier = 'high' | 'medium' | 'low';
export type EffectQuality = 'high' | 'medium' | 'low';
export type ScreenOrientation = 'landscape' | 'portrait';

export class BrowserInfo {
  constructor(
    private name: BrowserName,
    private version: string
  ) {}

  isSupported(): boolean {
    const minVersions: Record<BrowserName, string> = {
      Chrome: '90.0',
      Firefox: '90.0',
      Safari: '14.0',
      Edge: '90.0',
    };
    return this.version >= minVersions[this.name];
  }

  hasWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  hasAudioSupport(): boolean {
    return typeof window.AudioContext !== 'undefined' ||
           typeof (window as any).webkitAudioContext !== 'undefined';
  }
}

export class DeviceInfo {
  constructor(
    private type: DeviceType,
    private os: OSType,
    private version: string
  ) {}

  isSupported(): boolean {
    const minVersions: Record<OSType, string> = {
      Windows: '10',
      MacOS: '10.15',
      iOS: '13.0',
      Android: '8.0',
      iPadOS: '13.0',
      Generic: '1.0',
    };
    return this.version >= minVersions[this.os];
  }

  hasTouchSupport(): boolean {
    return this.type === 'Mobile' || this.type === 'Tablet';
  }

  getPerformanceTier(): PerformanceTier {
    switch (this.type) {
      case 'Desktop':
        return 'high';
      case 'Tablet':
        return 'medium';
      case 'Mobile':
        return this.os === 'iOS' ? 'medium' : 'low';
      default:
        return 'low';
    }
  }

  getRecommendedEffectQuality(): EffectQuality {
    switch (this.getPerformanceTier()) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  getRecommendedParticleCount(): number {
    switch (this.getPerformanceTier()) {
      case 'high':
        return 1000;
      case 'medium':
        return 500;
      default:
        return 200;
    }
  }

  getRecommendedRenderDistance(): number {
    switch (this.getPerformanceTier()) {
      case 'high':
        return 100;
      case 'medium':
        return 50;
      default:
        return 25;
    }
  }
}

export class ResolutionInfo {
  constructor(
    private width: number,
    private height: number
  ) {}

  isSupported(): boolean {
    const minWidth = 320;
    const minHeight = 480;
    return this.width >= minWidth && this.height >= minHeight;
  }

  getUIScale(): number {
    const baseWidth = 1920;
    const baseHeight = 1080;
    const widthScale = this.width / baseWidth;
    const heightScale = this.height / baseHeight;
    return Math.min(widthScale, heightScale);
  }

  getOrientation(): ScreenOrientation {
    return this.width > this.height ? 'landscape' : 'portrait';
  }

  getAspectRatio(): number {
    return this.width / this.height;
  }

  getPixelDensity(): number {
    return window.devicePixelRatio || 1;
  }

  getEffectiveResolution(): { width: number; height: number } {
    const scale = this.getPixelDensity();
    return {
      width: this.width * scale,
      height: this.height * scale,
    };
  }
}