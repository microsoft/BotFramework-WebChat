window.createProduceConsumeBroker = function createProduceConsumeBroker() {
  const consumers = [];
  const jobs = [];

  return {
    cancel() {
      jobs.splice(0);
    },
    consume(consumer) {
      consumers.push(consumer);

      if (jobs.length) {
        const consumer = consumers.shift();

        consumer.apply(consumer, jobs.shift());
      }
    },
    hasConsumer() {
      return !!consumers.length;
    },
    hasJob() {
      return !!jobs.length;
    },
    peek() {
      return jobs[0];
    },
    produce(...args) {
      jobs.push(args);

      if (consumers.length) {
        const consumer = consumers.shift();

        consumer.apply(consumer, jobs.shift());
      }
    }
  };
};
