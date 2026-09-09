const pending = new Map<string, { promise: Promise<unknown>; controller: AbortController; users: number }>();
const cached = new Map<string, { value: unknown; expires: number }>();
export function publicJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const hit = cached.get(url);
  if (hit && hit.expires > Date.now()) return Promise.resolve(hit.value as T);
  let entry = pending.get(url);
  if (!entry) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const promise = fetch(url, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const value: unknown = await response.json();
      cached.set(url, { value, expires: Date.now() + 15000 });
      return value;
    }).finally(() => { clearTimeout(timer); pending.delete(url); });
    entry = { promise, controller, users: 0 }; pending.set(url, entry);
  }
  const current = entry; current.users++;
  return new Promise<T>((resolve, reject) => {
    let finished = false;
    const release = () => { if (finished) return; finished = true; signal?.removeEventListener('abort', abort); current.users--; };
    const abort = () => { release(); if (!current.users) current.controller.abort(); reject(new DOMException('Aborted', 'AbortError')); };
    if (signal?.aborted) return abort();
    signal?.addEventListener('abort', abort, { once: true });
    current.promise.then(value => { if (!finished) { release(); resolve(value as T); } }, error => { if (!finished) { release(); reject(error); } });
  });
}
