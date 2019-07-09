const { ApolloServer, gql } = require("apollo-server-express");
const { buildFederatedSchema } = require("@apollo/federation");
const express = require("express");

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
    __resolveReference(object) {
      console.log(object);
      return users.find(user => user.id === parseInt(object.id, 10));
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ]),
  introspection: true
});

server.applyMiddleware({ app });

app.listen({ port: 4001 }, () =>
  console.log(`Server ready at http://localhost:4001${server.graphqlPath}`)
);
