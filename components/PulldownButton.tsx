import { deepObjectCompare } from '@/utils/deepObjectCompare'
import { useClerk } from '@clerk/clerk-expo'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import { Text, TouchableOpacity, Image, View, FlatList } from 'react-native'

const PulldownList = (
    {
        className,
        valueMap,
        value,
        setter,
        setIsOpen,
    }:
    {
        className?: string | undefined,
        valueMap: { key: string, value: any }[],
        value: any,
        setter: React.Dispatch<React.SetStateAction<any>>,
        setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    }
) => {
    if (!valueMap) { return null; }
    return (
        <View
            className={'flex-1 flex-row justify-between items-center border rounded-lg rounded-t-none m-0 p-3 bg-white border-slate-300 focus:border-slate-400'}
        >
            <FlatList
                scrollEnabled={false}
                data={valueMap}
                renderItem={({item}) => (
                    <TouchableOpacity
                        className={'flex-1 flex-row justify-between items-center border rounded-lg m-0 p-3'+ (deepObjectCompare(value, item.value) ? ' bg-blue-600 border-blue-300 focus:border-blue-400':' bg-white border-slate-300 focus:border-slate-400')}
                        onPress={() => {
                            setter(item.value)
                            setIsOpen(false)
                        }}
                    >
                        <Text>{item.key}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

export const PulldownButton = (
    {
        className,
        valueMap,
        value,
        setter,
    }:
    {
        className?: string | undefined,
        valueMap: { key: string, value: any }[],
        value: any,
        setter: React.Dispatch<React.SetStateAction<any>>,
    }
) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <View className=''>
            <TouchableOpacity
                className={'flex-1 flex-row justify-between items-center border rounded-lg m-0 p-3 bg-white border-slate-300 focus:border-slate-400'+(isOpen?' rounded-b-none ':null)}
                onPress={() => {
                    setIsOpen(!isOpen)
                }}
            >
                <Text className='bg-red-500'>{valueMap.filter((val) => { return deepObjectCompare(val.value, value)})[0].key}</Text>
                <Ionicons name={isOpen?'chevron-up':'chevron-down'} size={20} color="#666" />
            </TouchableOpacity>
            {
                isOpen ?
                    <PulldownList valueMap={valueMap} value={value} setter={setter} setIsOpen={setIsOpen}></PulldownList>
                    : null
            }
        </View>
    )
}