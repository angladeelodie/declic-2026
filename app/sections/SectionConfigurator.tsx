
import type {ParsedMetafields} from '@shopify/hydrogen';
import {parseSection} from '~/utils/parseSection';
import type {SectionConfiguratorFragment} from 'storefrontapi.generated';



export function SectionConfigurator(
    props: SectionConfiguratorFragment,
) {
  const {title, description} = props;

  console.log('SectionConfigurator props:', props);

  return (
    <section
      className={`
        section-configurator
        section-main
        grid-rows-[1fr]
     `}
    >
    <h1>Configurator</h1>
    </section>
  );
}




export const SECTION_CONFIGURATOR_FRAGMENT = `#graphql
  fragment SectionConfigurator on Metaobject {
    type
    title: field(key: "title") {
      key
      type
      value
    }
    description: field(key: "description") {
      key
      type
      value
    }

   
  }
`;