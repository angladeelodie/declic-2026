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
    <section className="section-hero grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-0 h-[80vh] md:grid-rows-[1fr]">
      <div className="md:col-start-2 md:col-span-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {mediaImages.map((mediaItem, index) => (
          <Media
            key={index} // Use ID or Index as key
            media={mediaItem}
            className="col-span-1 md:col-span-1 w-full object-cover"
          />
        ))}
      </div>

      {/* Heading Container */}
      <div className="md:col-start-2 md:col-span-10">
        {heading && (
          <h1 className="text-title text-center md:text-left">
            {heading.parsedValue}
          </h1>
        )}
      </div>

      {/* Button Container */}
      <div className="md:col-start-2 md:col-span-10 flex justify-center md:justify-start">
        {link?.href?.value && (
          <LinkButton
            href={link.href.value}
            target={link?.target?.value !== 'false' ? '_blank' : undefined}
            text={link?.text?.value ?? ''}
            className="text-emphasis"
          />
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
  # IMPORTANT: do NOT interpolate EDITORIAL_MEDIA_METAOBJECT_FRAGMENT here
`;
