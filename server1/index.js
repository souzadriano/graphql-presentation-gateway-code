const { ApolloServer, gql } = require("apollo-server-express");
const { buildFederatedSchema } = require("@apollo/federation");
const express = require("express");
const DataLoader = require("dataloader");

const app = express();

const users = [
  {
    id: 1,
    name: "Steve Rogers",
    age: 30
  },
  {
    id: 2,
    name: "Tony Stark",
    age: 40
  }
];

const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    name: String!
    age: Int
  }
  extend type Query {
    users: [User]
    user(id: ID!): User
  }
`;

const resolvers = {
  Query: {
    users: (parent, args, context) => {
      return users;
    },
    user: (parent, { id }, context) => {
      return users.find(user => user.id == id);
    }
  },
  User: {
    __resolveReference: async (reference, { loaders }) =>
      loaders.users.load(parseInt(reference.id, 10))
  }
};

const getUsers = ids => {
  return Promise.resolve(users.filter(user => ids.indexOf(user.id) > -1));
};

const createLoaders = () => {
  return {
    users: new DataLoader(ids => getUsers(ids))
  };
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ]),
  introspection: true,
  context: async ({ req }) => {
    return { loaders: createLoaders() };
  }
});

server.applyMiddleware({ app });

app.listen({ port: 4001 }, () =>
  console.log(`Server ready at http://localhost:4001${server.graphqlPath}`)
);
