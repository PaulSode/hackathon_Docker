"use client";

import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "@/app/apollo-client";
import { useAppContext } from "@/app/context/appContext";
import { ReactNode } from 'react'

export const ApolloProviderWrapper = ({ children }: { children: ReactNode }) => {
    const { appState } = useAppContext();
    const client = createApolloClient(appState?.token); // Passer le token ici

    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};