import { describe, it, expect, vi } from 'vitest'
import { usePromiseQueue } from '@/composables/usePromiseQueue'

describe('usePromiseQueue', () => {
  it('should enqueue and run tasks sequentially', async () => {
    const queue = usePromiseQueue()
    const results: number[] = []

    queue.enqueue(async () => { results.push(1) })
    queue.enqueue(async () => { results.push(2) })
    await queue.run()

    expect(results).toEqual([1, 2])
  })

  it('should interrupt running task when clear is called', async () => {
    const queue = usePromiseQueue()
    let wasAborted = false

    queue.enqueue(async (signal) => {
      for (let i = 0; i < 5; i++) {
        if (signal.aborted) {
          wasAborted = true
          break
        }
        await new Promise(res => setTimeout(res, 50))
      }
    })
    setTimeout(() => queue.clear(), 15)
    await queue.run()

    expect(wasAborted).toBe(true)
  })

  it('should clear all queued tasks', async () => {
    const queue = usePromiseQueue()
    let called = false

    queue.enqueue(async () => { called = true })
    queue.clear()
    await queue.run()

    expect(called).toBe(false)
    expect(queue.queue.value.length).toBe(0)
  })

  it('should set isRunning correctly', async () => {
    const queue = usePromiseQueue()
    expect(queue.isRunning.value).toBe(false)

    queue.enqueue(async () => { await new Promise(res => setTimeout(res, 100)) })
    const runPromise = queue.run()
    expect(queue.isRunning.value).toBe(true)
    await runPromise
    expect(queue.isRunning.value).toBe(false)
  })
})
