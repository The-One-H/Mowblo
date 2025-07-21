
import React, { useEffect } from 'react';
import { Text,TextInput,TouchableOpacity,View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { useAuth, useUser } from '@clerk/clerk-expo'

import { getApp, getAuth, app, auth, db } from '../../../../firebaseConfig'
import { signInWithCustomToken } from 'firebase/auth'
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { initializeApp } from 'firebase/app';

const PersonalInfoScreen = () => {
  const { getToken, userId } = useAuth()
  
  if (!userId) { return (<Text>Must be signed in!</Text>); }
  
  const [loadingData, setLoadingData] = React.useState(true)
  const [fullName, setFullName] = React.useState('')
  const [savedFullName, setSavedFullName] = React.useState('')
  
  const getFirestoreData = async () => {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data())

      setFullName(docSnap.data().fullName)
      setSavedFullName(docSnap.data().fullName)
    } else {
      // docSnap.data() will be undefined in this case
      console.log('No such document!')
    }
  }

  const signIntoFirebaseWithClerk = async () => {
    const token = await getToken({ template: 'integration_firebase' })

    const userCredentials = await signInWithCustomToken(auth, token || '')
    // The userCredentials.user object can call the methods of
    // the Firebase platform as an authenticated user.
    console.log('User:', userCredentials.user)
  }

  const writeFirestoreData = async () => {
    try {
      const docRef = await setDoc(doc(db, 'users', userId), {
        fullName: fullName,
      })

      setSavedFullName(fullName)
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  useEffect(() => {
    signIntoFirebaseWithClerk().then(() => {
      getFirestoreData().then(() => {
        setLoadingData(false);
      })
    })
  }, [])

  if (loadingData) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text className='text-4xl'>Loading...</Text>
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
      <View className="px-6 py-4 flex-col">
        <View className='flex-1 content-center items-center'>
          {/* Save Button */}
          <TouchableOpacity
            className='flex w-52 content-center items-center border rounded-lg m-4 mt-0 p-2 bg-green-500 disabled:bg-slate-300 border-slate-300 focus:border-slate-400'
            onPress={writeFirestoreData}
            disabled={
              fullName == savedFullName &&
              true
            }
          >
            <Text className='font-semibold text-lg'>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Full Name field */}
        <Text className='mx-3 my-1 font-semibold text-lg'>Full Name</Text>
        <View className='flex-1 flex-row content-center'>
          <TextInput
            className={'flex-1 border rounded-lg m-0 p-3 bg-white border-slate-300 focus:border-slate-400'}
            autoCapitalize='words'
            autoComplete='name-given'
            enterKeyHint='done'
            value={fullName}
            placeholder="First Last"
            placeholderTextColor='#64748b'
            keyboardType='ascii-capable'
            onChangeText={(fullName) => {setFullName(fullName);}}
          />
        </View>
      </View>
    </ScrollView>
  );
};
export default PersonalInfoScreen;