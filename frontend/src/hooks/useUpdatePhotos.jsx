import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

const updateProfilePhotos =  () => {
    const queryClient = useQueryClient()
    const { mutateAsync: updateUserPhotos, isPending: isUpdatingUserPhotos } = useMutation({
        mutationFn: async (photos) => {
            try {
                const res = await fetch('/api/users/updateprofile/photos', {
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify(photos)
                })

                const data = await res.json()
                return data
            } catch (error) {
                throw new Error(error.message)
            }
        },
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: () => {
            toast.success("Photos updated successfully")
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['authUser'] }),
                queryClient.invalidateQueries({queryKey: ['userProfile']})

            ])
        }

    })

    return { updateUserPhotos, isUpdatingUserPhotos}
}

export default updateProfilePhotos;