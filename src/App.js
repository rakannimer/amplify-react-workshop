import React from "react";
import { Grid, Header, Input, List, Segment } from "semantic-ui-react";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import sortBy from "lodash/sortBy";
import { withAuthenticator } from "aws-amplify-react";
import { createAlbum } from "./graphql/mutations";
import { onCreateAlbum } from "./graphql/subscriptions";
import { listAlbums, getAlbum } from "./graphql/queries";
import API, { graphqlOperation } from "@aws-amplify/api";
import Amplify, { Auth } from "aws-amplify";

import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

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
      <p>TODO: Allow photo uploads</p>
      <p>TODO: Show photos for this album</p>
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
