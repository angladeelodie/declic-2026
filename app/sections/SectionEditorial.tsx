// app/sections/SectionEditorial.tsx

import type {ParsedMetafields} from '@shopify/hydrogen';
import {Media} from '~/components/Media';
import {parseSection} from '~/utils/parseSection';
import {LinkButton} from '~/components/LinkButton';
import {Video} from '@shopify/hydrogen';
import {RichText} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useRef, useEffect} from 'react';
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
  const isReversed = props.order?.value === 'false';
  // console.log('SectionEditorial props:', props);

  return (
    <section
      className={`
        grid grid-cols-6 md:grid-cols-12 gap-8 md:gap-2 
        h-auto md:h-[80vh]  
        items-center px-4 md:px-0
     `}
    >
      <Media
        media={props.media.reference}
        className={`col-start-2 col-span-4 md:col-span-5 ${isReversed ? 'md:col-start-7 md:order-2' : 'md:col-start-2 md:order-1'}`}
      />

      <div
        className={`
          col-start-2 col-span-4 md:col-span-4 flex flex-col justify-center
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

    media: field(key: "media") {
      key
      reference {
        ... on Metaobject {
          ...EditorialMediaMetaobject
        }
      }
    }
  }
  ${LINK_FRAGMENT}
`;