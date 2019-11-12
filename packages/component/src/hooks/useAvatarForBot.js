import useStyleOptions from './useStyleOptions';

export default function useAvatarForBot() {
  const [{ botAvatarImage: image, botAvatarInitials: initials }] = useStyleOptions();

  return [
    {
      image,
      initials
    }
  ];
}
