/**
 * Performance Monitoring Utilities
 * Implements BRD requirements for performance tracking and optimization
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: number;
  category: 'loading' | 'rendering' | 'interaction' | 'network' | 'memory';
  metadata?: Record<string, any>;
}

export interface WebVitalsMetric {
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private marks: Map<string, number> = new Map();
  private onMetricCallback?: (metric: PerformanceMetric) => void;

  constructor(onMetric?: (metric: PerformanceMetric) => void) {
    this.onMetricCallback = onMetric;
    this.initialize();
  }

  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    this.setupNavigationObserver();
    this.setupResourceObserver();
    this.setupMeasureObserver();
    this.setupLongTaskObserver();
    this.setupLayoutShiftObserver();
    this.monitorMemoryUsage();
  }

  /**
   * Setup navigation timing observer
   */
  private setupNavigationObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordNavigationMetrics(navEntry);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', observer);
    } catch (error) {
      console.warn('Navigation observer not supported:', error);
    }
  }

  /**
   * Setup resource timing observer
   */
  private setupResourceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordResourceMetric(resourceEntry);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', observer);
    } catch (error) {
      console.warn('Resource observer not supported:', error);
    }
  }

  /**
   * Setup measure observer
   */
  private setupMeasureObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            this.recordMetric({
              name: entry.name,
              value: entry.duration,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'rendering',
              metadata: {
                startTime: entry.startTime,
                detail: (entry as any).detail
              }
            });
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
      this.observers.set('measure', observer);
    } catch (error) {
      console.warn('Measure observer not supported:', error);
    }
  }

  /**
   * Setup long task observer
   */
  private setupLongTaskObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.recordMetric({
              name: 'long_task',
              value: entry.duration,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'interaction',
              metadata: {
                startTime: entry.startTime,
                attribution: (entry as any).attribution
              }
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', observer);
    } catch (error) {
      console.warn('Long task observer not supported:', error);
    }
  }

  /**
   * Setup layout shift observer
   */
  private setupLayoutShiftObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      let clsEntries: PerformanceEntry[] = [];

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            clsEntries.push(entry);
          }
        });

        // Record CLS periodically
        if (clsEntries.length > 0) {
          this.recordMetric({
            name: 'cumulative_layout_shift',
            value: clsValue,
            unit: 'count',
            timestamp: Date.now(),
            category: 'rendering',
            metadata: {
              entries: clsEntries.length
            }
          });
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('layout-shift', observer);
    } catch (error) {
      console.warn('Layout shift observer not supported:', error);
    }
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    if (!('memory' in performance)) return;

    const recordMemory = () => {
      const memory = (performance as any).memory;
      
      this.recordMetric({
        name: 'memory_used',
        value: memory.usedJSHeapSize,
        unit: 'bytes',
        timestamp: Date.now(),
        category: 'memory',
        metadata: {
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        }
      });
    };

    // Record memory usage every 30 seconds
    setInterval(recordMemory, 30000);
    
    // Record initial memory usage
    recordMemory();
  }

  /**
   * Record navigation metrics
   */
  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics = [
      {
        name: 'dns_lookup',
        value: entry.domainLookupEnd - entry.domainLookupStart,
        category: 'network' as const
      },
      {
        name: 'tcp_connection',
        value: entry.connectEnd - entry.connectStart,
        category: 'network' as const
      },
      {
        name: 'request_response',
        value: entry.responseEnd - entry.requestStart,
        category: 'network' as const
      },
      {
        name: 'dom_content_loaded',
        value: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        category: 'loading' as const
      },
      {
        name: 'page_load',
        value: entry.loadEventEnd - entry.loadEventStart,
        category: 'loading' as const
      },
      {
        name: 'first_paint',
        value: entry.loadEventEnd - entry.fetchStart,
        category: 'rendering' as const
      }
    ];

    metrics.forEach(metric => {
      if (metric.value > 0) {
        this.recordMetric({
          name: metric.name,
          value: metric.value,
          unit: 'ms',
          timestamp: Date.now(),
          category: metric.category,
          metadata: {
            navigationType: entry.type,
            redirectCount: entry.redirectCount
          }
        });
      }
    });
  }

  /**
   * Record resource metric
   */
  private recordResourceMetric(entry: PerformanceResourceTiming): void {
    const resourceType = this.getResourceType(entry.name);
    
    this.recordMetric({
      name: `resource_${resourceType}`,
      value: entry.duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'network',
      metadata: {
        name: this.sanitizeUrl(entry.name),
        size: entry.transferSize,
        cached: entry.transferSize === 0,
        protocol: entry.nextHopProtocol
      }
    });
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * Sanitize URL for logging
   */
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.origin}${urlObj.pathname}`;
    } catch {
      return url.split('?')[0]; // Remove query parameters
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    if (this.onMetricCallback) {
      this.onMetricCallback(metric);
    }
  }

  /**
   * Start a performance mark
   */
  startMark(name: string): void {
    this.marks.set(name, Date.now());
    
    if (performance.mark) {
      performance.mark(`${name}_start`);
    }
  }

  /**
   * End a performance mark and record the duration
   */
  endMark(name: string, category: PerformanceMetric['category'] = 'rendering'): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`Performance mark "${name}" was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.marks.delete(name);

    if (performance.mark && performance.measure) {
      performance.mark(`${name}_end`);
      performance.measure(name, `${name}_start`, `${name}_end`);
    }

    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category,
      metadata: {
        startTime
      }
    });

    return duration;
  }

  /**
   * Measure an async operation
   */
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    category: PerformanceMetric['category'] = 'interaction'
  ): Promise<T> {
    this.startMark(name);
    
    try {
      const result = await operation();
      this.endMark(name, category);
      return result;
    } catch (error) {
      this.endMark(name, category);
      throw error;
    }
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.category === category);
  }

  /**
   * Get average metric value
   */
  getAverageMetric(name: string): number {
    const metrics = this.metrics.filter(metric => metric.name === name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): Record<string, any> {
    const categories = ['loading', 'rendering', 'interaction', 'network', 'memory'] as const;
    const summary: Record<string, any> = {};

    categories.forEach(category => {
      const categoryMetrics = this.getMetricsByCategory(category);
      summary[category] = {
        count: categoryMetrics.length,
        averageValue: categoryMetrics.length > 0 
          ? categoryMetrics.reduce((acc, m) => acc + m.value, 0) / categoryMetrics.length 
          : 0
      };
    });

    return summary;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.marks.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
