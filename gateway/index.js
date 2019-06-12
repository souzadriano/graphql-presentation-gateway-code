const { ApolloServer, gql } = require("apollo-server-express");
const { ApolloGateway } = require("@apollo/gateway");
const express = require("express");

const gateway = new ApolloGateway({
  serviceList: [
    { name: "users", url: "http://localhost:4001/graphql" },
    { name: "messages", url: "http://localhost:4002/graphql" }
  ]
});

(async () => {
  const app = express();
  const { schema, executor } = await gateway.load();
  const server = new ApolloServer({ schema, executor });
  server.applyMiddleware({ app });
  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
})();
