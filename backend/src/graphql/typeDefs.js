const { gql } = require('apollo-server')

const typeDefs = gql`
  scalar Upload

  type TweetResponse {
    id: ID!
    content: String
    media: String
    createdAt: String
    likes: Int
    retweets: Int
    isRetweet: Boolean
    isLiked: Boolean
    isRetweeted: Boolean
    isFollowing: Boolean
    author: UserBasicInfo
    comments: [CommentResponse]
  }
  type Tweet {
    id: ID!
    content: String!
    media: String
    author: User!
    mentions: [User]
    likes: [User]
    comments: [Comment]
    isRetweet: Boolean
    retweets: [Tweet]
    hashtags: [String]
    createdAt: String!
  }
  type TimelineResponse {
    id: ID
    content: String
    media: String
    createdAt: String
    likes: Int # Remplace le tableau par un entier
    retweets: Int # Remplace le tableau par un entier
    isRetweet: Boolean
    isLiked: Boolean
    isRetweeted: Boolean
    isFollowing: Boolean
    author: User
    comments: [ID]
  }
  type Comment {
    id: ID!
    content: String!
    author: User!
    tweetId: ID!
  }

  type User {
    id: ID!
    username: String!
    handle: String!
    email: String!
    token: String
    tweets: [Tweet]
    bio: String
    profile_img: String
    banniere_img: String
    followers: String
  }
  type UserBasicInfo {
    id: ID!
    username: String
    handle: String
    profile_img: String
  }
  type CommentResponse {
    id: ID!
    content: String
    createdAt: String
    author: UserBasicInfo
  }

  type Query {
    getTweet(id: ID!): TweetResponse
    searchTweets(query: String!): [Tweet]
    getCurrentUser: User
    userTimeline: userTimeline!
    getTimeline: [TimelineResponse!]!
    getUserTweets(userId: ID!): [Tweet!]!
  }

  type Mutation {
    follow(userId: ID!): FollowResponse!
    likeTweet(tweetId: ID!): LikeResponse
    createTweet(
      content: String!
      media: Upload
      mentions: [ID]
      hashtags: [String]
    ): Tweet!
    register(
      username: String!,
      email: String!,
      password: String!
      ): User
    reTweet(tweetId: ID!): RetweetResponse
    bookmarkTweet(tweetId: ID!): User
    login(email: String!, password: String!): User
    logout: LogoutResponse!
  }
  type RetweetResponse {
    success: Boolean!
    message: String!
    tweet: Tweet
  }
  
  type LogoutResponse {
    success: Boolean!
    message: String!
  }
  type LikeResponse {
    success: Boolean!
    liked: Boolean!
    likes: Int!
    tweet: Tweet
  }
  type FollowResponse {
    success: Boolean!
    following: Boolean!
    followersCount: Int!
  }
  type userTimeline {
    user: User!
    tweets: [Tweet!]!
    comments: [Comment!]!
    likedTweets: [Tweet!]!
    bookmarks: [Tweet!]!
  }
`;

module.exports = typeDefs