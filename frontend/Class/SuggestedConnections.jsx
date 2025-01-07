import React, { useState, useEffect } from 'react';
import SuggestedConnectionUserProfile from '../UserProfile/SuggestedConnectionUserProfile';
// import CharlieProfileImage from '../images/Charlie.css';
import CharlieProfileImage from '../images/max-pic.png';
import '../CSS/SuggestedConnections.css'; 
import Cookies from 'js-cookie';

const SuggestedConnections = ({ courseId, handleExploreMore }) => {
  const [profiles, setProfiles] = useState([]);

  const fetchSuggestions = async () => {
    const result = await fetch(`/api/top-six-followers`, {
        method: "GET",
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get('access_token')}`,
        },
      },)
      .then((response) => response.json())
      .then((data) => { setProfiles(data);});
  }
  useEffect(() => {fetchSuggestions()}, []);

  // Mock API call
  useEffect(() => {
    // const mockData = [
    //   { id: 1, name: 'Charlie Zhang', major: 'Computer Science', profileImage: CharlieProfileImage },
    //   { id: 2, name: 'Daria Skalitzky', major: 'Cognitive Science', profileImage: CharlieProfileImage },
    //   { id: 3, name: 'Adam Meskouri', major: 'Political Science', profileImage: CharlieProfileImage},
    //   { id: 4, name: 'Max Green', major: 'Mechanical Engineering', profileImage: CharlieProfileImage },
    //   { id: 5, name: 'Alex Brown', major: 'Electrical Engineering', profileImage: CharlieProfileImage},
    //   { id: 6, name: 'Emily White', major: 'Biomedical Engineering', profileImage: CharlieProfileImage }
    // ];
    // setProfiles(mockData); // Pretend to get data from API
  }, []);

  // Split the profiles into two groups: top 3 and footer
  const top3Profiles = profiles.slice(0, 3);
  const footerProfiles = profiles.slice(3, 6);

  return (
    <div className="suggested-connections-container">
      <div className='suggested-connections-header'>
        <h2>The Collage Board</h2>
        <p>With Collage Board, you can view what class your friends are selecting and discover new connections...</p>
      </div>
    

      {/* Top 3 profiles */}
      <div className="profile-grid">
        {top3Profiles.map(profile => (
          <SuggestedConnectionUserProfile
            key={profile.id}
            profileImage={profile.profileImage}
            name={profile.name}
            major={profile.major}
            userId={profile.id}
          />
        ))}
      </div>

      {/* Footer with next 3 profiles */}
       <div className="suggested-connections-footer">
      <div className="footer-images">
        {footerProfiles.map((profile, index) => (
          <img
            key={profile.id}
            src={profile.profileImage}
            alt={`${profile.name} profile`}
            className="footer-image"
          />
        ))}
      </div>
      <div className="footer-text">
        <p>
          {profiles.length > 1 ? (
            <>
              {profiles[0]?.name}, {profiles[1]?.name}, and 22 others are active in updating their schedules with Collage. See what they’re up to
            </>
          ) : (
            "No others are active in updating their schedules with Collage."
          )}
        </p>
        <a onClick={() => handleExploreMore()} className="explore-more-link">Explore more collagers</a>
      </div>
    </div>

    </div>
  );
};

export default SuggestedConnections;
