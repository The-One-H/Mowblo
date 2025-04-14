import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Text,View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  return (
    <SafeAreaView>
        <Link href= {"/(root)/(tabs)/home"}>
        <Ionicons name="chevron-back" size={20} color="#666" />
      <Text>Profile</Text>
        </Link>
    </SafeAreaView>
  );
};
export default Profile;