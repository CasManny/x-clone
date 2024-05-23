import { useRef } from "react"

const [image, setImage] = useState(null)

const handeImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = () => {
            setImage(image)
        }
        reader.readAsDataURL(file)
    }
}

const imgRef = useRef(null)
const removeImage = (e) => {
    setImage(null)
    imgRef.current.value = null
}

const uploadImage = () => {
    imgRef.current.click()
}