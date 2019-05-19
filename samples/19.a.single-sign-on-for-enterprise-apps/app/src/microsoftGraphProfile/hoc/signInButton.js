import Context from '../Context';
import hocContext from '../../utils/hocContext';

export default (selector = state => state) => hocContext(
  Context,
  ({ onSignIn }) => selector({ onClick: onSignIn })
)
