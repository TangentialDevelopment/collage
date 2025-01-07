import { Image } from "@mantine/core";
import React, {useState, useEffect} from "react";
import fullLogo from '../images/full-white-logo.png';
import profPic from '../images/tempHeadshot.png';
import '../CSS/activityglimpse.css';
import { use } from "chai";

const ActivityGlimpse = ({handleExploreMore}) => {
    const [scheduleUsers, setScheduleUsers] = useState([]);
    const [resumeUsers, setResumeUsers] = useState([]);

    return (
        <div className="activity">
            <div className="activity-header">
                <h1 className="head">Activity Glimpse</h1>
                <p className="headDescription">Explore what your peers have been up to on the Collage App!</p>
            </div>
            <h2 className="title">Schedule Completed ✅</h2>
            <div className="body">
                <div className="photos"> 
                    {/* {scheduleUsers.map((user) => (
                        <div key={user.id}> 
                            <Image src={ user.profPic } />
                        </div>
                    ))} */}
                    {/* <Image src={ profPic } className="pic picture1"/>
                    <Image src={ profPic } className="pic picture2"/>
                    <Image src={ profPic } className="pic picture3"/>
                    <Image src={ profPic } className="pic picture4"/> */}
                </div>
                <div className="sub-body">
                    <p className="activity-description"><span className="users">No one has</span> completed their schedules for the <span className="semester">Winter</span> semester yet</p>
                    <a onClick={() => handleExploreMore()} className="explore">Explore more Collagers</a>
                </div>
            </div>
            <h2 className="title">Resume Uploaded 📝</h2>
            <div className="body">
                <div className="photos">
                    {/* {resumeUsers.map((user) => (
                        <div key={user.id}> 
                            <Image src={ user.profPic } />
                        </div>
                    ))} */}
                    {/* <Image src={ profPic } className="pic picture5"/>
                    <Image src={ profPic } className="pic picture6"/>
                    <Image src={ profPic } className="pic picture7"/>
                    <Image src={ profPic } className="pic picture8"/> */}
                </div>
                <div className="sub-body">
                    <p className="activity-description"><span className="users">No one </span> has updated their resumes recently</p>
                    <a onClick={() => handleExploreMore()} className="explore">Explore more Collagers</a>
                </div>
            </div>
            <div className="footer">
                <Image src={ fullLogo } className="activity-collage-header"/>
            </div>
        </div>
    )
}

export default ActivityGlimpse;