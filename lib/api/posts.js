import { gql } from 'graphql-request';
import { wpClient } from './client';

// ─── GraphQL Queries 
const GET_ALL_POSTS = gql`
  query GetAllPosts {
    posts(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        slug
        date
        excerpt
      }
    }
  }
`;

const GET_SITE_SETTINGS = gql`
  query GetSiteSettings {
    generalSettings {
      title
      description
    }
  }
`;

// ─── Exported API Functions 
export async function fetchAllPosts() {
  try {
    const result = await wpClient.request(GET_ALL_POSTS);
    const posts = result?.posts?.nodes;

    if (!Array.isArray(posts)) {
      return { data: [], error: null };
    }

    return { data: posts, error: null };
  } catch (err) {
    console.error('[fetchAllPosts]', err?.message ?? err);
    return {
      data: null,
      error: 'Could not load posts. Make sure WordPress is running.',
    };
  }
}

// Fetches the WordPress site title and description (generalSettings).
export async function fetchSiteSettings() {
  try {
    const result = await wpClient.request(GET_SITE_SETTINGS);
    const settings = result?.generalSettings;

    if (!settings) {
      return { data: null, error: 'Site settings not available.' };
    }

    return { data: settings, error: null };
  } catch (err) {
    console.error('[fetchSiteSettings]', err?.message ?? err);
    return { data: null, error: 'Could not load site settings.' };
  }
}