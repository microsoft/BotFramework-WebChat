/**
 * @deprecated Not used for rendering since 4.19.0 (PR #5670), customizing it has no effect.
 * The live styles are in `packages/component/src/Attachment/Text/private/CitationModal.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createCitationModalDialogStyle() {
  return {
    '&.webchat__citation-modal-dialog': {
      '& .webchat__citation-modal-dialog__body': {
        lineHeight: '20px'
      }
    }
  };
}
