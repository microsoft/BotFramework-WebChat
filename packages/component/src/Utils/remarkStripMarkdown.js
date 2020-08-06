/* eslint-disable no-sync */

import PropTypes from 'prop-types';
import remark from 'remark';
import stripMarkdown from 'strip-markdown';

const remarkStripMarkdown = text => remark().use(stripMarkdown).processSync(text).contents;

remarkStripMarkdown.propTypes = {
  text: PropTypes.string.isRequired
};

export default remarkStripMarkdown;
