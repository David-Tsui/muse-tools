// Memoize a function using argument serialization as cache key
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  } as T;
}

// Measure execution time of a function
export function measureExecutionTime<T extends (...args: any[]) => any>(fn: T, ...args: Parameters<T>): { result: ReturnType<T>; time: number } {
  const start = performance.now();
  const result = fn(...args);
  const end = performance.now();
  return { result, time: end - start };
}
