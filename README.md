- [Goals](#goals)
- [Install & configure AWS amplify:](#install-amp-configure-aws-amplify)
- [Setup a React app with CRA](#setup-a-react-app-with-cra)
  - [Add Semantic UI React](#add-semantic-ui-react)
  - [Replace placeholder UI with our own](#replace-placeholder-ui-with-our-own)
- [Initialize Amplify](#initialize-amplify)
- [Add a GraphQL API with Amplify](#add-a-graphql-api-with-amplify)
  - [Add an AWS AppSync API](#add-an-aws-appsync-api)
  - [Manage Albums UI](#manage-albums-ui)
- [Add Authentication](#add-authentication)
  - [Setup the auth front-end](#setup-the-auth-front-end)
  - [Recap : What we changed in App.js](#recap--what-we-changed-in-appjs)
  - [Try it out : Create an account](#try-it-out--create-an-account)
- [Connect the app to the AppSync API](#connect-the-app-to-the-appsync-api)
  - [Allow users to create albums](#allow-users-to-create-albums)
  - [Show a live list of albums](#show-a-live-list-of-albums)
  - [Allow users to click into an album to view its details](#allow-users-to-click-into-an-album-to-view-its-details)
  - [Try out the app](#try-out-the-app)
- [Add Cloud Storage](#add-cloud-storage)
  - [Manage photos](#manage-photos)
- [Refactor : move auth to React Context](#refactor--move-auth-to-react-context)
- [Extract labels from images using AI](#extract-labels-from-images-using-ai)
  - [Store labels in db](#store-labels-in-db)
- [Deploy](#deploy)

# Goals

In this workshop, we’ll build an app with quite a few features, including:

- Allowing user sign up and authentication, so we know who owns which photo albums

- Building an API server, so our front end has a way to load the appropriate albums and photos to show a given user

- Storing data about albums, photos, and permissions of who can view what, so that our API has a fast and reliable place to query and save data to

- Storing and serving photos, so we have a place to put all of the photos that users are uploading to albums

- Automatically detecting relevant labels for each uploaded photo and storing them.

# Install & configure AWS amplify:

```sh
npm install -g @aws-amplify/cli

amplify configure
```

More info on getting started [here](https://aws-amplify.github.io/docs/cli-toolchain/quickstart?sdk=js).

# Setup a React app with CRA

```
npx create-react-app photoalbums --use-npm; say done

cd photoalbums

git init

git add --all

git commit -m "initial react app with CRA"

npm start
```

## Add Semantic UI React

Semantic UI components for React provide components that will help us quickly build a nice UI interface.

```sh
npm i semantic-ui-react
```

In `public/index.html` add a link to the semantic-ui stylesheet from a CDN

```html
<head>
  <!-- ... -->
  <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.3/semantic.min.css"></link>
  <!-- ... -->
</head>

```

And restart the app :

```sh
npm start
```

Nothing should have changed by now

## Replace placeholder UI with our own

In `src/App.js` delete the entire file and replace it with :

```jsx
// src/App.js

import React from "react";
import { Header } from "semantic-ui-react";

const App = () => {
  return (
    <div>
      <Header as="h1">Hello World!</Header>
    </div>
  );
};

export default App;
```

As expected, the app now consists of a header that says Hello World.

Let's commit our changes before continuing :

```sh
git add --all
git commit -m "integrate react-semantic-ui and add hello world example"
```

# Initialize Amplify

```sh
amplify init

? Enter a name for the project photoalbums
? Enter a name for the environment dev
? Choose your default editor: Visual Studio Code
? Choose the type of app that you're building javascript
Please tell us about your project
? What javascript framework are you using react
? Source Directory Path: src
? Distribution Directory Path: build
? Build Command: npm run-script build
? Start Command: npm run-script start
? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use defaultoraprofile

```

This will create an amplify project locally and on the cloud that we will build on for the rest of our project.

Before we continue let's commit our progress :

```sh
git add --all

git commit -m "added amplify setup to react app"
```

# Add a GraphQL API with Amplify

We now want to create an API for creating albums entities.

These albums will only have a name at first.

> To build our API we’ll use AWS AppSync, a managed GraphQL service for building data-driven apps.
> If you’re not yet familiar with the basics of GraphQL, you should take a few minutes and check out https://graphql.github.io/learn/ before continuing,
> or use the site to refer back to when you have questions as you read along.

## Add an AWS AppSync API

```sh
amplify add api

? Please select from one of the below mentioned services: GraphQL
? Provide API name: photoalbums
? Choose the default authorization type for the API Amazon Cognito User Pool
Using service: Cognito, provided by: awscloudformation

 The current configured provider is Amazon Cognito.

? Do you want to use the default authentication and security configuration? Default configuration
 Warning: you will not be able to edit these selections.
? How do you want users to be able to sign in? Username
? Do you want to configure advanced settings? No, I am done.
Successfully added auth resource
? Do you want to configure advanced settings for the GraphQL API (Use arrow keys)
❯ No, I am done.
  Yes, I want to make some additional changes.
? Do you have an annotated GraphQL schema? (y/N) N
? Do you want a guided schema creation? Yes
  Single object with fields (e.g., “Todo” with ID, name, description)
❯ One-to-many relationship (e.g., “Blogs” with “Posts” and “Comments”)
  Objects with fine-grained access control (e.g., a project management app with
  owner-based authorization)
? Do you want to edit the schema now? (Y/n) Y
? Press enter to continue
```

Enter the following schema :

```graphql
type Album @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  name: String!
  createdAt: String!
  photos: [Photo] @connection(name: "AlbumPhotos")
}

type Photo @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  album: Album @connection(name: "AlbumPhotos")
  bucket: String!
  name: String!
  createdAt: String!
}
```

and press enter.

Before we continue let's commit our changes

```sh
git add --all
git commit -m "initialized offline amplify api"
```

And we can then push our changes to the cloud to have Amplify setup the API for us

```sh
amplify push

? Are you sure you want to continue? Yes
? Do you want to generate code for your newly created GraphQL API (Y/n) Y
```

In addition to the generated API, Amplify generated some code for us that we will examine later. But meanwhile let's commit our changes.

```sh
git add --all
git commit -m "added amplify codegen and deployed appsync api"
```

## Manage Albums UI

Let’s update our front-end to:

- allow users to create albums
- show a list of albums
- allow users to click into an album to view its details

To do that we'll need multiple routes. We can use `react-router-dom` to create and manage routes.

So let's install the dependencies

```sh
npm i react-router-dom @aws-amplify/datastore @aws-amplify/core lodash
```

First we setup the UI code without any interaction with the API:

```jsx
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
```

Running `npm start` now should show us the app without any logic attached to it.

Then let's commit our changes to git

```sh
git add --all
git commit -m "added UI code without connection to API."
```

Before we connect to the API we will need to allow users to authenticate.

# Add Authentication

Amplify makes it fast to add industrial strength authentication to our app.

## Setup the auth front-end

Amplify provides a solid set of tools that make this step extremely straight-forward.

We start by adding amplify front end dependencies :

```sh
npm install --save aws-amplify aws-amplify-react
```

And then we'll use the `withAuthenticator` higher-order React components to wrap our existing app component. This will take care of rendering a simple UI for letting users sign up, confirm their account, sign in, sign out, or reset their password.

In `src/App.js` import `withAuthenticator`and instead of exporting App we export withAuthenticator(App)

```jsx
// src/App.js

// ...
import { withAuthenticator } from "aws-amplify-react";
import Amplify from "@aws-amplify/core";
// This was added by amplify when we initialized it and added auth.
import aws_exports from "./aws-exports";
// We use the generated file to config Amplify with our desired settings
Amplify.configure(aws_exports);

// ...

const App = () => {
  // ...
  // ...
  // ...
};

export default withAuthenticator(App, { includeGreetings: true });
```

We can commit these small changes that adds authentication to our front-end UI

```sh
git add --all

git commit -m "add authentication ui"
```

## Recap : What we changed in App.js

- Imported and configured the AWS Amplify JS library

- Imported the withAuthenticator higher order component from aws-amplify-react

- Wrapped the App component using withAuthenticator

## Try it out : Create an account

Enter your information with a valid email (it will be used to send you a verification code).

Then login with the account you've created and you will get back to a page containing the App component and a header with your username and a link to log you out.

# Connect the app to the AppSync API

## Allow users to create albums

We start by importing createAlbum mutation and :

```jsx
import React from "react";
import { Grid, Header, Input, List, Segment } from "semantic-ui-react";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import sortBy from "lodash/sortBy";
import { withAuthenticator } from "aws-amplify-react";
import { createAlbum } from "./graphql/mutations";
import API, { graphqlOperation } from "@aws-amplify/api";
import Amplify from "aws-amplify";
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
```

## Show a live list of albums

In the previous section we've seen how to add new albums, the next logical step is to display a list of the added albums.

To do that we'll update our AlbumsListLoader to fetch albums data and listen to new updates.

```jsx
import Amplify, { Auth } from "aws-amplify";

import { onCreateAlbum } from "./graphql/subscriptions";
import { listAlbums } from "./graphql/queries";

const AlbumsListLoader = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [albums, setAlbums] = React.useState([]);
  React.useEffect(() => {
    setIsLoading(true);
    // Get initial albums list
    API.graphql(graphqlOperation(listAlbums)).then(albs => {
      setAlbums(albs.data.listAlbums.items);
      setIsLoading(false);
    });

    Auth.currentAuthenticatedUser().then(user => {
      // Listen to new albums being added
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
```

## Allow users to click into an album to view its details

```jsx
import { listAlbums, getAlbum } from "./graphql/queries";

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
```

By now we have a running app with a secure infinitely scalable API that syncs our data to DynamoDB on AWS .

Let's do a quick commit :

```sh
git add --all
git commit -m "working app with AppSync"
```

And now to add storage so we can store uploaded images in the cloud.

## Try out the app

Check out the app now and try out the new features:

View the list of albums

Create a new album and see it appear in the albums list

Click into an album to see the beginnings of our Album details view

When viewing an Album, click ‘Back to Albums list’ to go home

# Add Cloud Storage

We’ll need a place to store all of the photos that get uploaded to our albums. Amazon Simple Storage Service (S3) is a great option for this and Amplify’s Storage module makes setting up and working with S3 very easy

We'll start by adding the storage category to the amplify app.

```sh
$ amplify add storage


? Please select from one of the below mentioned services:

Content (Images, audio, video, etc.)


? Please provide a friendly name for your resource that will be used to label this category in the project: photoalbumsstorage


? Please provide bucket name: <accept the default value>


? Who should have access: Auth and guest users


? What kind of access do you want for Authenticated users?
◉ create/update
◉ read
◉ delete


? What kind of access do you want for Guest users?
◯ create/update
◉ read
◯ delete


? Do you want to add a Lambda Trigger for your S3 Bucket? No


? Select from the following options
Create a new function


? Do you want to edit the local S3Triggerxxxxxxx lambda function now? (Y/n)
No
```

And then we push our resources to the cloud as we usually do with :

```sh
amplify push
```

And then commit our changes :

```sh
git add --all
git commit -m "added storage category and sample lambda function"
```

## Manage photos

To be able to upload photos we'll create a S3ImageUpload component.

We'll need to bring in a small dependency to help us generate photo names :

```sh
npm install --save uuid
```

```jsx
// Rest of deps
import { Storage } from "aws-amplify";
import { S3Image } from "aws-amplify-react";
import { v4 as uuid } from "uuid";
import { Grid, Header, Input, List, Segment, Form } from "semantic-ui-react";

const uploadFile = async (event, albumId) => {
  const {
    target: { value, files }
  } = event;
  const user = await Auth.currentAuthenticatedUser();
  const fileForUpload = files[0];
  const file = fileForUpload || value;
  const extension = file.name.split(".")[1];
  const { type: mimeType } = file;
  const key = `images/${uuid()}${albumId}.${extension}`;
  try {
    await Storage.put(key, file, {
      contentType: mimeType,
      metadata: {
        owner: user.username,
        albumId
      }
    });
    console.log("successfully uploaded image!");
  } catch (err) {
    console.log("error: ", err);
  }
};

const S3ImageUpload = ({ album }) => {
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

const AlbumDetails = ({ album }) => {
  return (
    <Segment>
      <Header as="h3">{album.name}</Header>
      <S3ImageUpload album={album} />
      <p>TODO: Show photos for this album</p>
    </Segment>
  );
};
```

By adding this code we should be able to upload an image and view it in the AWS bucket we specified when setting up the Storage category. Check your s3 bucket (https://s3.console.aws.amazon.com/s3/home) to make sure your file is being uploaded as expected.

We still need to :

- Save the picture information as part of the album
- Retrieve and display pictures of an album

Let's start by saving the picture information to our AppSync API.

We will need to modify our uploadFile method :

```js
import { createAlbum, createPhoto } from "./graphql/mutations";

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
```

And to retrieve and display pictures of an album:

```jsx
import {
  Grid,
  Header,
  Input,
  List,
  Segment,
  Form,
  Divider
} from "semantic-ui-react";

const PhotosList = ({ photos }) => {
  return (
    <div>
      <Divider hidden />
      {photos.map(photo => (
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

const AlbumDetails = ({ album }) => {
  return (
    <Segment>
      <Header as="h3">{album.name}</Header>
      <S3ImageUpload albumId={album.id} />
      <PhotosList photos={album.photos} />
    </Segment>
  );
};
```

By now we still need to refresh the page to see the uploaded image on the page.

To directly have the photos be updated, we can either setup a subscription to new photo creation or to change events in the album.

Let's listen to the onCreatePhoto event for a more granular update.

But before we do, a quick commit :

```sh
git add --all
git commit -m "added s3 upload and display photo functionality"
```

AlbumDetailsLoader becomes

```jsx
const AlbumDetailsLoader = ({ id }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [album, setAlbum] = React.useState({});

  React.useEffect(() => {
    setIsLoading(true);
    API.graphql(graphqlOperation(getAlbum, { id })).then(albumDetails => {
      setIsLoading(false);
      setAlbum(albumDetails.data.getAlbum);
    });
    Auth.currentAuthenticatedUser().then(user => {
      API.graphql(
        graphqlOperation(onCreatePhoto, { owner: user.username })
      ).subscribe(photo => {
        const newPhoto = photo.value.data.onCreatePhoto;
        setAlbum(alb => {
          return { ...alb, photos: { items: [newPhoto, ...alb.photos.items] } };
        });
      });
    });
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return <AlbumDetails album={album} />;
};
```

# Refactor : move auth to React Context

Up till now we've been fetching the user's username in multiple components, in order to avoid having promises everywhere in our `useEffect`s let's store the user auth data in context.

To do that we'll store authentication credentials at the top level of our app

In our App component

```jsx
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
```

And we can then retrieve the username by using `useContext` for example AlbumsListLoader's effect becomes :

```jsx
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
```

And we commit before moving to the last part:

```sh
git add --all
git commit -m "moved auth data to context and cleanup in effects"
```

# Extract labels from images using AI

In our graphQL schema `amplify/backend/api/photoalbums/schema.graphql` let's tell amplify that we're interested in turning images to text.

```graphql
type Album @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  name: String!
  createdAt: String!
  photos: [Photo] @connection(name: "AlbumPhotos")
}

type Photo @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  album: Album @connection(name: "AlbumPhotos")
  bucket: String!
  name: String!
  createdAt: String!
}

type Query {
  convertImageToText: String @predictions(actions: [identifyLabels])
}
```

Then we ask amplify to create the needed resources on the cloud

```sh
amplify push
```

Now we can extract labels from uploaded images by simply running a graphQL query on our API.

In code this looks like the following :

```jsx
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
        photoAlbumId: albumId
      }
    })
  );
};
```

If you try it, it should output an array of labels describing the image.

## Store labels in db

As a last step let's add an array of strings to the graphql Photo type and display it in our UI.

We start by modifying the Photo graphQL type

```graphql
type Photo @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  album: Album @connection(name: "AlbumPhotos")
  bucket: String!
  name: String!
  createdAt: String!
  labels: [String]
}
```

and push

```sh
amplify push
```

And last we write the labels to our photo object after running the prediction in the `uploadFile` method

```js
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
```

And in our PhotosList component :

```jsx
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
```

And our final commit :

```sh
git add --all
git commit -m "added image labeling + labels storing and displaying"
```

# Deploy

We've built a simple single page application that can be deployed to any static file server.

To stick with AWS let's use Amplify to deploy it to a share-able URL, while keeping in mind that any provider would do.

```sh
amplify hosting add
? Select the environment setup: DEV (S3 only with HTTP)
? hosting bucket name photoalbums-20191221083147-hostingbucket
? index doc for the website index.html
? error doc for the website index.html

amplify publish

```

And this deploys our site to a unique development URL : http://photoalbums-20191221083147-hostingbucket-dev.s3-website-us-east-1.amazonaws.com/
