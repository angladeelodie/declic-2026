import {SECTION_HERO_FRAGMENT, SectionHero} from '~/sections/SectionHero';
import {
  SECTION_EDITORIAL_FRAGMENT,
  SectionEditorial,
} from '~/sections/SectionEditorial';

import {
  SECTION_FEATURED_PRODUCTS_FRAGMENT,
  SectionFeaturedProducts,
} from '~/sections/SectionFeaturedProducts';
import {
  SECTION_FEATURED_COLLECTIONS_FRAGMENT,
  SectionFeaturedCollections,
} from '~/sections/SectionFeaturedCollections';

import {SECTION_LOOKS_SLIDER_FRAGMENT} from './SectionLooksSlider';

import {SECTION_OUTFITS_AND_MEDIA_FRAGMENT} from '~/sections/SectionOutfitsAndMedia';
import {SECTION_ITEMS_GRID_FRAGMENT} from '~/sections/SectionItemsGrid';
import {SECTION_CONFIGURATOR_FRAGMENT} from './SectionConfigurator';
import {EDITORIAL_MEDIA_METAOBJECT_FRAGMENT} from '~/lib/mediaFragment';
import {SectionOutfitsAndMedia} from './SectionOutfitsAndMedia';
import {SectionItemsGrid} from './SectionItemsGrid';
import {SectionLooksSlider} from './SectionLooksSlider';
import {SectionConfigurator} from './SectionConfigurator';
import type {SectionsFragment} from 'storefrontapi.generated';
import {Reveal} from '~/components/Reveal';

export function Sections({sections}: {sections: SectionsFragment}) {
  return (
    <div className="sections">
      {sections?.references?.nodes.map((section) => {
        // We determine WHICH component to show
        let sectionComponent = null;

        switch (section.type) {
          case 'section_hero':
            sectionComponent = <SectionHero {...section} />;
            break;
          case 'section_editorial':
            sectionComponent = <SectionEditorial {...section} />;
            break;
          case 'section_featured_products':
            sectionComponent = <SectionFeaturedProducts {...section} />;
            break;
          case 'section_featured_collections':
            sectionComponent = <SectionFeaturedCollections {...section} />;
            break;
          case 'section_looks_slider':
            sectionComponent = <SectionLooksSlider {...section} />;
            break;
          case 'section_outfits_and_media':
            sectionComponent = <SectionOutfitsAndMedia {...section} />;
            break;
          case 'section_items_grid':
            sectionComponent = <SectionItemsGrid {...section} />;
            break;
          case 'section_configurator':
            sectionComponent = <SectionConfigurator {...section} />;
            break;
          default:
            console.log(`Unsupported section type: ${section.type}`);
            return null;
        }

        // 2. We wrap that component in the Reveal logic
        return <Reveal key={section.id}>{sectionComponent}</Reveal>;
      })}
    </div>
  );
}

// app/sections/Sections.tsx
export const SECTIONS_FRAGMENT = `#graphql
  fragment Sections on Metafield {
    references(first: 10) {
      nodes {
        ... on Metaobject {
          id
          type
          ...SectionHero
          ...SectionEditorial
          ...SectionFeaturedProducts
          ...SectionFeaturedCollections
          ...SectionLooksSlider 
          ...SectionOutfitsAndMedia
          ...SectionItemsGrid
          ...SectionConfigurator
      }
      }
    }
  }

  # All section fragments
  ${EDITORIAL_MEDIA_METAOBJECT_FRAGMENT}
  ${SECTION_HERO_FRAGMENT}
  ${SECTION_EDITORIAL_FRAGMENT}
  ${SECTION_FEATURED_PRODUCTS_FRAGMENT}
  ${SECTION_FEATURED_COLLECTIONS_FRAGMENT}
  ${SECTION_OUTFITS_AND_MEDIA_FRAGMENT}
  ${SECTION_ITEMS_GRID_FRAGMENT}
  ${SECTION_LOOKS_SLIDER_FRAGMENT}
  ${SECTION_CONFIGURATOR_FRAGMENT}
` as const;
