import { ColorSchemeName, useColorScheme as rnUseColorScheme } from 'react-native';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { AsyncStorageKey } from '@/utils/storage/AsyncStorage';

function useColorScheme(): ColorSchemeName {
    const [colorScheme, setColorScheme, loadingDarkMode] = useAsyncStorage(AsyncStorageKey.colorScheme)

    if (loadingDarkMode || !colorScheme) {
        return rnUseColorScheme()
    }

    return colorScheme;
}

export { useColorScheme }