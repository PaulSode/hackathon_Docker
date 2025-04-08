import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, from } from "@apollo/client";
import { useAppContext } from "./context/appContext"; // Import AppContext
// import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

 // Replace with your API

export const createApolloClient = (token: string | null) => {
  const httpLink = new HttpLink({
      uri: "http://localhost:4000/graphql", // Assure-toi que cette variable est définie
  });

  const authLink = setContext((_, { headers }) => ({
      headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
      },
  }));

  return new ApolloClient({
      link: from([authLink, httpLink]),
      cache: new InMemoryCache(),
  });
};
