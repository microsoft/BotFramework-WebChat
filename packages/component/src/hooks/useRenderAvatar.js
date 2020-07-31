import useCreateAvatarRenderer from './useCreateAvatarRenderer';

let showDeprecationNotes = true;

export default function useRenderAvatar({ activity }) {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useRenderAvatar" is deprecated and will be removed on or after 2022-07-28. Please use "useRenderAvatar()" instead.'
    );

    showDeprecationNotes = false;
  }

  const createAvatarRenderer = useCreateAvatarRenderer();

  return createAvatarRenderer({ activity });
}
