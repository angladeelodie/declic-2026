import type {ParsedMetafields} from '@shopify/hydrogen';
import {parseSection} from '~/utils/parseSection';
import {Link} from 'react-router';
import type {SectionlooksFragment} from 'storefrontapi.generated';

export function SectionLooksSlider(props: SectionLooksSliderFragment) {
  const section = parseSection<
    SectionLooksSliderFragment,
    // override metafields types that have been parsed
    {
      title?: ParsedMetafields['single_line_text_field'];
    }
  >(props);

  const {title, looks} = section;

  return (
    <section className="section-looks-slider">
      <div className="col-span-12">
        {looks &&
          looks.nodes.map((store) => {
            if (!store) {
              return null;
            }
            const {image, heading, address} = store;
            return (
              <Link key={store.id} to={`/looks/${store.handle}`}>
                {image?.image?.url && (
                  <img
                    width={400}
                    src={image.image.url}
                    alt={image.image.altText || ''}
                  />
                )}
                {heading && (
                  <h2 style={{marginBottom: '.25rem', marginTop: '1rem'}}>
                    {heading.value}
                  </h2>
                )}
                {address && <address>{address?.value}</address>}
              </Link>
            );
          })}
      </div>
    </section>
  );
}

const LOOK_ITEM_FRAGMENT = `#graphql
  fragment LookItemField on MetaobjectField {
    type
    key
    value
  }
  fragment LookItemImage on MediaImage {
    image {
      altText
      url(transform: {maxWidth: 600, maxHeight: 600})
      width
      height
    }
  }

  fragment LookItem on Metaobject {
    type
    id
    handle
    title: field(key: "title") {
      ...LookItemField
    }
    image: field(key: "image") {
      key
      reference {
        ... on MediaImage {
          ...LookItemImage
        }
      }
    }
}
`;

export const SECTION_LOOKS_SLIDER_FRAGMENT = `#graphql
  fragment SectionLooksSlider on Metaobject {
    type
    looks: field(key: "looks") {
      references(first: 10) {
        nodes {
          ...LookItem
        }
      }
    }
  }
  ${LOOK_ITEM_FRAGMENT} `;
