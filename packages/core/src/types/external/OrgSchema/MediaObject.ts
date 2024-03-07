// import type { Certification } from './Certification';
// import { type Thing } from './Thing';

// /**
//  * A media object, such as an image, video, audio, or text object embedded in a web page or a downloadable dataset i.e. DataDownload. Note that a creative work may have many media objects associated with it on the same web page. For example, a page about a single song (MusicRecording) may have a music video (VideoObject), and a high and low bandwidth audio stream (2 AudioObject's).
//  *
//  * This is partial implementation of https://schema.org/MediaObject.
//  *
//  * @see https://schema.org/MediaObject
//  */
// export type MediaObject = Thing<'MediaObject'> & {
//   /** URL of the item. */
//   url?: string;

//   /**
//    * The schema.org [usageInfo](https://schema.org/usageInfo) property indicates further information about a [CreativeWork](https://schema.org/CreativeWork). This property is applicable both to works that are freely available and to those that require payment or other transactions. It can reference additional information, e.g. community expectations on preferred linking and citation conventions, as well as purchasing details. For something that can be commercially licensed, usageInfo can provide detailed, resource-specific information about licensing options.
//    *
//    * This property can be used alongside the license property which indicates license(s) applicable to some piece of content. The usageInfo property can provide information about other licensing options, e.g. acquiring commercial usage rights for an image that is also available under non-commercial creative commons licenses.
//    */
//   usageInfo?: Certification;
// };
