import { DatabaseQuery } from "@/firebaseConfig";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect } from "react";

enum AccountType {
    client = 'client',
    freelancer = 'freelancer',
}

interface UserData {
    fullName?: string,
    accountType?: AccountType[]
}

/**
 * Fetch all user data from the Firestore Database.
 * 
 * Updates data on page reload.
 * 
 * @returns
 * [ data: `UserData`, loadingData: `boolean` ]
 * - data:          The data queried
 * - loadingData:   The current loading state
 */
export const useDataFetch = (): [ UserData | undefined, boolean ] => {
    const [data, setData] = React.useState<UserData>()
    const [loadingData, setLoadingData] = React.useState(true)

    const databaseQuery: DatabaseQuery = new DatabaseQuery();
    
    useFocusEffect(
        // Wrapped callback to avoid running the effect too often.
        useCallback(() => {
            const fetchData = () => {
                databaseQuery.signIntoFirebaseWithClerk().then(() => {
                    databaseQuery.getFirestoreData(null, setData).then(() => {
                        setLoadingData(false);
                    })
                })
            }
            
            fetchData();
            
            // Return function is invoked whenever the route gets out of focus.
            return () => { };
        }, [])
    );

    return [ data, loadingData ];
}