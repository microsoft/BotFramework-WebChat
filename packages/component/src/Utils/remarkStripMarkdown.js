/* eslint-disable no-sync */

import PropTypes from 'prop-types';
import remark from 'remark';
import stripMarkdown from 'strip-markdown';

const remarkStripMarkdown = text => {
  const stripped = remark()
    .use(stripMarkdown)
    .processSync(text);

  return stripped;
};

remarkStripMarkdown.propTypes = {
  text: PropTypes.string.isRequired
};

export default remarkStripMarkdown;
