import useSelector from './useSelector';

export default function useLanguage() {
  return useSelector(({ language }) => language);
}
