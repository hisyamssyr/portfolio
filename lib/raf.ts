type Frame = (time: number) => void;

const frames = new Map<number, Frame>();
let nextId = 1;
let running = false;

function tick(time: number) {
  for (const frame of frames.values()) frame(time);
  if (frames.size > 0) {
    requestAnimationFrame(tick);
  } else {
    running = false;
  }
}

export function onFrame(frame: Frame): () => void {
  const id = nextId++;
  frames.set(id, frame);
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
  return () => {
    frames.delete(id);
  };
}
