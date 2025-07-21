
import React, { useEffect } from 'react';
import { ActivityIndicator, Text,TextInput,TouchableOpacity,View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { useAuth, useUser } from '@clerk/clerk-expo'

import { getApp, getAuth, app, auth, db, DatabaseQuery } from '../../../../firebaseConfig'
import { signInWithCustomToken } from 'firebase/auth'
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { initializeApp } from 'firebase/app';

const PersonalInfoScreen = () => {
  const [loadingData, setLoadingData] = React.useState(true)
  const [fullName, setFullName] = React.useState('')
  const [savedFullName, setSavedFullName] = React.useState('')
  
  const databaseQuery: DatabaseQuery = new DatabaseQuery();
  useEffect(() => {
    const fetchData = () => {
      databaseQuery.signIntoFirebaseWithClerk().then(() => {
        databaseQuery.getFirestoreData([
          { key: 'fullName', setters: [setFullName, setSavedFullName] }
        ]).then(() => {
          setLoadingData(false);
        })
      })
    }
      
    fetchData();
  }, [])

  if (loadingData) {
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
      <View className="px-6 py-4 flex-col">
        <View className='flex-1 content-center items-center'>
          {/* Save Button */}
          <TouchableOpacity
            className='flex w-52 content-center items-center border rounded-lg m-4 mt-0 p-2 bg-green-500 disabled:bg-slate-300 border-slate-300 focus:border-slate-400'
            onPress={() => databaseQuery.writeFirestoreData({ fullName: fullName }).then(() => setSavedFullName(fullName))}
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