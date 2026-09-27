type DuckListener = (ducked: boolean) => void;

const listeners = new Set<DuckListener>();
let ducked = false;

/** Soften hive music while the spelling word is spoken. */
export function setMusicDucked(next: boolean): void {
  if (ducked === next) return;
  ducked = next;
  listeners.forEach((listen) => listen(next));
}

export function subscribeMusicDuck(listener: DuckListener): () => void {
  listeners.add(listener);
  listener(ducked);
  return () => {
    listeners.delete(listener);
  };
}
