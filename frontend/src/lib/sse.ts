/**
 * Parse POST SSE streams from FastAPI (lines: `data: {...}\\n\\n`).
 */
export async function consumeSseJson(
  url: string,
  init: RequestInit,
  onEvent: (payload: Record<string, unknown>) => void,
): Promise<void> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Stream failed: ${res.status}`);
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const block of parts) {
      const line = block.trim();
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6);
      try {
        onEvent(JSON.parse(raw) as Record<string, unknown>);
      } catch {
        /* ignore malformed chunk */
      }
    }
  }
}
