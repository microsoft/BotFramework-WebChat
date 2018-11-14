import Observable from 'zen-observable';

class MockDirectLine {
  constructor() {
    this.connectionStatus$ = new Observable(observer => this.connectionStatus = observer);
    this.activity$ = new Observable(observer => this.activity = observer);

    this.pendingPosts = [];
  }

  postActivity(activity) {
    return new Observable(observer => {
      this.pendingPosts.push({
        complete: id => {
          observer.next(id);
          observer.complete();

          this.activity.next({
            ...activity,
            id
          });
        },
        error: err => {
          observer.error(err);
        },
        peek: () => activity
      });
    });
  }
}

export default function () {
  return new MockDirectLine();
}
