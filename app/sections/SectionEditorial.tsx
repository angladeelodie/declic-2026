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
        section-editorial
        section-main
        grid-rows-[1fr]
     `}
    >
      <Media
        media={props.media.reference}
        className={`order-2 col-span-6 md:col-start-2 md:col-span-4 md:col-start-2 lg:col-span-5 ${isReversed ? 'lg:col-start-7 lg:order-2' : 'lg:col-start-2 lg:order-1'}`}
      />

      <div
        className={`order-1 col-span-6 md:col-start-2 md:col-span-4 lg:col-span-4 flex flex-col justify-center text-center lg:text-left
          ${isReversed ? 'lg:col-start-2 lg:order-1' : 'lg:col-start-8 lg:order-2'}
        `}
      >
        {heading?.parsedValue && (
          <h2 className="text-title text-3xl lg:text-5xl">
            {heading.parsedValue}
          </h2>
        )}

        {props.description?.value && (
          <div className="mb-6">
            <RichText data={props.description.value} />
          </div>
        )}

        {link?.href?.value && (
          <div className="flex justify-center lg:justify-start">
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