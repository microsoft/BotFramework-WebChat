import { css } from 'glamor';
import { primaryFont } from '../Styles';

const DEFAULT_OPTIONS = {
  accent: '#6CF'
};

export default function createStyleSet(options) {
  return {
    avatar: css({
      ...primaryFont,

      backgroundColor: 'Black',
      borderRadius: '50%',
      color: 'White',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // lineHeight: '40px',
      // textAlign: 'center',
      height: 40,
      width: 40
    })
  };
}
