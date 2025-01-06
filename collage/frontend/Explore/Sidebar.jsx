import React, {useState, lazy, useEffect} from 'react';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import {Image } from '@mantine/core';
import profPic from '../images/prof-pic.jpg';
import fullLogo from '../images/full-logo.png';
import '../CSS/ProfBar.css';
import axios from 'axios';

const Sidebar = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get(`/api/student`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Cookies.get('access_token')}`,
                },
        })
        .then((response) => setData(response.data))
        .catch((err) => console.error(err))
    }, [])

    function formatDate(dateString) {
        // Create a new Date object from the date string
        // console.log(data.enrollment_date);
        const date = new Date(dateString);

        // Extract the month and day in UTC
        const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
        const day = date.getUTCDate();

        return `${month} ${day}`;
    }

    return (
        <div className="full-bar">
          <div className="prof-header-container">
            <Image src={ fullLogo } className="collage-header"/>
            <Image radius="md" src={ data.prof_pic } className="prof-pic" />
          </div>

          <h2 style={{ textAlign: "center" }}>{data.full_name}</h2>
          <p style={{ textAlign: "center", padding:"0% 7% 0% 7%"}}>
            {data.major && <span>{data.major} Major</span>}
            {data.minor && <span> and {data.minor} Minor</span>}
            {data.college && <span> at {data.college}</span>}
          </p>

          <div className="social-grid">
            <div className="social-titles">
              <p>Profile viewers</p>
              <p>Connections</p>
            </div>

            <div className="social-stats">
              <p>{data.profile_viewers}</p>
              <p>{data.follower_count}</p>
            </div>
          </div>

          <div style={{borderBottom: "1px solid #ECECEC"}} className="social-grid">
            <div className="social-titles">
              <p>Graduation year</p>
              <p>Credits completed</p>
              {/* <p>Credits to complete</p> */}
              <p>Registration term</p>
            </div>

            <div className="social-stats">
              <p>{data.graduation_year}</p>
              <p>{data.credits_completed}</p>
              {/* <p>23</p> */}
              {/* <p>WN '25</p> */}
            </div>
          </div>

          <div className="registration-info">
            <p style={{ textAlign: "center", fontSize: "1.3rem", marginBottom: "15px"}}>Registration Date:</p>
            <p style={{ textAlign: "center" }} className="registration-time">
              {isNaN(data.enrollment_date) ? formatDate(data.enrollment_date) : 'Enter Enrollment Date'}
            </p>
          </div>
        </div>
    )
};

export default Sidebar;