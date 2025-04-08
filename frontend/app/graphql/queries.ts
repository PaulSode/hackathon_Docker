import { gql } from "@apollo/client";

// Définition de la requête GraphQL
export const GET_TWEET = gql`
  query GetTweet($id: ID!) {
    getTweet(id: $id) {
      id
      content
      createdAt
      media
      isLiked
      isRetweeted
      author {
        id
        username
        handle
        profile_img
      }
      comments {
        id
        content
        createdAt
        author {
          id
          username
          handle
          profile_img
        }
      }
    }
  }
`;