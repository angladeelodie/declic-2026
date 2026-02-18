import type {ParsedMetafields} from '@shopify/hydrogen';
import {parseSection} from '~/utils/parseSection';
import {Navigation, Pagination, Scrollbar, A11y} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Link} from 'react-router';
import ArrowSvg from '../assets/arrow.svg'; // adjust path as needed

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
    <section className="section-looks-slider section-main w-full px-4 md:px-0 h-fit">
      <h3 className="col-span-12 text-center text-title">{title?.value}</h3>
      {/* The 12-Column Grid Container */}
      <div className="col-span-12 grid grid-cols-6 lg:grid-cols-12 gap-4 items-center py-16">
        {/* Column 2: Left Arrow */}
        <div className="hidden lg:block lg:col-start-1">
          <button className="swiper-prev-button cursor-pointer p-2 hover:opacity-60 transition-opacity">
            <img
              src={ArrowSvg}
              alt="arrow"
              className="scale-x-[-1]
          w-6 h-6
        
        "
            />
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
            breakpoints={{
              // ≥ 0px (mobile): 1.5 slides
              0: {
                slidesPerView: 1.5,
              },
              // ≥ 768px (md): still 1.5 slides
              768: {
                slidesPerView: 3,
              },
              // ≥ 1024px (lg): 3 slides
              // 1024: {
              //   slidesPerView: 3,
              // },
            }}
          >
            {looks?.nodes.map((look) => {
              const topHandle = (look as any).top?.handle;
              const bottomHandle = (look as any).bottom?.handle;
              const sleeveHandle = (look as any).sleeves?.handle;

              const hasAllProducts = topHandle && bottomHandle && sleeveHandle;

              const configuratorUrl = hasAllProducts
                ? `/pages/configurator?top=${encodeURIComponent(
                    topHandle,
                  )}&bottom=${encodeURIComponent(
                    bottomHandle,
                  )}&sleeve=${encodeURIComponent(sleeveHandle)}`
                : '#';

              // console.log(look)

              return (
                <SwiperSlide key={look.id} className="custom-slide">
                  <Link
                    to={configuratorUrl}
                    className={`flex flex-col h-full ${
                      hasAllProducts ? '' : 'pointer-events-none opacity-50'
                    }`}
                  >
                    <div className="image-container relative aspect-[2/3] w-full overflow-hidden rounded-[30px] bg-[#e5eae8]">
                      {look.image?.image?.url && (
                        <img
                          src={look.image.image.url}
                          alt={look.image.image.altText || ''}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                        />
                      )}
                    </div>
                    {/* <div className="mt-4 text-center slide-content transition-opacity duration-500">
                      <h2 className="text-xl uppercase tracking-tighter">
                        {look.title?.value}
                      </h2>
                    </div> */}
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Column 11: Right Arrow */}
        <div className="hidden lg:block lg:col-start-12 justify-self-end">
          <button className="swiper-next-button cursor-pointer p-2 hover:opacity-60 transition-opacity">
            <img
              src={ArrowSvg}
              alt="arrow"
              className="
          w-6 h-6
          transition-transform duration-200 ease-out
        "
            />
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

  fragment LookItemProduct on Product {
    id
    title
    handle
    featuredImage {
      id
      url
      altText
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

    top: field(key: "top") {
      reference {
        ... on Product {
          ...LookItemProduct
        }
      }
    }

    bottom: field(key: "bottom") {
      reference {
        ... on Product {
          ...LookItemProduct
        }
      }
    }

    sleeves: field(key: "sleeves") {
      reference {
        ... on Product {
          ...LookItemProduct
        }
      }
    }
  }
`;

export const SECTION_LOOKS_SLIDER_FRAGMENT = `#graphql
  fragment SectionLooksSlider on Metaobject {
    type
     
    title: field(key: "title") {
      key
      value
    }

    looks: field(key: "looks") {
      references(first: 10) {
        nodes {
          ...LookItem
        }
      }
    }
  }
  ${LOOK_ITEM_FRAGMENT} `;
