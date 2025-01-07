import React, { lazy } from "react";
const NetworkNavBar = lazy(() => import('./NetworkNavBar'));
const ActivityGlimpse = lazy(() => import('../UserProfile/ActivityGlimpse'));
import '../CSS/NetworkWrapper.css';
import '../CSS/Search.css';

const NetworkWrapper = ({profileUser, handleViewProfile, handleExploreMore}) => {
    
    return (
        <div className="full-page">
            <div className="network-wrapper">
                <NetworkNavBar profileUser={profileUser} handleViewProfile={handleViewProfile}/>
                <div className="activity-glimpse">
                    <ActivityGlimpse handleExploreMore={handleExploreMore}/>
                </div>
            </div>
        </div>
    );
};

export default NetworkWrapper;
