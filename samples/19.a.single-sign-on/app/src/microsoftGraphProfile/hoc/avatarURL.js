import Context from '../Context';
import hocContext from '../../utils/hocContext';

export default (selector = state => state) => hocContext(
  Context,
  ({ avatarURL }) => selector({ avatarURL })
)
