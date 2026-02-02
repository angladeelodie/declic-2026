// app/sections/SectionEditorial.tsx

import type {ParsedMetafields} from '@shopify/hydrogen';
import {parseSection} from '~/utils/parseSection';
import {LinkButton} from '~/components/LinkButton';

import {RichText} from '@shopify/hydrogen';

import {Link} from 'react-router';
import type {SectionEditorialFragment} from 'storefrontapi.generated';

export function SectionEditorial(props: SectionEditorialFragment) {
  const section = parseSection<
    SectionEditorialFragment,
    {
      heading?: ParsedMetafields['single_line_text_field'];
      description?: ParsedMetafields['rich_text_field'];
    }
  >(props);

  console.log('section editorial', props);
  const {heading, description, link} = section;

  // Single image from the fragment
  const mediaImage = props.image?.reference?.image;
  const imageUrl = mediaImage?.url;
  const imageAlt = mediaImage?.altText ?? '';

  const isReversed = props.order?.value === 'false';

  return (
<section className={`
  grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-2 
  h-auto md:h-[calc(40vh_+_5vw)] 
  items-center px-4 md:px-0
`}>
  {/* Image Container */}
  <div
    className={`
      col-span-1 md:col-span-5 self-stretch 
      ${isReversed ? 'md:col-start-7 md:order-2' : 'md:col-start-2 md:order-1'}
    `}
  >
    {imageUrl && (
      <img
        src={imageUrl}
        alt={imageAlt}
        className="w-full h-[400px] md:h-full object-cover
        rounded-tl-[120px] rounded-tr-[100px] rounded-br-[240px] rounded-bl-[60px]
        md:rounded-tl-[240px] md:rounded-tr-[200px] md:rounded-br-[480px] md:rounded-bl-[120px]"
      />
    )}
  </div>

  {/* Text Container */}
  <div
    className={`
      col-span-1 md:col-span-4 flex flex-col justify-center
      text-center md:text-left
      ${isReversed ? 'md:col-start-2 md:order-1' : 'md:col-start-8 md:order-2'}
    `}
  >
    {heading?.parsedValue && (
      <h2 className="text-title mb-4 text-3xl md:text-5xl">
        {heading.parsedValue}
      </h2>
    )}
    
    {props.description?.value && (
      <div className="mb-6">
        <RichText data={props.description.value} />
      </div>
    )}

    {link?.href?.value && (
      <div className="flex justify-center md:justify-start">
        <LinkButton
          href={link.href.value}
          target={link?.target?.value !== 'false' ? '_blank' : undefined}
          text={link?.text?.value ?? ''}
          className="text-emphasis"
        />
      </div>
    )}
  </div>
</section>
  );
}

// ---- GraphQL fragments ----

const MEDIA_IMAGE_FRAGMENT = `#graphql
  fragment EditorialMediaImage on MediaImage {
    image {
      altText
      url
      width
      height
    }
  }
`;

const LINK_FRAGMENT = `#graphql
  fragment EditorialLink on MetaobjectField {
    ... on MetaobjectField {
      reference {
        ... on Metaobject {
          href: field(key: "href") {
            value
          }
          target: field(key: "target") {
            value
          }
          text: field(key: "text") {
            value
          }
        }
      }
    }
  }
`;

export const SECTION_EDITORIAL_FRAGMENT = `#graphql
  fragment SectionEditorial on Metaobject {
    type

    heading: field(key: "heading") {
      key
      type
      value
    }

    order: field(key: "order") {
      key
      type
      value
    }

    description: field(key: "description") {
      key
      type
      value
    }

    link: field(key: "link") {
      ...EditorialLink
    }

    image: field(key: "image") {
      key
      # type is optional here unless you're parsing it via parseMetafield
      reference {
        ... on MediaImage {
          ...EditorialMediaImage
        }
      }
    }
  }
  ${LINK_FRAGMENT}
  ${MEDIA_IMAGE_FRAGMENT}
`;
