import { ref } from 'vue'

export type PromiseQueueTaskSignal = {
  aborted: boolean
}

type CancelableTask = {
  fn: (signal: PromiseQueueTaskSignal) => Promise<any>
  signal: PromiseQueueTaskSignal
  name?: string // Optional name for the task, useful for debugging
}

/**
 * A composable to manage a queue of promise-based tasks.
 * It allows you to enqueue tasks, run them in order, and handle cancellation.
 * This is useful for scenarios where you need to ensure that tasks are executed sequentially,
 * such as when making API calls or processing data that should not overlap.
 * It also provides a way to clear the queue and stop any currently running tasks.
 * @returns {Object} An object containing methods to manage the queue and its state.
 * - `enqueue(fn, name)`: Adds a new task to the queue. The task should be a function that returns a promise.
 * - `dequeue()`: Removes the first task from the queue without executing it.
 * - `run()`: Processes the queue by executing each task in order. If a task is interrupted, it stops processing further tasks.
 * - `clear()`: Clears the queue and stops any currently running tasks.
 * - `queue`: A reactive reference to the current queue of tasks.
 * - `isRunning`: A computed property that indicates whether there is a task currently being executed.
 */
export function usePromiseQueue() {
  const queue = ref<CancelableTask[]>([])
  const currentTask = ref<CancelableTask | null>(null)
  const isRunning = computed(() => currentTask.value !== null)

  async function run() {
    let wasAborted = false

    // process the queue by executing each task in order; // if a task is interrupted, stop processing further tasks
    while (queue.value.length > 0) {
      const task = queue.value.shift()
      if (!task)
        break

      try {
        currentTask.value = task
        await task.fn(task.signal)

        if (task.signal.aborted) {
          wasAborted = true
          break
        }
      } catch (err) {
        console.error(err)
        throw err
      }

      currentTask.value = null
    }

    // Reset current task after processing the queue successfully
    if (!wasAborted) {
      currentTask.value = null
    }
  }

  function enqueue(fn: (signal: { aborted: boolean }) => Promise<any>, name?: string) {
    const signal = { aborted: false }
    queue.value.push({ fn, signal, name })
  }

  function clear() {
    if (currentTask.value) {
      currentTask.value.signal.aborted = true
    }

    queue.value.forEach(task => { task.signal.aborted = true })
    queue.value.splice(0)
    currentTask.value = null
  }

  function dequeue() {
    if (queue.value.length > 0) {
      queue.value.shift()
    }
  }

  return {
    enqueue,
    dequeue,
    run,
    clear,
    queue,
    isRunning,
  }
}
