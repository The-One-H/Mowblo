import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      router.replace({
        pathname: '/(auth)/sign-up',
        params: { navAnimation: 'slide_from_bottom' }
      })
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }
  return (
    <TouchableOpacity onPress={handleSignOut} className='border p-2 rounded-lg'>
      <Text>Sign out</Text>
    </TouchableOpacity>
  )
}