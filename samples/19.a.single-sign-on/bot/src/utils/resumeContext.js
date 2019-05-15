module.exports = async function resumeContext(adapter, reference) {
  return new Promise(async (resolveResume, rejectResume) => {
    try {
      await adapter.continueConversation(reference, context => {
        return new Promise((resolveContext, rejectContext) => {
          let deferred;

          context.respondWith = async promise => {
            deferred = true;

            try {
              await promise;
              resolveContext();
            } catch (err) {
              rejectContext(err);
            }
          };

          resolveResume(context);

          !deferred && resolveContext();
        });
      });
    } catch (err) {
      rejectResume(err);
    }
  });
};
