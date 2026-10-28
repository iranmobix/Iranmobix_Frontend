export function createAbortableRequest() {
  const controller = new AbortController();

  return {
    signal: controller.signal,
    abort: () => controller.abort(),
  };
}