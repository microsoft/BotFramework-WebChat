import { type DefinedTerm } from './DefinedTerm';
import { type Thing } from './Thing';

/**
 * A Certification is an official and authoritative statement about a subject, for example a product, service, person, or organization. A certification is typically issued by an indendent certification body, for example a professional organization or government. It formally attests certain characteristics about the subject, for example Organizations can be ISO certified, Food products can be certified Organic or Vegan, a Person can be a certified professional, a Place can be certified for food processing. There are certifications for many domains: regulatory, organizational, recycling, food, efficiency, educational, ecological, etc. A certification is a form of credential, as are accreditations and licenses. Mapped from the gs1:CertificationDetails class in the GS1 Web Vocabulary.
 *
 * This is partial implementation of https://schema.org/Certification.
 *
 * @see https://schema.org/Certification
 */
export type Certification = Thing<'Certification'> & {
  /* An additional type for the item, typically used for adding more specific types from external vocabularies in microdata syntax. This is a relationship between something and a class that the thing is in. Typically the value is a URI-identified RDF class, and in this case corresponds to the use of rdf:type in RDF. Text values can be used sparingly, for cases where useful information can be added without their being an appropriate schema to reference. In the case of text values, the class label should follow the schema.org [style guide](https://schema.org/docs/styleguide.html). */
  additionalType?: string;

  /* A description of the item. */
  description?: string;

  /* The name of the item. */
  name?: string;

  /* A pattern that something has, for example 'polka dot', 'striped', 'Canadian flag'. Values are typically expressed as text, although links to controlled value schemes are also supported. */
  pattern?: DefinedTerm | string;

  /* The position of an item in a series or sequence of items. */
  position?: number;
};
