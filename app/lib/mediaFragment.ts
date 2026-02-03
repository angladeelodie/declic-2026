// app/lib/mediaFragments.ts

export const EDITORIAL_MEDIA_METAOBJECT_FRAGMENT = `#graphql
  fragment EditorialMediaMetaobject on Metaobject {
    media: field(key: "media") {
      key
      type
      reference {
        __typename
        ... on MediaImage {
          image {
            altText
            url
            width
            height
          }
        }
        ... on Video {
          id
          sources {
            url
            mimeType
          }
          previewImage {
            url
          }
        }
      }
    }

    style_index: field(key: "corner_style") {
      key
      type
      value
    }
  }
`;