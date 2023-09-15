import React, { memo } from 'react';

type Props = Readonly<{ className?: string }>;

const ThumbLike16Filled = memo(({ className }: Props) => (
  <svg className={className} fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.5806 1.0516C8.83006 0.843 8.24411 1.40248 8.03494 1.92332C7.79411 2.52303 7.58243 2.94395 7.32941 3.44707C7.17287 3.75833 7.00052 4.10106 6.79565 4.53704C6.32141 5.54625 5.84755 6.19347 5.5035 6.58154C5.33128 6.77579 5.19093 6.90585 5.09835 6.98435C5.05204 7.02362 5.01761 7.05005 4.99704 7.0652L4.9809 7.07684L3.109 8.18119C2.27244 8.67473 1.91142 9.69797 2.25304 10.6072L2.77304 11.9912C2.98944 12.5671 3.45891 13.0114 4.04591 13.1958L9.40179 14.8781C10.7365 15.2974 12.1555 14.5397 12.5497 13.1973L13.9139 8.55127C14.29 7.2705 13.3298 5.9878 11.9949 5.9878H10.6099C10.6759 5.76117 10.7434 5.50906 10.8047 5.24751C10.9361 4.68641 11.0478 4.04484 11.0375 3.51008C11.028 3.01293 10.9778 2.49126 10.7735 2.04807C10.5544 1.57258 10.1709 1.21566 9.5806 1.0516ZM4.9768 7.07969L4.97492 7.08097L4.9768 7.07969Z"
      fill="currentcolor"
    />
  </svg>
));

ThumbLike16Filled.displayName = 'ThumbLike16Filled';

export default ThumbLike16Filled;
