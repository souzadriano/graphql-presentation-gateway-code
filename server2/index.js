const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");

const messages = [
    {
        id: 1,
        userId: 1,
        text: "I don’t want to kill anyone. I don’t like bullies; I don’t care where they’re from."
    },
    {
        id: 2,
        userId: 1,
        text: "I can do this all day."
    },
    {
        id: 3,
        userId: 2,
        text: "Give me a scotch. I’m starving."
    },
    {
        id: 4,
        userId: 2,
        text: "I told you. I don’t want to join your super secret boy band."
    }
]

const app = express();

const typeDefs = gql`

  type Message {
    id: ID!
    userId: ID!
    text: String!
  }

  type Query {
    messages: [Message]
    message(id: ID!): Message
    messagesByUser(userId: ID!): [Message]
  }
`;

const resolvers = {
  Query: {
    messages: async (parent, args, context) => {
      return messages;
    },
    message: async (parent, { id }, context) => {
      return messages.find((message) => message.id == id);
    },
    messagesByUser: async (parent, { userId }, context) => {
      return messages.filter((message) => message.userId == userId);
    }
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true
});

server.applyMiddleware({ app });

app.listen({ port: 4002 }, () =>
  console.log(`Server ready at http://localhost:4002${server.graphqlPath}`)
);
