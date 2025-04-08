import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
        id
        username
        email
        profile_img
        token
    }
  }
`

export const FOLLOW_MUTATION = gql`
  mutation FollowUser($userId: ID!) {
    follow(userId: $userId) {
      success
      followersCount
      following
    }
  }
`
export const LIKE_TWEET = gql`
  mutation LikeTweet($tweetId: ID!) {
    likeTweet(tweetId: $tweetId) {
      success
      liked
      likes
      tweet {
        id
        content
        author {
          username
        }
      }
    }
  }
`

export const RE_TWEET = gql`
  mutation reTweet($tweetId: ID!) {
    reTweet(tweetId: $tweetId) {
      success
      message
    }
  }
`
