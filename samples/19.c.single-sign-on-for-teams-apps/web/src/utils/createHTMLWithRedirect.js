module.exports = ({ access_token, error }, origin) =>
  error
    ? // Instead of alerting the error (e.g. user cancelled, organization denied access), you should handle the error and escalate the problem.
      `<!DOCTYPE html><html><head><title></title><script crossorigin="anonymous" integrity="sha384-DcoNUuQTjpW5Sw3msonn/2ojgtNvtC5fCGd5U9RUpL3g1hla1LzHz8I9YIYSXe6q" src="https://statics.teams.microsoft.com/sdk/v1.4.2/js/MicrosoftTeams.min.js"></script><script>window.microsoftTeams.initialize();window.microsoftTeams.authentication.notifyFailure(${JSON.stringify(
        error
      )});</script></head><body></body></html>`
    : `<!DOCTYPE html><html><head><title></title><script crossorigin="anonymous" integrity="sha384-DcoNUuQTjpW5Sw3msonn/2ojgtNvtC5fCGd5U9RUpL3g1hla1LzHz8I9YIYSXe6q" src="https://statics.teams.microsoft.com/sdk/v1.4.2/js/MicrosoftTeams.min.js"></script><script>window.microsoftTeams.initialize();window.microsoftTeams.authentication.notifySuccess({ accessToken: ${JSON.stringify(
        access_token
      )} });</script></head><body></body></html>`;
