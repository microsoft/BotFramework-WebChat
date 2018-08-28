// import BasicFilm from 'react-film';
// import React from 'react';

// import { withActivity } from './Context';
// import { withStyleSet } from '../Context';
// import Avatar from './Avatar';
// import Bubble from './Bubble';
// import Timestamp from './Timestamp';

// export default withStyleSet(withActivity(({
//   attachments,
//   children,
//   styleSet
// }) =>
//   <BasicFilm
//     showDots={ false }
//     showScrollBar={ false }
//   >
//     <Avatar />
//     {
//       attachments.map((attachment, index) =>
//         <div
//           className={ styleSet.multipleAttachmentActivity + '' }
//           key={ index }
//         >
//           <Bubble attachment={ attachment }>
//             { !!children && (typeof children === 'function' ? children(attachment) : children) }
//           </Bubble>
//           { index === 0 && <Timestamp /> }
//         </div>
//       )
//     }
//   </BasicFilm>
// ))
