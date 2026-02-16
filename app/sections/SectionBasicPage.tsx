// app/sections/SectionEditorial.tsx

import type {ParsedMetafields} from '@shopify/hydrogen';
import {Media} from '~/components/Media';
import {parseSection} from '~/utils/parseSection';
import {LinkButton} from '~/components/LinkButton';
import {RichText} from '@shopify/hydrogen';
import type {SectionBasicPageFragment} from 'storefrontapi.generated';

export function SectionBasicPage(props: SectionBasicPageFragment) {
  const section = parseSection<SectionBasicPageFragment, {}>(props);

  const {title, first_column_text, second_column_text} = section;
  // console.log('SectionBasicPage props:', props);

  return (
    <section
      className={`
        section-basic-page
        section-main
        grid-rows-[1fr]
        h-fit
     `}
    >
      <div className="media-container col-span-6 md:col-start-2 md:col-span-4 md:col-start-2 lg:col-start-2 lg:col-span-3 h-fit self-center">
        <Media
          media={props.media.reference}
          aspectRatio="2/3"
          className={`w-full h-fit`}
        />
      </div>

      <div
        className={`col-span-6 lg:col-span-6 lg:col-start-6 grid grid-rows-[auto_1fr] gap-4 h-fit self-center
        `}
      >
        <div className="col-span-2 row-span-1 lg:col-span-2 lg:row-span-1">
          {title?.parsedValue && (
            <h2 className="text-title text-center lg:text-left">
              {title.parsedValue}
            </h2>
          )}
        </div>

        {props.first_column_text?.value && (
          <div
            className="col-span-2 md:col-span-1 lg:col-span-1 lg:row-span-1 
                  [&_p]:mb-4 
                  [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-4
                  [&_li]:ml-2
                 [&_a]:underline"
          >
            <RichText data={props.first_column_text.value} />
          </div>
        )}

        {props.second_column_text?.value && (
          <div
            className="col-span-2 md:col-span-1 lg:col-span-1 lg:row-span-1
          [&_p]:mb-4 
                  [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-4
                  [&_li]:ml-4
                 [&_a]:underline"
          >
            <RichText data={props.second_column_text.value} />
          </div>
        )}
      </div>
    </section>
  );
}

export const SECTION_BASIC_PAGE_FRAGMENT = `#graphql
  fragment SectionBasicPage on Metaobject {
    type

    title: field(key: "title") {
      key
      type
      value
    }

    first_column_text: field(key: "first_column_text") {
      key
      type
      value
    }

    second_column_text: field(key: "second_column_text") {
      key
      type
      value
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
`;
