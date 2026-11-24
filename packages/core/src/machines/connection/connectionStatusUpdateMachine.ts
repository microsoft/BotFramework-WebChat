import connectionStatusUpdate from '../../actions/connectionStatusUpdate';
import setReferenceGrammarID from '../../actions/setReferenceGrammarID';
import type { Machine } from '../types';

/** `connectionStatusUpdateSaga`: while online, each connection status, then the reference grammar ID of Direct Line. */
const connectionStatusUpdateMachine: Machine = scope =>
  scope.whileOnline(({ directLine }, online) =>
    online.observeEach(directLine.connectionStatus$, (connectionStatus, next) =>
      online.put(connectionStatusUpdate(connectionStatus as any), () =>
        online.put(setReferenceGrammarID(directLine.referenceGrammarId), next)
      )
    )
  );

export default connectionStatusUpdateMachine;
