const HISTORY_SIZE = 25;

class SendHistory {
  _state = [];
  _index = -1;
  _storageKey = 'WEBCHAT_SEND_HISTORY';

  constructor(persist = true) {
    this._persist = persist;

    if (this._persist) {
      try {
        this._state = JSON.parse(window.sessionStorage.getItem(this._storageKey)) || [];
      } catch {
        this._state = [];
      }

      this.add = this._persistAfter(this.add);
      this.truncate = this._persistAfter(this.truncate);
    }
  }

  // better name?
  isActive() {
    return this._state.length > 0 && this._index > -1;
  }

  add(item) {
    const idx = this._state.indexOf(item);

    if (idx !== -1) {
      this._state.splice(idx, 1);
    }

    this._state.unshift(item);

    if (this._state.length > HISTORY_SIZE) {
      this.truncate();
    }
  }

  getNext() {
    const item = this._state[this._index + 1];

    if (item) {
      this._index++;
      return item;
    }
  }

  getPrevious() {
    const item = this._state[this._index - 1];

    if (item) {
      this._index--;
      return item;
    } else {
      this.reset();
      return '';
    }
  }

  reset() {
    this._index = -1;
  }

  truncate() {
    this._state.pop();
  }

  _persistAfter(fn) {
    return (...args) => {
      fn.call(this, ...args);

      if (this._persist) {
        window.sessionStorage.setItem(this._storageKey, JSON.stringify(this._state));
      }
    }
  }
}

export default SendHistory;
