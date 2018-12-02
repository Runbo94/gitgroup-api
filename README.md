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
    - Header should have {authorization: user_access_token}.
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

- _/project/name/:projectId_
  - Function: Get the project name with given the project ID.
  - Response:
    ```
    project_name
    ```

### Repository

- _GET /repos_
  - Function: Get all the repositories of the user
  - Response:
    ```JOSN
    [
        {
            "repository_id": "repository_github_node_id",
            "name": "repository_name",
            "owner_id": "owner_name",
            "description": "repository_description",
            "_url": "https://github.com/owner_name/repository_name",
            "issues": [
                {
                    "issueId": "issue_github_node_id",
                    "title": "issue_title",
                    "body": "issue_body",
                    "owner": "owner_name",
                    "repos": "repository_name",
                    "state": "open",
                    "number": 1
                }
            ]
        }
    ]
    ```

### User

- _GET /user_
  - Function: Get the user information who holds this authorization token
  - Response:
    ```JSON
    {
        "id": "user_github_node_id",
        "name": "user_name",
        "repositories": [
            {
                "repository_id": "repository_github_node_id",
                "name": "repository_name",
                "owner_id": "owner_name",
                "description": "repository_description",
                "_url": "https://github.com/owner_name/repository_name",
                "issues": [
                    {
                        "issueId": "issue_github_node_id",
                        "title": "issue_title",
                        "body": "issue_body",
                        "owner": "owner_name",
                        "repos": "repository_name",
                        "state": "open",
                        "number": 1
                    }
                ]
            }
        ],
        "projects": [
            {
                "id": "project_mongo_id",
                "name": "project_name",
                "ownerId": "owner_github_node_id"
            }
        ]
    }
    ```

### Issue

- _GET /host/issues/:username/:repository_name_
  - Function: Get all the issues for the repository.
  - Response:
    ```JSON
    [
        {
            "issueId": "issue_github_node_id",
            "title": "issue_name",
            "body": "issue_body",
            "owner": "owner_name",
            "repos": "repository_name",
            "state": "open",
            "number": 1
        }
    ]
    ```
- _GET http://localhost:8000/issues/project\_issues/:username/:projectId_
  - Function: Get all the issues for the given project ID.
  - Response:
    ```JSON
    [
        {
            "issueId": "issue_github_node_id",
            "title": "issue_name",
            "body": "issue_body",
            "owner": "owner_name",
            "repos": "repository_name",
            "state": "open",
            "number": 1
        }
    ]
    ```
- _GET /close/:userName/:reposName/:issueId_
  - Function: Close the issue.

### Card

### Kanban
