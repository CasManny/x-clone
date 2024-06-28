import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

const UseUpdateUserProfile = () => {
    const queryClient = useQueryClient()
    const { mutateAsync: updateUser, isPending: isUpdatingProfile } = useMutation({
        mutationFn: async (formdata) => {
            try {
                const res = await fetch(`/api/users/updateprofile`, {
                    method: 'POST',
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify(formdata)
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || "Something went wrong")
                return data
            } catch (error) {
                console.log(error)
                throw new Error(error.message)
            }
        },
        onSuccess: () => {
            toast.success("Profile updated successfully")
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['authUser'] }),
                queryClient.invalidateQueries({queryKey: ['userProfile']})
            ])
            
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    return { updateUser, isUpdatingProfile}

}

export default UseUpdateUserProfile