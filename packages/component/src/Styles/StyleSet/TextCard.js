import {
  primaryFont
} from '../Fonts';

export default function createTextCardStyle() {
  return {
    ...primaryFont,
    margin: 0,
    minHeight: 20,
    padding: 10
  };
}
