/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateAlbum = `subscription OnCreateAlbum($owner: String!) {
  onCreateAlbum(owner: $owner) {
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
export const onUpdateAlbum = `subscription OnUpdateAlbum($owner: String!) {
  onUpdateAlbum(owner: $owner) {
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
export const onDeleteAlbum = `subscription OnDeleteAlbum($owner: String!) {
  onDeleteAlbum(owner: $owner) {
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
export const onCreatePhoto = `subscription OnCreatePhoto($owner: String!) {
  onCreatePhoto(owner: $owner) {
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
export const onUpdatePhoto = `subscription OnUpdatePhoto($owner: String!) {
  onUpdatePhoto(owner: $owner) {
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
export const onDeletePhoto = `subscription OnDeletePhoto($owner: String!) {
  onDeletePhoto(owner: $owner) {
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
