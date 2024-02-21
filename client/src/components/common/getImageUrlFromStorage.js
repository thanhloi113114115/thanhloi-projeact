import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { storage } from "../../config";

const getImageUrlFromStorage = async (fullPath) => {
    try {
        const storageRef = ref(storage, fullPath);
        const imageUrl = await getDownloadURL(storageRef);

        return imageUrl;
    } catch (error) {
        console.error('Error getting image URL:', error);
        throw error;
    }
};

export default getImageUrlFromStorage;
