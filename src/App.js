import React from "react";
import {
  Grid,
  Header,
  Input,
  List,
  Segment,
  Form,
  Divider
} from "semantic-ui-react";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import sortBy from "lodash/sortBy";
import { withAuthenticator, S3Image } from "aws-amplify-react";
import { createAlbum, createPhoto } from "./graphql/mutations";
import { onCreateAlbum } from "./graphql/subscriptions";
import { listAlbums, getAlbum } from "./graphql/queries";
import API, { graphqlOperation } from "@aws-amplify/api";
import Amplify, { Auth, Storage } from "aws-amplify";
import { v4 as uuid } from "uuid";

import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

const uploadFile = async (event, albumId) => {
  const {
    target: { value, files }
  } = event;
  const fileForUpload = files[0];
  const file = fileForUpload || value;
  const extension = file.name.split(".")[1];
  const { type: mimeType } = file;
  const key = `images/${uuid()}${albumId}.${extension}`;
  try {
    await Storage.put(key, file, {
      contentType: mimeType
    });
    console.log("successfully uploaded image!");
  } catch (err) {
    console.log("error: ", err);
  }
  await API.graphql(
    graphqlOperation(createPhoto, {
      input: {
        bucket: awsconfig.aws_user_files_s3_bucket,
        name: key,
        createdAt: `${Date.now()}`,
        photoAlbumId: albumId
      }
    })
  );
};

const S3ImageUpload = ({ albumId }) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const onChange = async event => {
    setIsUploading(true);

    let files = [];
    for (var i = 0; i < event.target.files.length; i++) {
      files.push(event.target.files.item(i));
    }
    await Promise.all(files.map(f => uploadFile(event, albumId)));

    setIsUploading(false);
  };
  return (
    <div>
      <Form.Button
        onClick={() => document.getElementById("add-image-file-input").click()}
        disabled={isUploading}
        icon="file image outline"
        content={isUploading ? "Uploading..." : "Add Images"}
      />
      <input
        id="add-image-file-input"
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

const NewAlbum = () => {
  const [albumName, setAlbumName] = React.useState("");
  const handleSubmit = async () => {
    console.log(`Creating album ${albumName} `);
    await API.graphql(
      graphqlOperation(createAlbum, {
        input: {
          name: albumName,
          createdAt: `${Date.now()}`
        }
      })
    );
    setAlbumName("");
  };
  const handleChange = event => {
    setAlbumName(event.target.value);
  };
  return (
    <Segment>
      <Header as="h3">Add a new album</Header>
      <Input
        type="text"
        placeholder="New Album Name"
        icon="plus"
        iconPosition="left"
        action={{ content: "Create", onClick: handleSubmit }}
        name="albumName"
        value={albumName}
        onChange={handleChange}
      />
    </Segment>
  );
};

const AlbumsList = ({ albums = [] }) => {
  return (
    <Segment>
      <Header as="h3">My Albums</Header>
      <List divided relaxed>
        {sortBy(albums, ["createdAt"]).map(album => (
          <List.Item key={album.id}>
            <NavLink to={`/albums/${album.id}`}>{album.name}</NavLink>
          </List.Item>
        ))}
      </List>
    </Segment>
  );
};
const AlbumDetailsLoader = ({ id }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [album, setAlbum] = React.useState({});

  React.useEffect(() => {
    setIsLoading(true);
    API.graphql(graphqlOperation(getAlbum, { id })).then(albumDetails => {
      setIsLoading(false);
      setAlbum(albumDetails.data.getAlbum);
    });
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return <AlbumDetails album={album} />;
};

const AlbumDetails = ({ album }) => {
  return (
    <Segment>
      <Header as="h3">{album.name}</Header>
      <S3ImageUpload albumId={album.id} />
      <PhotosList photos={album.photos} />
    </Segment>
  );
};

const AlbumsListLoader = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [albums, setAlbums] = React.useState([]);
  React.useEffect(() => {
    setIsLoading(true);
    API.graphql(graphqlOperation(listAlbums)).then(albs => {
      setAlbums(albs.data.listAlbums.items);
      setIsLoading(false);
    });

    Auth.currentAuthenticatedUser().then(user => {
      API.graphql(
        graphqlOperation(onCreateAlbum, { owner: user.username })
      ).subscribe(newAlbum => {
        const albumRecord = newAlbum.value.data.onCreateAlbum;
        setAlbums(albs => [...albs, albumRecord]);
      });
    });
  }, []);
  if (isLoading) return null;
  return <AlbumsList albums={albums} />;
};

const PhotosList = ({ photos }) => {
  return (
    <div>
      <Divider hidden />
      {photos &&
        photos.items &&
        photos.items.map(photo => (
          <S3Image
            theme={{
              photoImg: {
                width: 100
              }
            }}
            key={photo.name}
            imgKey={photo.name}
            style={{ display: "inline-block" }}
          />
        ))}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Grid padded>
        <Grid.Column>
          <Route path="/" exact component={NewAlbum} />
          <Route path="/" exact component={AlbumsListLoader} />

          <Route
            path="/albums/:albumId"
            render={() => (
              <div>
                <NavLink to="/">Back to Albums list</NavLink>
              </div>
            )}
          />
          <Route
            path="/albums/:albumId"
            render={props => (
              <AlbumDetailsLoader id={props.match.params.albumId} />
            )}
          />
        </Grid.Column>
      </Grid>
    </Router>
  );
};

export default withAuthenticator(App);
