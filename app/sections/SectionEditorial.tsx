// app/sections/SectionEditorial.tsx

import type {ParsedMetafields} from '@shopify/hydrogen';
import {parseSection} from '~/utils/parseSection';
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

  const {heading, description, link} = section;

  // Single image from the fragment
  const mediaImage = props.image?.reference?.image;
  const imageUrl = mediaImage?.url;
  const imageAlt = mediaImage?.altText ?? '';

  return (
    <section className="section-editorial grid grid-cols-12 gap-2">
      <div className="col-start-2 col-span-5">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full
            rounded-tl-[240px] rounded-tr-[200px] rounded-br-[480px] rounded-bl-[120px]"
          />
        )}
      </div>

      <div className="col-start-8 col-span-4 flex flex-col justify-center">
        {heading?.parsedValue && (
          <h2 className="text-title mb-4">{heading.parsedValue}</h2>
        )}

        {props.description?.value && (
     <RichText data={props.description.value} />
   )}
        {link?.href?.value && (
          <Link
            className="text-emphasis"
            to={link.href.value}
            {...(link?.target?.value !== 'false'
              ? {target: '_blank', rel: 'noreferrer'}
              : {})}
          >
            {link?.text?.value}
          </Link>
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