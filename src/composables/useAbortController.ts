export function useAbortController() {
  let abortController: AbortController = new AbortController()

  function abort() {
    if (abortController.signal.aborted)
      return
    abortController.abort()
  }

  function resetAbort() {
    abort()
    abortController = new AbortController()
  }

  function getSignal() {
    return abortController.signal
  }

  return {
    abort,
    resetAbort,
    getSignal,
  }
}
