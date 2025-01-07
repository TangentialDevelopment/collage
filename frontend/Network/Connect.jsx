import React, { useState, useEffect, lazy } from 'react';
import axios from 'axios';
const NetworkBox = lazy(() => import('./NetworkBox'));
import CharlieProfileImage from '../images/Charlie.svg';
import Cookies from 'js-cookie';
import '../CSS/NavBarFollowers.css';

const Connect = ({ currentUser }) => {
    const [connects, setConnects] = useState([])
    
    useEffect(() => {
        axios.get(`/api/connects/${currentUser}`, {
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get('access_token')}`,
            },
        })
        .then((response) => setConnects(response.data))
        .catch((err) => console.error(err));
    }, [currentUser])


    const handleConnect = (connection) => {
        const payload = {
            user_id: currentUser,
            follow_id: connection
        };

        axios.post(`/api/follow`, payload, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Cookies.get('access_token')}`,
                },
        })
        .then((response) => {
            
            setConnects(prevConnects => prevConnects.filter(connect => connect.id !== connection));
        })
        .catch((err) => console.error(err));
    };

    return (
        <>
            <NetworkBox 
                userList={connects} 
                search={true} 
                buttonText1="Request" 
                handleButton1={handleConnect} 
                headerText="Connect with Collagers" 
                subText="Find meaningful connections based on your followers and interests" 
                searchText="Search Collagers"
            />
        </>
    );
};

export default Connect;
