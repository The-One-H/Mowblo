
import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo'
import { Link, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, TextInput, TouchableOpacity, TouchableHighlight, StyleSheet, View, Button, Image, ScrollView, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useRef } from 'react'
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

export default function SignUpScreen() {
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

  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [verifyPassword, setVerifyPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState<string[]>(['', '', '', '', '', ''])

  const [errors, setErrors] = React.useState<ClerkAPIError[]>()
  const [showSigninError, setShowSigninError] = React.useState<String[]>([])
  const [failedSigninReason, setFailedSigninReason] = React.useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const [showVerifyError, setShowVerifyError] = React.useState<number[]>([])
  const [failedVerifyReason, setFailedVerifyReason] = React.useState('')

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    // Check that the code was entered (redundant)
    let missing: number[] = []
    for (let i = 0; i < 6; i++) {
      if (code[i].length != 1) {
        missing.push(i);
      }
    }
    if (missing.length > 0) {
      setFailedVerifyReason(`Please enter your verification code.`)
      setShowVerifyError(missing)
      return;
    }

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: code.join(''),
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))

      if (isClerkAPIResponseError(err)) {
        const longMessages = err.errors.map((error) => {
          switch (error.code) {
            case "client_state_invalid":
              router.replace({
                pathname: '/(auth)/sign-up',
                params: { navAnimation: 'fade' }
              });
              return error.longMessage?.substring(0,error.longMessage.length-1);
            default:
              return error.longMessage?.substring(0,error.longMessage.length-1);
          }
        })
        setFailedVerifyReason(longMessages.join('; ') + '.')
      }
      setShowVerifyError([0, 1, 2, 3, 4, 5, 6])
      setCode(['', '', '', '', '', ''])
    }
  }

  const verifyRefs = useRef<any>([]);

  useEffect(() => {
    if (pendingVerification) {
      verifyRefs.current[0].focus();
    }
  }, [])
  
  if (pendingVerification) {
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

            {/* Login/out page switcher buffer (invisible and not interactable, used as a consistent spacer) */}
            <View className='px-4 mt-3 mb-6 flex flex-row justify-end invisible'>
              <TouchableOpacity
                onPress={() => {
                  router.replace({
                    pathname: '/(auth)/sign-in',
                    params: { navAnimation: 'slide_from_right' }
                  });
                }}
                className='flex flex-row'
              >
                <Text className=' text-lg'>or Login</Text>
                <Ionicons
                  name={'chevron-forward-outline'}
                  size={24}
                  color={'black'}
                ></Ionicons>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className='px-12'>
              <View className='flex content-center gap-6'>{/* Form content */}
                {/* Titles */}
                <View className='flex content-center items-center gap-0'>
                  <Text className='text-xl font-bold center'>Veryify your email</Text>
                  <Text>Enter the code we sent to your email</Text>
                </View>

                {/* Code verification section */}
                <View className='flex content-center gap-3'>
                  <View className='flex flex-row content-center justify-around gap-3'>
                    {[1, 2, 3, 4, 5, 6].map((digit, i) => (
                      <TextInput
                        /* Password */
                        className={' border text-lg font-bold rounded-lg m-0 p-4 focus:border-2 focus:m-[-1]'+(code[i].length > 0 ? ' bg-slate-200' : '')+((showVerifyError.includes(i)) ? ' border-red-300 focus:border-red-500' : ' border-slate-300 focus:border-slate-600')}
                        autoCapitalize="none"
                        autoComplete='one-time-code'
                        enterKeyHint='done'
                        autoCorrect={false}
                        value={code[i]}
                        key={digit}
                        ref={(el) => {verifyRefs.current[i] = el}}
                        placeholder="_"
                        maxLength={1}
                        placeholderTextColor={showVerifyError.includes(i) ? '#f87171' : '#64748b'}
                        keyboardType='number-pad'

                        /* Hide cursor and place it after the text */
                        selection={{start: 1, end: 1}}
                        caretHidden={true}

                        onKeyPress={(e) => {
                          setShowVerifyError(showVerifyError.filter((missing) => { return missing != i; }));
                          if (e.nativeEvent.key == 'Backspace') {
                            if (code[i] == '' && i > 0) {
                              setCode(Object.assign([], code, {[i-1]: ''}));
                              verifyRefs.current[i-1].focus();
                            } else {
                              setCode(Object.assign([], code, {[i]: ''}));
                            }
                          }
                          else if (e.nativeEvent.key.length == 1) {
                            setCode(Object.assign([], code, {[i]: e.nativeEvent.key}));
                            if (i < code.length - 1) {
                              verifyRefs.current[i+1].focus();
                            } else {
                              verifyRefs.current[i].focus(false);
                              Keyboard.dismiss();
                            }
                          }
                          // Any uncaught case is not a digit and can be safely ignored.
                        }}
                      />
                    ))}
                  </View>
                  <TouchableOpacity
                    className='bg-black disabled:bg-gray-400 rounded-lg m-0 p-3 items-center'
                    disabled={code.join('').length != 6}
                    onPress={onVerifyPress}
                  >
                    <Text className='color-white'>Verify</Text>
                  </TouchableOpacity>
                  {
                    failedVerifyReason.length > 0 ?
                      <Text className='color-red-500'>Verification failed: {failedVerifyReason}</Text> : null
                  }
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
        <SafeAreaView className="absolute">
          {/* Login/out page switcher buffer (invisible and not interactable, used as a consistent spacer) */}
          <View className='flex flex-row float-left items-center'>
            <TouchableOpacity
              onPress={() => {
                router.replace({
                  pathname: '/(auth)/sign-up',
                  params: { navAnimation: 'slide_from_left' }
                });
              }}
              className='px-4 py-4 flex flex-row'
            >
              <Ionicons
                name={'chevron-back-outline'}
                size={24}
                color={'black'}
              ></Ionicons>
              {/* <Text className=' text-lg'>Back</Text> */}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    )
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
          <View className='px-4 mt-3 mb-6 flex flex-row justify-end'>
            <TouchableOpacity
              onPress={() => {
                router.replace({
                  pathname: '/(auth)/sign-in',
                  params: { navAnimation: 'slide_from_right' }
                });
              }}
              className='flex flex-row'
            >
              <Text className=' text-lg'>or Login</Text>
              <Ionicons
                name={'chevron-forward-outline'}
                size={24}
                color={'black'}
              ></Ionicons>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className='px-12'>
            <View className='flex content-center gap-6'>{/* Form content */}
              {/* Titles */}
              <View className='flex content-center items-center gap-0'>
                <Text className='text-xl font-bold center'>Get Reliable Service Today!</Text>
                <Text>Enter your email and a password to start</Text>
              </View>

              {/* Email register section */}
              <View className='flex content-center gap-3'>
                <TextInput
                  /* Email */
                  className={' border rounded-lg m-0 p-3'+(showSigninError.includes('email address') ? ' border-red-300 focus:border-red-500' : ' border-slate-300 focus:border-slate-400')}
                  autoCapitalize="none"
                  autoComplete='email'
                  enterKeyHint='done'
                  autoCorrect={false}
                  value={emailAddress}
                  placeholder="email@domain.com"
                  placeholderTextColor={showSigninError.includes('email address') ? '#f87171' : '#64748b'}
                  keyboardType='email-address'
                  onChangeText={(emailAddress) => {setEmailAddress(emailAddress); setShowSigninError(showSigninError.filter((missing) => { return missing != 'email address'; }))}}
                />
                <View>
                  <TextInput
                    /* Password */
                    className={' border rounded-b-none rounded-lg m-0 p-3'+(showSigninError.includes('password') ? ' border-red-300 focus:border-red-500' : ' border-slate-300 focus:border-slate-400')}
                    autoCapitalize="none"
                    autoComplete='new-password'
                    enterKeyHint='done'
                    autoCorrect={false}
                    value={password}
                    placeholder="password$%*&!"
                    placeholderTextColor={showSigninError.includes('password') ? '#f87171' : '#64748b'}
                    keyboardType='visible-password'
                    secureTextEntry={true}
                    onChangeText={(password) => {setPassword(password); setShowSigninError(showSigninError.filter((missing) => { return missing != 'password'; }))}}
                  />
                  <TextInput
                    /* Verify Password */
                    className={' forced-colors:text-red-500 border border-t-0 rounded-t-none rounded-lg m-0 p-3'+(showSigninError.includes('password') ? ' border-red-300 focus:border-red-500' : ' border-slate-300 focus:border-slate-400')}
                    autoCapitalize="none"
                    autoComplete='new-password'
                    enterKeyHint='done'
                    autoCorrect={false}
                    value={verifyPassword}
                    placeholder="verify password$%*&!"
                    placeholderTextColor={showSigninError.includes('password') ? '#f87171' : '#64748b'}
                    keyboardType='visible-password'
                    secureTextEntry={true}
                    onChangeText={(verifyPassword) => {setVerifyPassword(verifyPassword); setShowSigninError(showSigninError.filter((missing) => { return missing != 'password'; }))}}
                  />
                </View>
                <TouchableOpacity
                  className='bg-black rounded-lg m-0 p-3 items-center'
                  onPress={onSignUpPress}
                >
                  <Text className='color-white'>Register</Text>
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
                <Text className='color-gray-500'>By clicking continue/register, you agree to our </Text>
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