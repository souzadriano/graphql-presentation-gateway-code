const { ApolloServer, gql } = require("apollo-server-express");
const { buildFederatedSchema } = require("@apollo/federation");
const express = require("express");
const { createBatchResolver } = require("graphql-resolve-batch");
const { RESTDataSource } = require("apollo-datasource-rest");

const app = express();

const typeDefs = gql`
  type Char @key(fields: "id") {
    id: ID!
    name: String!
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    chars: [Char]
  }

  extend type Query {
    chars: [Char]
    char(id: ID!): Char
  }
`;

const resolvers = {
  Query: {
    chars: async (parent, args, { dataSources }) => {
      return dataSources.charsAPI.getChars();
    },
    char: async (parent, { id }, { dataSources }) => {
      return dataSources.charsAPI.getChar(id);
    }
  },
  User: {
    chars: createBatchResolver(async (users, args, { dataSources }) => {
      return users.map(user => dataSources.charsAPI.getByUser(user.id));
    })
  }
};

class CharsAPI extends RESTDataSource {
  get baseURL() {
    return `http://localhost:4003/chars`;
  }
  async getChars() {
    return this.get("");
  }
  async getChar(id) {
    return this.get(`${id}`);
  }
  async getByUser(userId) {
    return this.get(`users/${userId}`);
  }
}

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ]),
  dataSources: () => {
    return {
      charsAPI: new CharsAPI()
    };
  },
  introspection: true
});

server.applyMiddleware({ app });

app.listen({ port: 4004 }, () =>
  console.log(`Server ready at http://localhost:4004${server.graphqlPath}`)
);
