import { router } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ToSPage = () => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-gray-100 p-5">
        {/* Legal agreement */}
        <Text className='text-3xl'>Privacy Policy v0.0.-1</Text>
        <Text className="text-center text-2xl font-bold text-gray-800 mb-5">Bla bla bla... You agree to be juiced of all of your data... Bla bla bla</Text>

        {/* Placeholder page switching */}
        <TouchableOpacity
            onPress={() => {
            router.back();
            }}
            className="absolute top-10 right-10 bg-blue-500 py-2 px-4 rounded-full">
            <Text className="text-md font-JakartaBold text-white">Back</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ToSPage;