import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorSchemeName } from "react-native";

enum AsyncStorageKey {
    colorScheme = 'colorScheme'
}

type AsyncStorageValue = {
    [AsyncStorageKey.colorScheme]: ColorSchemeName
};

const setData = async <K extends AsyncStorageKey>(key: AsyncStorageKey, value: AsyncStorageValue[K]) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
  }
};

const getData = async <K extends AsyncStorageKey>(key: AsyncStorageKey): Promise<AsyncStorageValue[K] | undefined> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : undefined;
  } catch (e) {
    // error reading value
  }
};

export { setData, getData, AsyncStorageKey, AsyncStorageValue }