import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL;

if (!endpoint) {
  throw new Error(
    'NEXT_PUBLIC_WP_GRAPHQL_URL is not set. Check your .env.local file.'
  );
}

/**
 * Singleton GraphQL client for WPGraphQL.
 * All queries go through this — one place to change auth headers,
 * timeouts, or the endpoint URL if the environment changes.
 * @type {GraphQLClient}
 */
export const wpClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});