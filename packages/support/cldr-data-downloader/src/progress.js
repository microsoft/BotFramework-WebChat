import progress from 'progress';

let bar, nDownloads;
const states = [];

function defined(sum, i) {
  if (i !== undefined) {
    sum.push(i);
  }
  return sum;
}

function summation(sum, i) {
  return sum + (i || 0);
}

function consolidatedState() {
  const totals = states.map(({ total }) => total).reduce(defined, []);
  const received = states.map(({ received }) => received).reduce(summation, 0);

  if (totals.length < nDownloads) {
    return {
      isCompleted: false,
      received,
      total: Infinity
    };
  }

  return {
    // eslint-disable-next-line no-magic-numbers
    completed: states.map(({ percent }) => percent).every(state => state === 100),
    received,
    total: states.map(({ total }) => total).reduce(summation, 0)
  };
}

function reportProgress(state) {
  if (!bar) {
    bar = new progress('  [:bar] :current/:total :percent :etas', {
      total: state.total,
      width: 40
    });
  }

  if (!bar.complete) {
    bar.total = state.total;
    bar.tick(state.received - bar.curr);
  }

  if (state.completed) {
    // eslint-disable-next-line no-console, no-magic-numbers
    console.log('Received ' + Math.floor(state.received / 1024) + 'K total.');
  }
}

export default function (_nDownloads) {
  nDownloads = _nDownloads;

  return function (notification) {
    states[notification.index] = Object.assign({}, states[notification.index], notification.value);
    reportProgress(consolidatedState());
  };
}
