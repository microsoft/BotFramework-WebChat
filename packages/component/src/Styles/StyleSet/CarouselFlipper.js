export default function ({
  carouselFlipperBackground,
  carouselFlipperBackgroundOnHover,
  carouselFlipperColor,
  carouselFlipperColorOnHover
}) {
  return {
    '& > div.button': {
      backgroundColor: carouselFlipperBackground,
      color: carouselFlipperColor
    },

    '&:hover > div.button': {
      backgroundColor: carouselFlipperBackgroundOnHover,
      color: carouselFlipperColorOnHover
    }
  };
}
