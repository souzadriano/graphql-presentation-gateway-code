const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const { createBatchResolver } = require('graphql-resolve-batch');
const {
	makeRemoteExecutableSchema,
	introspectSchema,
	mergeSchemas,
} = require('graphql-tools');
const fetch = require('node-fetch');
const { HttpLink } = require('apollo-link-http');
const { RESTDataSource } = require('apollo-datasource-rest');

const app = express();

const makeMergedSchema = async () => {
	const UserLink = new HttpLink({
		uri: 'http://localhost:4001/graphql',
		fetch,
	});
	const UserSchema = makeRemoteExecutableSchema({
		schema: await introspectSchema(UserLink),
		link: UserLink,
	});

	const MessageLink = new HttpLink({
		uri: 'http://localhost:4002/graphql',
		fetch,
	});
	const MessageSchema = makeRemoteExecutableSchema({
		schema: await introspectSchema(MessageLink),
		link: MessageLink,
	});

	const LinkSchema = `
        extend type Message {
            user: User
        }

        extend type User {
            messages: [Message]
            chars: [Char]
        }

        type Char {
            id: ID!
            name: String!
        }

        extend type Query {
            chars: [Char]
            char(id: ID!): [Char]
        }
    `;
	const mergedSchema = mergeSchemas({
		schemas: [UserSchema, MessageSchema, LinkSchema],
		resolvers: {
			Message: {
				user: async (parent, args, context, info) => {
                    return await info.mergeInfo.delegateToSchema({
                        schema: UserSchema,
                        operation: 'query',
                        fieldName: 'user',
                        args: {
                            id: parent.userId,
                        },
                        context,
                        info,
                    });
				},
			},
			User: {
				messages: async (parent, args, context, info) => {
                    const messages = await info.mergeInfo.delegateToSchema({
                        schema: MessageSchema,
                        operation: 'query',
                        fieldName: 'messagesByUser',
                        args: {
                            userId: parent.id,
                        },
                        context,
                        info,
                    });
                    return messages;
                },
                chars: async (parent, args, { dataSources }) => {
                    return dataSources.charsAPI.getByUser(parent.id);
                },
            },
            Query: {
                chars: async (parent, args, { dataSources }) => {
                    return dataSources.charsAPI.getChars();
                },
                char: async (parent, { id }, { dataSources }) => {
                    return dataSources.charsAPI.getChar(id);
                }
            }
		},
	});
	return mergedSchema;
};

class CharsAPI extends RESTDataSource {
	get baseURL() {
		return `http://localhost:4003/chars`;
	}
	async getChars() {
		return this.get('');
	}
	async getChar(id) {
		return this.get(`${id}`);
	}
	async getByUser(userId) {
		return this.get(`users/${userId}`);
	}
}

makeMergedSchema().then((schema) => {
    const server = new ApolloServer({
      schema,
      dataSources: () => {
        return {
            charsAPI: new CharsAPI(),
        };
      }
    });
    
    server.applyMiddleware({ app });
    
    app.listen({ port: 4000 }, () =>
      console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
    );
})
