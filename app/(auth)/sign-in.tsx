
import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo'
import { Link, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, TextInput, TouchableOpacity, TouchableHighlight, StyleSheet, View, Button, Image, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import { useCallback, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'

import { ClerkAPIError } from '@clerk/types'

/**
 * React Hook that preloads the browser for Android devices to reduce authentication load time. Cleanup of the browser on component unmount is handled.
 * 
 * See: https://docs.expo.dev/guides/authentication/#improving-user-experience
 */
export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync()
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()

export default function SignInScreen() {
  const { navAnimation } = useLocalSearchParams();
  
  // Apply requested navigation animation
  if (navAnimation) {
    const navigation = useNavigation();
    useEffect(() => {
      navigation.setOptions({ animation: navAnimation });
    }, [navigation]);
  }
  
  useWarmUpBrowser()

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO()

  const onPressGoogle = useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        // For web, defaults to current path
        // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
        // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId })
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // TODO: Apply error handling as per https://clerk.com/docs/custom-flows/error-handling
      console.error(JSON.stringify(err, null, 2))
    }
  }, [])

  const onPressApple = useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_apple',
        // For web, defaults to current path
        // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
        // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId })
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }, [])

  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  const [errors, setErrors] = React.useState<ClerkAPIError[]>()
  const [showSigninError, setShowSigninError] = React.useState<String[]>([])
  const [failedSigninReason, setFailedSigninReason] = React.useState('')

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    // Check that user credentials were entered
    let missing = []
    if (emailAddress.length < 1) { missing.push('email address'); }
    if (password.length < 1) { missing.push('password'); }
    if (missing.length > 0) {
      setFailedSigninReason(`Please enter your ${missing.join(' and ')}.`)
      setShowSigninError(missing)
      return;
    }

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        setFailedSigninReason('')
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
        console.error("aaaaaaaaaaa")
        setFailedSigninReason(JSON.stringify(signInAttempt, null, 2))
        setShowSigninError(['email address', 'password'])
        setEmailAddress('')
        setPassword('')
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling

      if (isClerkAPIResponseError(err)) {
        const longMessages = err.errors.map((error) => {
          switch (error.code) {
            case "form_param_format_invalid":
              if (error.meta?.paramName == "identifier") return 'Your email address was not found.'
            default:
              return error.longMessage?.substring(0,error.longMessage.length-1);
          }
        })
        setFailedSigninReason(longMessages.join('; ') + '.')
      }
      setShowSigninError(['email address', 'password'])
      setEmailAddress('')
      setPassword('')
    }
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-100">
        <ScrollView
          className='overflow-visible py-12'
          alwaysBounceVertical={false}
          automaticallyAdjustKeyboardInsets={true}
          keyboardShouldPersistTaps={'never'}
          showsVerticalScrollIndicator={false}
        >
          {/* Mowblo logo */}
          <View className='px-12 flex content-center items-center'>
            <Image
              className=' w-1/2 h-[undefined] aspect-[303/71]'
              resizeMode='contain'
              source={require('../../assets/images/moblo-inline-transparent.png')}
            />
          </View>

          {/* Login/out page switcher */}
          <View className='px-4 mt-3 mb-6 flex flex-row float-left items-center'>
            <TouchableOpacity
              onPress={() => {
                router.replace({
                  pathname: '/(auth)/sign-up',
                  params: { navAnimation: 'slide_from_left' }
                });
              }}
              className='flex flex-row'
            >
              <Ionicons
                name={'chevron-back-outline'}
                size={24}
                color={'black'}
              ></Ionicons>
              <Text className=' text-lg'>or Signup</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className='px-12'>
            <View className='flex content-center gap-6'>{/* Form content */}
              {/* Titles */}
              <View className='flex content-center items-center gap-0'>
                <Text className='text-xl font-bold center'>Welcome Back!</Text>
                <Text>Enter your email and password to continue</Text>
              </View>

              {/* Email login section */}
              <View className='flex content-center gap-3'>
                <TextInput
                  className={' border rounded-lg m-0 p-3'+(showSigninError.includes('email address') ? ' border-red-300 focus:border-red-500' : ' border-slate-300 focus:border-slate-400')}
                  autoCapitalize="none"
                  autoComplete='email'
                  enterKeyHint='done'
                  value={emailAddress}
                  placeholder="email@domain.com"
                  placeholderTextColor={showSigninError.includes('email address') ? '#f87171' : '#64748b'}
                  keyboardType='email-address'
                  onChangeText={(emailAddress) => {setEmailAddress(emailAddress); setShowSigninError(showSigninError.filter((missing) => { return missing != 'email address'; }))}}
                />
                <TextInput
                  className={' border rounded-lg m-0 p-3'+(showSigninError.includes('password') ? ' border-red-300 focus:border-red-500' : ' border-slate-300 focus:border-slate-400')}
                  autoCapitalize="none"
                  autoComplete='current-password'
                  enterKeyHint='done'
                  value={password}
                  placeholder="password$%*&!"
                  placeholderTextColor={showSigninError.includes('password') ? '#f87171' : '#64748b'}
                  keyboardType='visible-password'
                  secureTextEntry={true}
                  onChangeText={(password) => {setPassword(password); setShowSigninError(showSigninError.filter((missing) => { return missing != 'password'; }))}}
                />
                <TouchableOpacity
                  className='bg-black rounded-lg m-0 p-3 items-center'
                  onPress={onSignInPress}
                >
                  <Text className='color-white'>Login</Text>
                </TouchableOpacity>
                {
                  failedSigninReason.length > 0 ?
                    <Text className='color-red-500'>Error: {failedSigninReason}</Text> : null
                }
              </View>

              {/* Horizontal divider */}
              <View className='flex-row items-center'>
                <View className='flex-1 h-1 border-b-slate-400 border-b-hairline'></View>
                <View>
                  <Text className='px-4 text-center color-slate-500'>or</Text>
                </View>
                <View className='flex-1 h-1 border-b-slate-400 border-b-hairline'></View>
              </View>

              {/* OAuth section */}
              <View className='flex flex-col gap-2'>
                <TouchableOpacity className='bg-gray-200 rounded-md p-2 flex flex-row items-center justify-center gap-2' onPress={onPressGoogle}>
                  <Ionicons name={'logo-google'} size={20} color={'black'}></Ionicons>
                  <Text className=' font-semibold'>Continue with Google</Text>
                </TouchableOpacity>
                <TouchableOpacity className='bg-gray-200 rounded-md p-2 flex flex-row items-center justify-center gap-2' onPress={onPressApple}>
                  <Ionicons name={'logo-apple'} size={20} color={'black'}></Ionicons>
                  <Text className=' font-semibold'>Continue with Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Legal */}
              <View className='flex flex-row flex-wrap justify-center mb-16'>
                <Text className='color-gray-500'>By clicking continue, you agree to our </Text>
                <TouchableOpacity>
                  <Link
                    className='font-semibold'
                    href={'/(legal)/terms-of-service'}
                  >
                    <Text>Terms of Service</Text>
                  </Link>
                  </TouchableOpacity>
                <Text className='color-gray-500'> and </Text>
                <TouchableOpacity>
                  <Link
                    className='font-semibold'
                    href={'/(legal)/privacy-policy'}
                  >
                    <Text>Privacy Policy</Text>
                  </Link>
                  </TouchableOpacity>
                <Text className='color-gray-500'>.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}