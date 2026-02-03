// app/sections/SectionEditorial.tsx

import type {ParsedMetafields} from '@shopify/hydrogen';
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

  // --- MEDIA HANDLING (image OR video) ---
  // 1. Drill down: props.media (Field) -> reference (Metaobject) -> media (Field) -> reference (The actual File)
  const actualMediaData = (props.media?.reference as any)?.media?.reference;

  const isImage = actualMediaData?.__typename === 'MediaImage';
  const isVideo = actualMediaData?.__typename === 'Video';

  console.log('Actual Data:', props.media);

  const styleIndex = Number(props.media.reference.style_index.value || 0);

  const STYLE_MAP: Record<number, string> = {
    // Note the underscores replacing spaces
    0: 'rounded-[30px_30px_30px_30px]',
    1: 'rounded-[30px_400px_400px_400px]',
    2: 'rounded-[400px_30px_400px_400px]',
    3: 'rounded-[400px_400px_30px_400px]',
    4: 'rounded-[400px_400px_400px_30px]',
    5: 'rounded-[30px_400px_30px_400px]',
    6: 'rounded-[400px_30px_400px_30px]',
  };

  const cornerClass = STYLE_MAP[styleIndex] || STYLE_MAP[0];

  // 2. Map the data for the UI
  const video = isVideo ? actualMediaData : null;
  const imageUrl = isImage ? actualMediaData?.image?.url : null;
  const imageAlt = isImage ? actualMediaData?.image?.altText : '';
  const isReversed = props.order?.value === 'false';
  const isMuted = useRef(true);

  return (
    <section
      className={`
        grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-2 
        h-auto md:h-[80vh] 
        items-center px-4 md:px-0
     `}
    >
      {/* Image case */}
      {isImage && imageUrl && (
        <div
          className={`
          col-span-1 md:col-span-5 self-stretch contain-size
          ${isReversed ? 'md:col-start-7 md:order-2' : 'md:col-start-2 md:order-1'}
          ${cornerClass}
          overflow-hidden

        `}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {isVideo && video?.sources && (
        <div
          className={`
          col-span-1 md:col-span-5 self-stretch contain-size
          ${isReversed ? 'md:col-start-7 md:order-2' : 'md:col-start-2 md:order-1'}
          overflow-hidden
          ${cornerClass}
        `}
        >
          <video
            // Use the ref value directly
            muted
            autoPlay
            loop
            playsInline
            controls={false}
            poster={video.previewImage?.url}
            className="w-full md:h-full object-cover"
          >
            {video.sources.map((source: any) => (
              <source
                key={source.url}
                src={source.url}
                type={source.mimeType ?? undefined}
              />
            ))}
          </video>
        </div>
      )}

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

const MEDIA_METAOBJECT_FRAGMENT = `#graphql
  fragment EditorialMediaMetaobject on Metaobject {
    # the file field – key "media"
    media: field(key: "media") {
    key
    type
    reference {
      __typename  # <--- CRITICAL: Returns "MediaImage" or "Video"
      ... on MediaImage {
        image {
          altText
          url
          width
          height
        }
      }
      ... on Video {
        id
        sources {
          url
          mimeType
        }
        previewImage {
          url
        }
      }
    }
  }

    # example integer field to drive styling
    style_index: field(key: "corner_style") {
      key
      type
      value
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
  ${MEDIA_METAOBJECT_FRAGMENT}
`;
