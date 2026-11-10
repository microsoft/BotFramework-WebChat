// The order of the machines is the order of redux-saga, whose scheduler this is: one queue for every saga of every
// store (module level, as in `@redux-saga/core`). A task queued while another runs, runs after it; the outermost one
// runs the queue before returning.
const queue: (() => void)[] = [];
let semaphore = 0;

function exec(task: () => void): void {
  try {
    semaphore++;
    task();
  } finally {
    semaphore--;
  }
}

function flush(): void {
  semaphore--;

  let task: (() => void) | undefined;

  while (!semaphore && (task = queue.shift())) {
    exec(task);
  }
}

/** Runs `task` now if no task runs, with the tasks it queues after it; otherwise, queues it. */
export function asap(task: () => void): void {
  queue.push(task);

  if (!semaphore) {
    semaphore++;
    flush();
  }
}

/** Runs `task` now, queuing what it queues, then runs the queue if no other task runs. */
export function immediately<T>(task: () => T): T {
  try {
    semaphore++;

    return task();
  } finally {
    flush();
  }
}
