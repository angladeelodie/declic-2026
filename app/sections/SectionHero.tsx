import type {ParsedMetafields} from '@shopify/hydrogen';
import {parseSection} from '~/utils/parseSection';
import {Link} from 'react-router';
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
    <section className="section-hero grid grid-cols-12 gap-2">
      <div className="col-start-2 col-span-10 grid grid-cols-2 gap-2">
        {mediaImages.map((mediaImage, index) => (
          <img
            key={index}
            src={mediaImage.image.url}
            alt={mediaImage.image.altText ?? ''}
            className="w-full
            rounded-tl-[240px] rounded-tr-[200px] rounded-br-[480px] rounded-bl-[120px]"
          />
        ))}
      </div>
      <div className="col-start-2 col-span-10 grid grid-cols-2 gap-2">
        {heading && <h1 className='text-title'>{heading.parsedValue}</h1>}
        </div>
        <div className="col-start-2 col-span-10 grid grid-cols-2 gap-2">

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
