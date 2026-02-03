export function postActivity(adapter, activityOrString) {
  const activityTemplate = {
    type: 'message',
    from: { id: 'user', name: 'User', role: 'user' },
    timestamp: new Date().toISOString()
  };

  return new Promise((resolve, reject) =>
    adapter
      .postActivity(
        Object.assign(
          activityTemplate,
          typeof activityOrString === 'string' ? { text: activityOrString } : activityOrString
        )
      )
      .subscribe(resolve, reject)
  );
}
