import useContext from './private/useContext';

export default function useShowModal(): ReturnType<typeof useContext>['showModal'] {
  return useContext().showModal;
}
