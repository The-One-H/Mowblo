import { useClerk } from '@clerk/clerk-expo'
import { Text, TouchableOpacity, Image } from 'react-native'

export const ProfileImage = ({ className }: { className?: string | undefined }) => {
    const { user } = useClerk()
    if (!user) return <p>No Image URL found</p>
    const { imageUrl } = user
    const params = new URLSearchParams()

    params.set('height', '10')
    params.set('width', '10')
    params.set('quality', '60')
    params.set('fit', 'crop')

    const imageSrc = `${imageUrl}?${params.toString()}`

    return (
        <Image
            className={'rounded-full bg-gray-200 ' + className}
            source={{ uri: imageSrc }}
        />
    )
}