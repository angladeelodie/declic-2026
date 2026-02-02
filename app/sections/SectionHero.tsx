import type {ParsedMetafields} from '@shopify/hydrogen';
import {parseSection} from '~/utils/parseSection';
import {LinkButton} from '~/components/LinkButton';

import type {SectionHeroFragment} from 'storefrontapi.generated';

export function SectionHero(props: SectionHeroFragment) {
  const section = parseSection<
    SectionHeroFragment,
    {
      heading?: ParsedMetafields['single_line_text_field'];
    }
  >(props);

  const {images, heading, link} = section;

  // images.references.nodes is an array of up to 2 MediaImage objects
  const mediaImages = props.images?.references?.nodes ?? [];

  return (
<section className="section-hero grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-0">
  

  <div className="md:col-start-2 md:col-span-10 grid grid-cols-1 md:grid-cols-2 gap-4">
    {mediaImages.map((mediaImage, index) => (
      <img
        key={index}
        src={mediaImage.image.url}
        alt={mediaImage.image.altText ?? ''}
        className="w-full object-cover 
        rounded-tl-[120px] rounded-tr-[100px] rounded-br-[240px] rounded-bl-[60px] 
        md:rounded-tl-[240px] md:rounded-tr-[200px] md:rounded-br-[480px] md:rounded-bl-[120px]"
      />
    ))}
  </div>

  {/* Heading Container */}
  <div className="md:col-start-2 md:col-span-10">
    {heading && <h1 className="text-title text-center md:text-left">{heading.parsedValue}</h1>}
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
const MEDIA_IMAGE_FRAGMENT = `#graphql
  fragment MediaImage on MediaImage {
    image {
      altText
      url
      width
      height
    }
  }
`;

const LINK_FRAGMENT = `#graphql
  fragment Link on MetaobjectField {
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
      ...Link
    }
    images: field(key: "images") {
      key
      references(first: 2) {
        nodes {
          ... on MediaImage {
            ...MediaImage
          }
        }
      }
    }
  }
  ${LINK_FRAGMENT}
  ${MEDIA_IMAGE_FRAGMENT}
`;
