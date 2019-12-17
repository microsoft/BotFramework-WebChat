import { useMemo, useRef } from 'react';

export default function useMemoArrayMap(array, mapper) {
  const prevMapperRef = useRef();
  const sameMapper = Object.is(mapper, prevMapperRef.current);

  const prevMapperCallsRef = useRef([]);
  const { current: prevMapperCalls = [] } = sameMapper ? prevMapperCallsRef : {};
  const nextMapperCalls = [];

  return useMemo(() => {
    const mapped = array.map((value, index) => {
      const prevResult = prevMapperCalls.find(({ value: targetValue }) => targetValue === value);
      const { result = mapper.call(array, value, index) } = prevResult || {};

      nextMapperCalls.push({ result, value });

      return result;
    });

    prevMapperCallsRef.current = nextMapperCalls;
    prevMapperRef.current = mapper;

    return mapped;
  }, [array, mapper, nextMapperCalls]);
}
