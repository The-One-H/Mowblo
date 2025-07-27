
import { PulldownButton } from '@/components/PulldownButton';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { AsyncStorageKey, getData, setData } from '@/utils/storage/AsyncStorage';
import { ActivityIndicator, ScrollView, Text,TextInput,TouchableOpacity,View } from 'react-native';

const SettingsScreen = () => {
  const [colorScheme, setColorScheme, loadingColorScheme] = useAsyncStorage(AsyncStorageKey.colorScheme)

  if (loadingColorScheme) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
      <ScrollView
        className="flex-1"
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps={'never'}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-4 flex-col gap-3">
          <View className='flex-1'>
            <Text className='mx-3 my-1 font-semibold text-lg'>Colour Scheme</Text>
            <PulldownButton
              valueMap={[
                { key: 'Light', value: 'light' },
                { key: 'Dark', value: 'dark' },
              ]}
              value={colorScheme??'light'}
              setter={(val) => setColorScheme(val)}
            ></PulldownButton>
          </View>
        </View>
      </ScrollView>
    );
};
export default SettingsScreen;