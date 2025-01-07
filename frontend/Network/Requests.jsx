import React, { useState, useEffect, lazy } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
const NetworkBox = lazy(() => import('./NetworkBox'));
import CharlieProfileImage from '../images/Charlie.svg';
import '../CSS/NavBarFollowers.css';

const Requests = ({ currentUser }) => {
    const [requests, setRequests] = useState([])

    useEffect(() => {
        axios.get(`/api/requests/${currentUser}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Cookies.get('access_token')}`,
                },
        })
        .then((response) => setRequests(response.data))
        .catch((err) => console.error(err));
    }, [currentUser])


    const handleDismiss = async (requestId) => {
        const payload = {user_id: currentUser, follow_id: requestId};
        axios.delete(`/api/remove_user`, payload, {
            // data: payload,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Cookies.get('access_token')}`,
                },
        })
        .then((response) => {
            
            setRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
        })
        .catch((err) => console.error(err));
    };

    const handleConnect = (requestId) => {
        const payload = {
            user_id: currentUser,
            follow_id: requestId
        };

        axios.post(`/api/accept`, payload, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Cookies.get('access_token')}`,
                },
        })
        .then((response) => {
            
            setRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
        })
        .catch((err) => console.error(err));
    };

    return (
        <>
            <NetworkBox 
                userList={requests} 
                search={false} 
                buttonText1="Connect" 
                handleButton1={handleConnect} 
                buttonText2="Dismiss" 
                handleButton2={handleDismiss} 
                headerText="Friend requests" 
                subText="Keep up with who wants to join your network" 
            />
        </>
    );
};

export default Requests;