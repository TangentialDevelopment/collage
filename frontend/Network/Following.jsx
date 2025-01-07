import React, { useState, useEffect, startTransition, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import CharlieProfileImage from '../images/Charlie.svg';
import FollowerTabIcon from '../images/follower-tab-icon.svg';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../CSS/NavBarFollowers.css';
const NetworkBox = lazy(() => import('./NetworkBox'))


const Following = ({ currentUser, handleViewProfile }) => {
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    axios.get(`/api/following/${currentUser}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Cookies.get('access_token')}`,
        },
    })
        .then((response) => setFollowing(response.data))
        .catch((err) => console.error(err));

  }, [currentUser]);


  const handleUnfollow = async (followerId) => {
    const payload = {
        user_id: currentUser,
        follow_id: followerId
    };
    axios.delete(`/api/unfollow`, {
        data: payload,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get('access_token')}`,
            },
    })
    .then((response) => {
        
        setFollowing(prevFollowers => prevFollowers.filter(follower => follower.id !== followerId));
    })
    .catch((err) => console.error(err));
  };

  return (
    <>
      <NetworkBox 
        userList={following} 
        search={true} 
        buttonText1="View Profile" 
        handleButton1={handleViewProfile} 
        buttonText2="Unfollow" 
        handleButton2={handleUnfollow} 
        headerText="Following" 
        subText="View following part of your collage network" 
        searchText="Search my following"
      />
    </>
  );
};

export default Following;






// import React, {useState, useEffect} from "react";
// const UserResult = lazy(() => import('./UserResult'));

// const Following = ({currentUser}) => {
//   const [users, setUsers] = ([]);

//   useEffect = (() => {
//     fetch(`/api/following/`)
//     .then(response => response.json())
//     .then(data => {
//       setUsers(data.users);
//     })
//     .catch(error => {
//       console.error('Error fetching users:', error);
//     });
//   }, []);

//   const handleUnfollow = (userId) => {
//     fetch(`/api/unfollow/${userId}`, {
//       method: 'POST',
//       headers:{
//         'Content-Type': 'application/json',
//       },
//     })
//     .then(response => {
//       if(response.ok) {
//         setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
//       } else {
//         console.error('Failed to unfollow user');
//       }
//     })
//     .catch(error => {
//       console.error('Error unfollowing user:', error);
//     });
//   };

//   return (
//     <>
//       {users.map((user) => {
//         <UserResult 
//           key={user.id} 
//           name={user.name} 
//           username={user.username} 
//           profile_image={user.profile_image} 
//           major={user.major} 
//           grad_year={user.grad_year} 
//           right_component={
//             <>
//               <button>View Profile</button>
//               <button onClick={() => handleUnfollow(user.id)}>Unfollow</button>
//             </>
//           }
//         />
//       })}
      
//     </>
//   );
// };

// export default Following;