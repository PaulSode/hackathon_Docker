'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../type/user';

interface AppContextType {
    query: string;
    setQuery: (query: string) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    error: Error | null;
    setError: (error: Error | null) => void;
    appState: AppState | null;
    setAppState: (appState: AppState) => void;
    setUser: (user: User | null, token: string | null) => void;
}

interface AppState {
    theme: string;
    user: User | null;
    isLoggedIn: boolean;
    token: string | null;
}

const defaultState: AppState = {
    theme: 'light',
    user: null,
    isLoggedIn: false,
    token: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const [appState, setAppState] = useState<AppState | null>(null);

    // Charger l'état depuis localStorage après le montage du composant (évite le SSR access)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('appState');
            setAppState(savedState ? JSON.parse(savedState) : defaultState);
        }
    }, []);

    // Sauvegarde dans localStorage à chaque modification de l'état
    useEffect(() => {
        if (appState) {
            localStorage.setItem('appState', JSON.stringify(appState));
        }
        console.log(appState)
    }, [appState]);

    // Mettre à jour l'utilisateur et le token
    const setUser = (user: User | null, token: string | null) => {
        setAppState(prevState => ({
            ...prevState!,
            user,
            token,
            isLoggedIn: !!user,
        }));
    };

    return (
        <AppContext.Provider value={{
            query,
            setQuery,
            isLoading,
            setIsLoading,
            error,
            setError,
            appState: appState ?? defaultState, // Éviter le null au début
            setAppState,
            setUser,
        }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook pour utiliser le contexte
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
