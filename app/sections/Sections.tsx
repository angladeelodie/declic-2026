import {SECTION_HERO_FRAGMENT, SectionHero} from '~/sections/SectionHero';
import {SECTION_EDITORIAL_FRAGMENT, SectionEditorial} from '~/sections/SectionEditorial';

import {
  SECTION_FEATURED_PRODUCTS_FRAGMENT,
  SectionFeaturedProducts,
} from '~/sections/SectionFeaturedProducts';
import {
  SECTION_FEATURED_COLLECTIONS_FRAGMENT,
  SectionFeaturedCollections,
} from '~/sections/SectionFeaturedCollections';
import {SECTION_STORES_FRAGMENT, SectionStores} from '~/sections/SectionStores';
import {
  SECTION_STORE_PROFILE_FRAGMENT,
  SectionStoreProfile,
} from '~/sections/SectionStoreProfile';
import{ SECTION_OUTFITS_AND_MEDIA_FRAGMENT } from '~/sections/SectionOutfitsAndMedia';
import type {SectionsFragment} from 'storefrontapi.generated';
import { SectionOutfitsAndMedia } from './SectionOutfitsAndMedia';
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
          case 'section_stores_grid':
            sectionComponent = <SectionStores {...section} />;
            break;
          case 'section_store_profile':
            sectionComponent = <SectionStoreProfile {...section} />;
            break;
          case 'section_outfits_and_media':
            sectionComponent = <SectionOutfitsAndMedia {...section} />;
            break;
          default:
            console.log(`Unsupported section type: ${section.type}`);
            return null;
        }

        // 2. We wrap that component in the Reveal logic
        return (
          <Reveal key={section.id}>
            {sectionComponent}
          </Reveal>
        );
      })}
    </div>
  );
}

export const SECTIONS_FRAGMENT = `#graphql
  fragment Sections on MetaobjectField {
    ... on MetaobjectField {
      references(first: 10) {
        nodes {
          ... on Metaobject {
            id
            type
            ...SectionHero
            ...SectionEditorial
            ...SectionFeaturedProducts
            ...SectionFeaturedCollections
            ...SectionStores
            ...SectionStoreProfile
            ...SectionOutfitsAndMedia
          }
        }
      }
    }
  }
  # All section fragments
  ${SECTION_HERO_FRAGMENT}
  ${SECTION_EDITORIAL_FRAGMENT}
  ${SECTION_FEATURED_PRODUCTS_FRAGMENT}
  ${SECTION_FEATURED_COLLECTIONS_FRAGMENT}
  ${SECTION_STORES_FRAGMENT}
  ${SECTION_STORE_PROFILE_FRAGMENT}
  ${SECTION_OUTFITS_AND_MEDIA_FRAGMENT} 
  `;