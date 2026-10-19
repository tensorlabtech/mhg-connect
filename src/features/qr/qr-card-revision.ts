/** JavaScript transports milliseconds; always advance the revision, even within one millisecond. */
export function nextCardRevision(previous: Date, now = Date.now()) {
  return new Date(Math.max(now, previous.getTime() + 1));
}
