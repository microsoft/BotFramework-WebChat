export type SendBoxAttachment = Readonly<{
  blob: Blob | File;
  thumbnailURL?: URL;
}>;
