import { useScrollTo as useScrollToBottomScrollTo } from 'react-scroll-to-bottom';

export default function useScrollTo() {
  const scrollTo = useScrollToBottomScrollTo();

  return useCallback(
    ({ scrollTop }) => {
      typeof scrollTop === 'number' && scrollTo(scrollTop, { behavior: 'smooth' });
    },
    [scrollTo]
  );
}
