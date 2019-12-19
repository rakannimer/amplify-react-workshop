import React from "react";
import { Grid, Header, Input, List, Segment } from "semantic-ui-react";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import sortBy from "lodash/sortBy";

const NewAlbum = () => {
  const [albumName, setAlbumName] = React.useState("");
  const handleSubmit = () => {
    console.log(`Creating album ${albumName} `);
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
  const [isLoading] = React.useState(true);
  const [album] = React.useState({});
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
  const [isLoading] = React.useState(true);
  const [albums] = React.useState([]);
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

export default App;
