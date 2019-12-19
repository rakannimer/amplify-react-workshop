/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAlbum = `query GetAlbum($id: ID!) {
  getAlbum(id: $id) {
    id
    name
    createdAt
    photos {
      items {
        id
        bucket
        name
        createdAt
        owner
      }
      nextToken
    }
    owner
  }
}
`;
export const listAlbums = `query ListAlbums(
  $filter: ModelAlbumFilterInput
  $limit: Int
  $nextToken: String
) {
  listAlbums(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      createdAt
      photos {
        nextToken
      }
      owner
    }
    nextToken
  }
}
`;
export const getPhoto = `query GetPhoto($id: ID!) {
  getPhoto(id: $id) {
    id
    album {
      id
      name
      createdAt
      photos {
        nextToken
      }
      owner
    }
    bucket
    name
    createdAt
    owner
  }
}
`;
export const listPhotos = `query ListPhotos(
  $filter: ModelPhotoFilterInput
  $limit: Int
  $nextToken: String
) {
  listPhotos(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      album {
        id
        name
        createdAt
        owner
      }
      bucket
      name
      createdAt
      owner
    }
    nextToken
  }
}
`;
