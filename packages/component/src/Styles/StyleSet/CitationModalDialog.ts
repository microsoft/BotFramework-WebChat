// Not used for rendering since #5670, no component reads `styleSet.citationModalDialog`.
// The live styles are in `../../Attachment/Text/private/CitationModal.module.css`.

export default function createCitationModalDialogStyle() {
  return {
    '&.webchat__citation-modal-dialog': {
      '& .webchat__citation-modal-dialog__body': {
        lineHeight: '20px'
      }
    }
  };
}
