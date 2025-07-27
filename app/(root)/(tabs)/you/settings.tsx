
import { PulldownButton } from '@/components/PulldownButton';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { AsyncStorageKey, getData, setData } from '@/utils/storage/AsyncStorage';
import { ActivityIndicator, ScrollView, Text,TextInput,TouchableOpacity,View } from 'react-native';

const SettingsScreen = () => {
  const [darkMode, setDarkMode, loadingDarkMode] = useAsyncStorage(AsyncStorageKey.darkMode)

  if (loadingDarkMode) {
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
            <Text className='mx-3 my-1 font-semibold text-lg'>Dark Mode</Text>
            <PulldownButton
              valueMap={[
                { key: 'Enabled', value: true },
                { key: 'Disabled', value: false },
              ]}
              value={darkMode}
              setter={(val) => setDarkMode(val)}
            ></PulldownButton>
          </View>
        </View>
      </ScrollView>
    );
};
export default SettingsScreen;