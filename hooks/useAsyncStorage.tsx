import { DatabaseQuery } from "@/firebaseConfig";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect } from "react";
import type { UserData } from '@/types/userDataTypes'
import * as AsyncStorage from "@/utils/storage/AsyncStorage";

/**
 * Fetch all user data from the local async storage.
 * 
 * Updates data on page reload.
 * 
 * @returns
 */
export const useAsyncStorage = <K extends AsyncStorage.AsyncStorageKey>(key: AsyncStorage.AsyncStorageKey): [ AsyncStorage.AsyncStorageValue[K] | undefined, Function, boolean ] => {
    const [data, setData] = React.useState<AsyncStorage.AsyncStorageValue[K]>()
    const [loadingData, setLoadingData] = React.useState(true)

    const setStorageData = (val: AsyncStorage.AsyncStorageValue[K]) => {
        AsyncStorage.setData(key, val);
        setData(val);
        setLoadingData(false)
    }

    const getStorageData = () => {
        AsyncStorage.getData(key).then((val) => {
            setData(val);
            setLoadingData(false);
        });
    }
    
    useFocusEffect(
        // Wrapped callback to avoid running the effect too often.
        useCallback(() => {
            getStorageData()
            
            // Return function is invoked whenever the route gets out of focus.
            return () => { };
        }, [])
    );

    return [ data, setStorageData, loadingData ];
}