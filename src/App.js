import React from "react";
import {
  Grid,
  Header,
  Input,
  List,
  Segment,
  Form,
  Divider,
  HeaderSubheader
} from "semantic-ui-react";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import sortBy from "lodash/sortBy";
import { withAuthenticator, S3Image } from "aws-amplify-react";
import { createAlbum, createPhoto } from "./graphql/mutations";
import { onCreateAlbum, onCreatePhoto } from "./graphql/subscriptions";
import { listAlbums, getAlbum, convertImageToText } from "./graphql/queries";
import API, { graphqlOperation } from "@aws-amplify/api";
import Amplify, { Auth, Storage } from "aws-amplify";
import { v4 as uuid } from "uuid";

import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

const uploadFile = async (event, albumId, username) => {
  const {
    target: { value, files }
  } = event;
  const fileForUpload = files[0];
  const file = fileForUpload || value;
  const extension = file.name.split(".")[1];
  const { type: mimeType } = file;
  const key = `images/${uuid()}${albumId}.${extension}`;
  let s3Obj;
  try {
    s3Obj = await Storage.put(key, file, {
      contentType: mimeType,
      metadata: {
        owner: username,
        albumId
      }
    });
    console.log("successfully uploaded image!");
  } catch (err) {
    console.log("error: ", err);
    return;
  }
  const s3ImageKey = s3Obj.key;
  const predictionResult = await API.graphql(
    graphqlOperation(convertImageToText, {
      input: {
        identifyLabels: {
          key: s3ImageKey
        }
      }
    })
  );
  const imageLabels = predictionResult.data.convertImageToText;
  console.warn({ imageLabels });

  await API.graphql(
    graphqlOperation(createPhoto, {
      input: {
        bucket: awsconfig.aws_user_files_s3_bucket,
        name: key,
        createdAt: `${Date.now()}`,
        photoAlbumId: albumId,
        labels: imageLabels
      }
    })
  );
};

const S3ImageUpload = ({ albumId }) => {
  const { username } = React.useContext(UserContext);
  const [isUploading, setIsUploading] = React.useState(false);
  const onChange = async event => {
    setIsUploading(true);

    let files = [];
    for (var i = 0; i < event.target.files.length; i++) {
      files.push(event.target.files.item(i));
    }
    await Promise.all(files.map(f => uploadFile(event, albumId, username)));

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
  const { username } = React.useContext(UserContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const [album, setAlbum] = React.useState({});

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    API.graphql(graphqlOperation(getAlbum, { id })).then(albumDetails => {
      if (!isMounted) return;
      setIsLoading(false);
      setAlbum(albumDetails.data.getAlbum);
    });
    const sub = API.graphql(
      graphqlOperation(onCreatePhoto, { owner: username })
    ).subscribe(photo => {
      const newPhoto = photo.value.data.onCreatePhoto;
      setAlbum(alb => {
        return { ...alb, photos: { items: [newPhoto, ...alb.photos.items] } };
      });
    });
    return () => {
      sub.unsubscribe();
      isMounted = false;
    };
  }, [id, username]);

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
  const { username } = React.useContext(UserContext);
  React.useEffect(() => {
    let isMounted = true;
    if (!username) return;
    setIsLoading(true);
    API.graphql(graphqlOperation(listAlbums)).then(albs => {
      if (!isMounted) return;
      setAlbums(albs.data.listAlbums.items);
      setIsLoading(false);
    });
    const sub = API.graphql(
      graphqlOperation(onCreateAlbum, { owner: username })
    ).subscribe(newAlbum => {
      const albumRecord = newAlbum.value.data.onCreateAlbum;
      setAlbums(albs => [...albs, albumRecord]);
    });
    return () => {
      sub.unsubscribe();
      isMounted = false;
    };
  }, [username]);
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
          <div style={{ display: "inline-block", padding: 20 }}>
            <S3Image
              theme={{
                photoImg: {
                  width: 100
                }
              }}
              key={photo.name}
              imgKey={photo.name}
              style={{ display: "flex", justifyContent: "center" }}
            />
            Label : {photo.labels && photo.labels.join(" ")}
          </div>
        ))}
    </div>
  );
};

const UserContext = React.createContext({ username: null });

const App = () => {
  const [user, setUser] = React.useState({ username: null });
  React.useEffect(() => {
    Auth.currentAuthenticatedUser().then(user => {
      setUser(user);
    });
  }, []);
  return (
    <UserContext.Provider value={user}>
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
    </UserContext.Provider>
  );
};

export default withAuthenticator(App);
