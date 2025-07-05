import { memoize, memoize2, measureExecutionTime } from './index'
import { describe, expect, it, vi } from 'vitest'

describe('memoize', () => {
  it('should cache the result of a function and improve execution time', () => {
    const mockFn = vi.fn((n: number) => {
      const fib = (x: number): number => (x <= 1 ? x : fib(x - 1) + fib(x - 2))
      return fib(n)
    })
    const [level, expected] = [42, 267914296]

    const memoizedFn = memoize2(mockFn)
    const { time: timeWithoutMemoize } = measureExecutionTime(memoizedFn, level)
    console.log('utils/index.test.ts - [Line: 12]| timeWithoutMemoize: ', `${timeWithoutMemoize}ms`)
    const { time: timeWithMemoize } = measureExecutionTime(memoizedFn, level)
    console.log('utils/index.test.ts - [Line: 16]| timeWithMemoize: ', `${timeWithMemoize}ms`)

    expect(memoizedFn(level)).toBe(expected)
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(timeWithMemoize).toBeLessThan(timeWithoutMemoize) // Memoization improves time
  })
})

describe('measureExecutionTime', () => {
  it('should measure the execution time of a function', () => {
    const mockFn = (n: number) => {
      const sum = (x: number): number => (x <= 0 ? 0 : x + sum(x - 1))
      return sum(n)
    }
    const { result, time } = measureExecutionTime(mockFn, 10)

    expect(result).toBe(55)
    expect(time).toBeGreaterThanOrEqual(0) // Ensure time is measured
  })
})
