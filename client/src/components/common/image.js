import React, { useEffect, useState } from 'react';
import getImageUrlFromStorage from './getImageUrlFromStorage';

const Image = ({ imagePath, style, className }) => {
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        const fetchImageUrl = async () => {
            try {
                const url = await getImageUrlFromStorage(imagePath);
                setImageUrl(url);
            } catch (error) {
                console.error('Error fetching image URL:', error);
            }
        };

        fetchImageUrl();
    }, [imagePath]);

    return <img src={imageUrl} className={className} style={{ maxHeight: '200px', ...style }} />;
};

export default Image;
