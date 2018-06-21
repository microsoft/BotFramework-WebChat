import { css } from 'glamor';
import { primaryFont } from '../Styles';

const DEFAULT_OPTIONS = {
  accent: '#6CF'
};

export default function createStyleSet(options) {
  return {
    avatar: css({
      ...primaryFont,

      alignItems: 'center',
      backgroundColor: 'Black',
      borderRadius: '50%',
      color: 'White',
      display: 'flex',
      height: 40,
      justifyContent: 'center',
      overflow: 'hidden',
      width: 40
    })
  };
}
