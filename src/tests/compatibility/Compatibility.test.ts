import { describe, it, expect, beforeEach } from 'vitest';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { Entity } from '../../game/entities/Entity';
import { Item } from '../../game/entities/Item';
import { PerformanceMonitor } from '../../game/utils/PerformanceMonitor';
import { BrowserInfo, DeviceInfo, ResolutionInfo } from '../../game/utils/SystemInfo';

describe('Compatibility Tests', () => {
  let testData: TestDataGenerator;
  let performanceMonitor: PerformanceMonitor;
  let entities: Entity[];
  let items: Item[];

  beforeEach(() => {
    testData = new TestDataGenerator();
    performanceMonitor = new PerformanceMonitor();
    entities = Array.from({ length: 10 }, () => testData.createMockEntity());
    items = Array.from({ length: 10 }, () => testData.createMockItem());
  });

  describe('浏览器兼容性测试', () => {
    it('应该支持主流浏览器', () => {
      const browsers = [
        { name: 'Chrome', version: '120.0' },
        { name: 'Firefox', version: '120.0' },
        { name: 'Safari', version: '17.0' },
        { name: 'Edge', version: '120.0' },
      ];

      browsers.forEach(browser => {
        const info = new BrowserInfo(browser.name, browser.version);
        expect(info.isSupported()).toBe(true);
      });
    });

    it('应该正确处理WebGL支持', () => {
      const browsers = [
        { name: 'Chrome', version: '120.0', webgl: true },
        { name: 'Firefox', version: '120.0', webgl: true },
        { name: 'Safari', version: '17.0', webgl: true },
        { name: 'Edge', version: '120.0', webgl: true },
      ];

      browsers.forEach(browser => {
        const info = new BrowserInfo(browser.name, browser.version);
        expect(info.hasWebGLSupport()).toBe(browser.webgl);
      });
    });

    it('应该正确处理音频支持', () => {
      const browsers = [
        { name: 'Chrome', version: '120.0', audio: true },
        { name: 'Firefox', version: '120.0', audio: true },
        { name: 'Safari', version: '17.0', audio: true },
        { name: 'Edge', version: '120.0', audio: true },
      ];

      browsers.forEach(browser => {
        const info = new BrowserInfo(browser.name, browser.version);
        expect(info.hasAudioSupport()).toBe(browser.audio);
      });
    });
  });

  describe('设备兼容性测试', () => {
    it('应该支持不同类型的设备', () => {
      const devices = [
        { type: 'Desktop', os: 'Windows', version: '10' },
        { type: 'Desktop', os: 'MacOS', version: '14' },
        { type: 'Mobile', os: 'iOS', version: '17' },
        { type: 'Mobile', os: 'Android', version: '14' },
        { type: 'Tablet', os: 'iPadOS', version: '17' },
      ];

      devices.forEach(device => {
        const info = new DeviceInfo(device.type, device.os, device.version);
        expect(info.isSupported()).toBe(true);
      });
    });

    it('应该正确处理触摸输入', () => {
      const devices = [
        { type: 'Desktop', touch: false },
        { type: 'Mobile', touch: true },
        { type: 'Tablet', touch: true },
      ];

      devices.forEach(device => {
        const info = new DeviceInfo(device.type, 'Generic', '1.0');
        expect(info.hasTouchSupport()).toBe(device.touch);
      });
    });

    it('应该正确处理性能等级', () => {
      const devices = [
        { type: 'Desktop', performance: 'high' },
        { type: 'Mobile', performance: 'medium' },
        { type: 'Tablet', performance: 'medium' },
      ];

      devices.forEach(device => {
        const info = new DeviceInfo(device.type, 'Generic', '1.0');
        expect(info.getPerformanceTier()).toBe(device.performance);
      });
    });
  });

  describe('分辨率适配测试', () => {
    it('应该支持不同的屏幕分辨率', () => {
      const resolutions = [
        { width: 1920, height: 1080 },
        { width: 2560, height: 1440 },
        { width: 3840, height: 2160 },
        { width: 1280, height: 720 },
        { width: 375, height: 812 }, // iPhone X
      ];

      resolutions.forEach(resolution => {
        const info = new ResolutionInfo(resolution.width, resolution.height);
        expect(info.isSupported()).toBe(true);
      });
    });

    it('应该正确计算UI缩放', () => {
      const resolutions = [
        { width: 1920, height: 1080, scale: 1 },
        { width: 2560, height: 1440, scale: 1.25 },
        { width: 3840, height: 2160, scale: 2 },
        { width: 1280, height: 720, scale: 0.75 },
      ];

      resolutions.forEach(resolution => {
        const info = new ResolutionInfo(resolution.width, resolution.height);
        expect(info.getUIScale()).toBeCloseTo(resolution.scale, 2);
      });
    });

    it('应该正确处理屏幕方向', () => {
      const resolutions = [
        { width: 1920, height: 1080, orientation: 'landscape' },
        { width: 1080, height: 1920, orientation: 'portrait' },
        { width: 2560, height: 1440, orientation: 'landscape' },
        { width: 375, height: 812, orientation: 'portrait' },
      ];

      resolutions.forEach(resolution => {
        const info = new ResolutionInfo(resolution.width, resolution.height);
        expect(info.getOrientation()).toBe(resolution.orientation);
      });
    });
  });

  describe('性能适配测试', () => {
    it('应该根据设备性能调整特效质量', () => {
      const devices = [
        { type: 'Desktop', performance: 'high', effectQuality: 'high' },
        { type: 'Mobile', performance: 'medium', effectQuality: 'medium' },
        { type: 'Mobile', performance: 'low', effectQuality: 'low' },
      ];

      devices.forEach(device => {
        const info = new DeviceInfo(device.type, 'Generic', '1.0');
        expect(info.getRecommendedEffectQuality()).toBe(device.effectQuality);
      });
    });

    it('应该根据设备性能调整粒子数量', () => {
      const devices = [
        { type: 'Desktop', performance: 'high', particleCount: 1000 },
        { type: 'Mobile', performance: 'medium', particleCount: 500 },
        { type: 'Mobile', performance: 'low', particleCount: 200 },
      ];

      devices.forEach(device => {
        const info = new DeviceInfo(device.type, 'Generic', '1.0');
        expect(info.getRecommendedParticleCount()).toBe(device.particleCount);
      });
    });

    it('应该根据设备性能调整渲染距离', () => {
      const devices = [
        { type: 'Desktop', performance: 'high', renderDistance: 100 },
        { type: 'Mobile', performance: 'medium', renderDistance: 50 },
        { type: 'Mobile', performance: 'low', renderDistance: 25 },
      ];

      devices.forEach(device => {
        const info = new DeviceInfo(device.type, 'Generic', '1.0');
        expect(info.getRecommendedRenderDistance()).toBe(device.renderDistance);
      });
    });
  });
});