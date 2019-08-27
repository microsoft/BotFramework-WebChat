import useSelector from './useSelector';

export default function useSendBoxValue() {
  return useSelector(({ sendBoxValue }) => sendBoxValue);
}
