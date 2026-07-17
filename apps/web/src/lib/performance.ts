import { logger } from './logger';

// Add type imports at the top
type LayoutShift = PerformanceEntry & {
  hadRecentInput: boolean;
  value: number;
};

type ResourceTiming = PerformanceEntry & {
  initiatorType: string;
};

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private readonly maxMetricsPerType = 100;

  private constructor() {
    this.setupPerformanceObserver();
    this.setupRouteChangeMonitoring();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    // Observe paint timing
    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.recordMetric(entry.name, entry.startTime, 'ms', { type: 'paint' });
      });
    });
    paintObserver.observe({ entryTypes: ['paint'] });

    // Observe layout shifts
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if ((entry as LayoutShift).hadRecentInput) return;
        const value = (entry as LayoutShift).value;
        this.recordMetric('cumulative-layout-shift', value, 'unitless', { type: 'layout-shift' });
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Observe long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.recordMetric('long-task', entry.duration, 'ms', { type: 'long-task' });
      });
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Observe resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resourceEntry = entry as ResourceTiming;
        if (resourceEntry.initiatorType === 'fetch' || resourceEntry.initiatorType === 'xmlhttprequest') {
          this.recordMetric(
            `resource-${resourceEntry.initiatorType}`,
            resourceEntry.duration,
            'ms',
            { 
              type: 'resource',
              url: resourceEntry.name,
              initiatorType: resourceEntry.initiatorType
            }
          );
        }
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
  }

  private setupRouteChangeMonitoring(): void {
    if (typeof window === 'undefined') return;

    let routeChangeStart = 0;

    window.addEventListener('popstate', () => {
      if (routeChangeStart === 0) {
        routeChangeStart = performance.now();
      }
    });

    const observer = new MutationObserver(() => {
      if (routeChangeStart > 0) {
        const duration = performance.now() - routeChangeStart;
        this.recordMetric('route-change', duration, 'ms', { type: 'navigation' });
        routeChangeStart = 0;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private recordMetric(
    name: string,
    value: number,
    unit: string,
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only the latest metrics
    if (metrics.length > this.maxMetricsPerType) {
      metrics.shift();
    }

    // Log the metric
    logger.logPerformance(name, value, { unit, ...tags });
  }

  public getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.get(name) || [];
    }

    return Array.from(this.metrics.values()).flat();
  }

  public clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  // Custom metric recording methods
  public recordCustomMetric(
    name: string,
    value: number,
    unit: string,
    tags?: Record<string, string>
  ): void {
    this.recordMetric(name, value, unit, { type: 'custom', ...tags });
  }

  public startMeasure(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'ms', { type: 'measure' });
    };
  }

  public async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'ms', { type: 'async-measure' });
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();