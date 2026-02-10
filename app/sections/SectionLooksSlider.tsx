import type {ParsedMetafields} from '@shopify/hydrogen';
import {parseSection} from '~/utils/parseSection';
import {Navigation, Pagination, Scrollbar, A11y} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Link} from 'react-router';
// Import Swiper styles

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
    <section className="section-looks-slider w-full px-4 md:px-0">
      {/* The 12-Column Grid Container */}
      <div className="grid grid-cols-6 lg:grid-cols-12 gap-4 items-center py-16">
        {/* Column 2: Left Arrow */}
        <div className="hidden lg:block lg:col-start-1">
          <button className="swiper-prev-button cursor-pointer p-2 hover:scale-110 transition-transform">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Columns 3 to 10: The Swiper Stage */}
        <div className="col-span-6 lg:col-span-10 lg:col-start-2">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={{
              nextEl: '.swiper-next-button',
              prevEl: '.swiper-prev-button',
            }}
            centeredSlides={true}
            loopAdditionalSlides={-1}
            slidesPerView={3} // Crucial: allows CSS to define widths

            loop={true}
            className="looks-swiper overflow-hidden"
          >
            {looks?.nodes.map((store) => (
              <SwiperSlide key={store.id} className="custom-slide">
                <Link
                  to={`/looks/${store.handle}`}
                  className="flex flex-col h-full"
                >
                  <div className="image-container relative aspect-[2/3] w-full overflow-hidden rounded-[30px] bg-[#e5eae8]">
                    {store.image?.image?.url && (
                      <img
                        src={store.image.image.url}
                        alt={store.image.image.altText || ''}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="mt-4 text-center slide-content transition-opacity duration-500">
                    <h2 className="text-xl uppercase tracking-tighter">
                      {store.heading?.value}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {store.address?.value}
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Column 11: Right Arrow */}
        <div className="hidden lg:block lg:col-start-12 justify-self-end">
          <button className="swiper-next-button cursor-pointer p-2 hover:scale-110 transition-transform">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
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
