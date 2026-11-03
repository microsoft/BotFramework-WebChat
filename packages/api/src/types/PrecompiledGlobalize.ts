type PrecompiledGlobalize = {
  dateFormatter: ({ skeleton }: { skeleton: 'MMMMdjm' }) => string;
  relativeTimeFormatter: (format: 'hour' | 'minute') => string;
  unitFormatter:
    | ((unit: 'byte', options: { form: 'long' }) => string)
    | ((unit: 'kilobyte' | 'megabyte' | 'gigabyte', options: { form: 'short' }) => string);
};

export default PrecompiledGlobalize;
