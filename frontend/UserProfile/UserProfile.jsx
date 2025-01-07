import React, {lazy, useState, useEffect} from "react";
import { Grid, Image } from "@mantine/core";
import '../CSS/userProfile.css';
import axios from 'axios';
import Cookies from 'js-cookie';

const Personal = lazy(() => import('./Personal'));
const FileUpload = lazy(() => import('./FileUpload'));
const Saved = lazy(() => import('./Savedcourses'));
const Schedule = lazy(() => import('./Schedule'));
const ActivityGlimpse = lazy(() => import('./ActivityGlimpse'));

import saved from '../images/blurredSaved.png';
import schedule from '../images/blurredSchedule.png';

function UserProfile({loggedIn, following, profileUser, handleExploreMore}) {
    const [upload, setUpload] = useState(false);

    // console.log("PROFILE", profileUser);
    const [username, setUsername] = useState('');
    useEffect(() => {
        axios.get(`/api/current-user`, { 
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get('access_token')}`,
          },
        })
        .then(response => {
          setUsername(response.data['current_user']);
          // console.log("ENROLLMENT", profile.full_name);
        })
        .catch(err => {console.error(err)});
    }, []);

    //changes variable back and forth every time a user uploads their schedule file, can add to dependency array for any useEffect that shows a image or profile to rerender every time something is uploaded
    const handleUpload = () => {
        setUpload(!upload);
    }
    
    if (loggedIn) {
        return(
            // personal
            <div className="profile-body">
                <Grid>
                    <Grid.Col span={12}>
                        <div className="saved-title">
                            <h1>Profile</h1>
                        </div>
                    </Grid.Col>
                    <Grid.Col span={8}>
                        <Personal isUser={true} userId={profileUser}/>
                    </Grid.Col>
                    <Grid.Col justify="flex-end" span={4}>
                        <ActivityGlimpse handleExploreMore={handleExploreMore}/>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <h2>Schedule Builder</h2>
                        {/* <p>Temporarily down :(</p> */}
                        <div className="builder">
                            <FileUpload userId={profileUser} handleUpload={handleUpload}/>
                        </div>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <div className="schedule">
                            <h2>Schedule <span>(Upload a screenshot from Wolverine Access)</span></h2>
                            <Schedule userName={username} upload={upload} isUser={loggedIn} userId={profileUser}/>
                        </div>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <h3>Saved Courses</h3>
                        <Saved loggedIn={loggedIn} userId={profileUser}/>
                    </Grid.Col>
                </Grid>
            </div>
        )
    } else {
        if (following) {
            return (
                // following
                <div className="profile-body">
                    <Grid>
                        <Grid.Col span={12}>
                            <div className="saved-title">
                                <h1>Profile</h1>
                            </div>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Personal isUser={false} userId={profileUser}/>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            {/* <ActivityGlimpse/> */}
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <div className="schedule">
                                <h2>Schedule</h2>
                                <Schedule userName={username} upload={upload} isUser={loggedIn} userId={profileUser}/>
                            </div>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <h3>Saved Courses</h3>
                            <Saved loggedIn={loggedIn} userId={profileUser}/>
                        </Grid.Col>
                    </Grid>
                </div>
            )
        } else {
            
            return (
                // Outside
                <div className="profile-body">
                    <Grid>
                        <Grid.Col span={12}>
                            <div className="saved-title">
                                <h1>Profile</h1>
                            </div>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Personal isUser={false} userId={profileUser}/>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            {/* <ActivityGlimpse/> */}
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <p>You must be following this user to view their schedule and saved courses</p> 
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Image src={ schedule } className="sample"/>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Image src={ saved } className="sample"/>
                        </Grid.Col>
                    </Grid>
                </div>
            )
        }
    }
}

export default UserProfile;