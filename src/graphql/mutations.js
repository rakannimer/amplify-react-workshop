/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createAlbum = `mutation CreateAlbum(
  $input: CreateAlbumInput!
  $condition: ModelAlbumConditionInput
) {
  createAlbum(input: $input, condition: $condition) {
    id
    name
    createdAt
    photos {
      items {
        id
        bucket
        name
        createdAt
        labels
        owner
      }
      nextToken
    }
    owner
  }
}
`;
export const updateAlbum = `mutation UpdateAlbum(
  $input: UpdateAlbumInput!
  $condition: ModelAlbumConditionInput
) {
  updateAlbum(input: $input, condition: $condition) {
    id
    name
    createdAt
    photos {
      items {
        id
        bucket
        name
        createdAt
        labels
        owner
      }
      nextToken
    }
    owner
  }
}
`;
export const deleteAlbum = `mutation DeleteAlbum(
  $input: DeleteAlbumInput!
  $condition: ModelAlbumConditionInput
) {
  deleteAlbum(input: $input, condition: $condition) {
    id
    name
    createdAt
    photos {
      items {
        id
        bucket
        name
        createdAt
        labels
        owner
      }
      nextToken
    }
    owner
  }
}
`;
export const createPhoto = `mutation CreatePhoto(
  $input: CreatePhotoInput!
  $condition: ModelPhotoConditionInput
) {
  createPhoto(input: $input, condition: $condition) {
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
    labels
    owner
  }
}
`;
export const updatePhoto = `mutation UpdatePhoto(
  $input: UpdatePhotoInput!
  $condition: ModelPhotoConditionInput
) {
  updatePhoto(input: $input, condition: $condition) {
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
    labels
    owner
  }
}
`;
export const deletePhoto = `mutation DeletePhoto(
  $input: DeletePhotoInput!
  $condition: ModelPhotoConditionInput
) {
  deletePhoto(input: $input, condition: $condition) {
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
    labels
    owner
  }
}
`;
