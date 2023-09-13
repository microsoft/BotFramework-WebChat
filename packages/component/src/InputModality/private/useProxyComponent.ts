import useContext from './useContext';

export default function useProxyComponent() {
  return useContext().proxyComponentState;
}
