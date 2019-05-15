import Context from '../Context';
import hocContext from '../../utils/hocContext';

export default (selector = state => state) => hocContext(
  Context,
  ({ name }) => selector({ name })
)
