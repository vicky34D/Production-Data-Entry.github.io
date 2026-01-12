import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param {File} file - The file object to upload.
 * @param {string} folder - The folder path (default: 'documents').
 * @returns {Promise<string|null>} - The download URL or null if failed.
 */
export const uploadDocument = async (file, folder = 'documents') => {
    if (!file) return null;

    try {
        const timestamp = Date.now();
        // Sanitize filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageRef = ref(storage, `${folder}/${timestamp}_${safeName}`);

        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    } catch (error) {
        console.error("Error uploading file:", error);
        alert(`Upload Failed: ${error.message}`);
        return null;
    }
};
