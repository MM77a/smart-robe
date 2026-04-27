import React from 'react';
import UserProfile from '../components/VirtualTryOn/UserProfile';
import WardrobeGallery from '../components/VirtualTryOn/WardrobeGallery';
import WeatherContext from '../components/VirtualTryOn/WeatherContext';
import StylePrompt from '../components/VirtualTryOn/StylePrompt';
import TryOnPreview from '../components/VirtualTryOn/TryOnPreview';

const VirtualTryOn = () => {
    return (
        <div className="p-5">
            <UserProfile />
            <WardrobeGallery />
            <WeatherContext />
            <StylePrompt />
            <TryOnPreview />
        </div>
    );
};

export default VirtualTryOn;
