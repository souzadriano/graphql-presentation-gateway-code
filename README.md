# GraphQL Presentation Code

## Servers

- Server 1: User graphql api
- Server 2: Message graphql api
- Server 3: Char rest api
- Server 4: Char graphql api
- Gateway: Graphql Federation - unify server 1, 2 and 4 in one schema

## Requirements

- Node.js v10.15.0+
- Yarn

## Install

```bash

yarn install

```

## Start Servers

```bash

node server1/index.js
node server2/index.js
node server3/index.js
node server4/index.js

```

## Start Gateway

```bash

node gateway/index.js

```
