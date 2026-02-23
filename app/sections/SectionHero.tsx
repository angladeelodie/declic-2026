import type {ParsedMetafields} from '@shopify/hydrogen';
import {parseSection} from '~/utils/parseSection';
import {LinkButton} from '~/components/LinkButton';
import {Media} from '~/components/Media';

import type {SectionHeroFragment} from 'storefrontapi.generated';

export function SectionHero(props: SectionHeroFragment) {
  const section = parseSection<
    SectionHeroFragment,
    {
      heading?: ParsedMetafields['single_line_text_field'];
    }
  >(props);

  const {images, heading, link} = section;

  // console.log('SectionHero props:', props);
  // images.references.nodes is an array of up to 2 MediaImage objects
  const mediaImages = props.medias?.references?.nodes ?? [];
  // console.log('mediaImages', mediaImages);

  return (
    /* Swap to [1fr_auto] so images stretch and text fits content */
    <section className="section-hero section-main grid-rows-[1fr_auto] h-[100vh]">
      {/* ROW 1: Media Images (Stretches) */}
      {/* 1 Image: Spans the full width (col-span-full)
  2 Images: Centered with gutters (lg:col-span-10 lg:col-start-2)
*/}
      <div
        className={`row-start-1 grid gap-4 min-h-0
    ${
      mediaImages.length > 1
        ? 'grid-cols-1 lg:grid-cols-2 col-span-full md:col-start-2 md:col-span-4 lg:col-span-10 lg:col-start-2'
        : 'col-start-1 col-span-6 md:col-start-2 md:col-span-4 lg:col-start-4 lg:col-span-6'
    }
  `}
      >
        {mediaImages.map((mediaItem, index) => (
          <Media
            key={index}
            media={mediaItem}
            className="w-full h-full min-h-0 object-cover aspect-square lg:aspect-auto"
          />
        ))}
      </div>
      {/* ROW 2: Heading & Button (Fits Content) */}
      <div className="row-start-2 col-span-full md:col-span-4 md:col-start-2 flex flex-col items-center lg:items-start pt-8">
        {heading && (
          <h1 className="text-title text-center lg:text-left m-0 pb-0">
            {heading.parsedValue}
          </h1>
        )}

        {link?.href?.value && (
          <div className="mt-6">
           <LinkButton
              href={`/pages/${props.link?.reference?.page?.reference?.handle}`}
              text={props.link?.reference?.text?.value ?? ''}
              className="text-emphasis"
            />
          </div>
        )}
      </div>
    </section>
  );
}

const HERO_LINK_FRAGMENT = `#graphql
  fragment HeroLink on MetaobjectField {
    ... on MetaobjectField {
      reference {
        ... on Metaobject {
          target: field(key: "target") {
            value
          }
          text: field(key: "text") {
            value
          }
          page: field(key: "page") {
            reference {
              ... on Page {
                handle
              }
            }
          }
        }
      }
    }
  }
`;

export const SECTION_HERO_FRAGMENT = `#graphql
  fragment SectionHero on Metaobject {
    type

    heading: field(key: "heading") {
      key
      value
    }

    link: field(key: "link") {
      ...HeroLink
    }

    medias: field(key: "medias") {
      key
      references(first: 2) {
        nodes {
          ... on Metaobject {
            ...EditorialMediaMetaobject
          }
        }
      }
    }
  }
  ${HERO_LINK_FRAGMENT}
`;
