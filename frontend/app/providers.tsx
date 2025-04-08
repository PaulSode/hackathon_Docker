"use client"

import { ApolloProvider, InMemoryCache, ApolloClient,  } from "@apollo/client"
 
const client = new ApolloClient({
  uri: "http://localhost:4000/graphql", // 🚀 L'URL de ton serveur GraphQL
  cache: new InMemoryCache(),
  credentials: "include", // Si besoin d'authentification
});
 
export function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}