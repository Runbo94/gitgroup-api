# Developer Guide

## GitHub API

**Repositories**<br>
This application will be able to **read and write all public and private repository data**. This includes the following:

- Code
- Issues
- Pull requests
- Wikis
- Settings
- Webhooks and services
- Deploy keys
- Collaboration invites

[API referrence](https://developer.github.com/v3/repos/)

## How to Start The Server

You need clone this repository first, then install dependencies.<br>

```
> cd gitgroup-api
> npm install
```

When you develop this project, you can just use ts-node in order to run the server.

```
npm run dev
```

When you test the code.

```
npm run test
```

The following commands are just required when you distribute the app

```
npm run build
npm run start
```

## API list

### Project

- _POST /project/new_

  - Function: Create a new project.
  - body: {*name, *description, \*repositories}
  - Note:
    - Header should have {authorization: user_access_token}
  - Response:
    ```JSON
    {
        "_id": "user_mongodb_id",
        "node_id": "user_github_node_id",
        "name": "user_name",
        "projects": [
            {
                "_id": "created_project_mongodb_id",
                "kanbanIds": [],
                "repositories": [{
                        "_id": "repository_mongodb_id",
                        "repository_id": "repository_github_id",
                        "name": "repository_name",
                        "owner_id": "owner_name",
                        "description": "repository_description",
                        "_url": "https://github.com/username/repositoryname"
                    }],
                "name": "created_project_name",
                "description": "created_project_description",
                "owner_id": "owner_github_node_id"
            }
        ],
        "repository": []
    }
    ```

### User

- _GET /user_ - get the user information who holds this authorization token

### Repository

- _GET /repos_ - get all repositories of the owner
