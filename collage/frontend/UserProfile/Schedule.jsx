import React, { useState, useEffect } from "react";
import '../CSS/Schedule.css';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, deleteObject } from "firebase/storage";
import Cookies from 'js-cookie';
import axios from 'axios';

// Firebase Configuration
const firebaseConfig = {
    apiKey: 'AIzaSyDc5B7m__Z77iTyQYmb9cXxrn7Bo3a9C18',
    authDomain: "collage-849c3.firebaseapp.com",
    projectId: "collage-849c3",
    storageBucket: "collage-849c3.appspot.com",
    messagingSenderId: "302505148937",
    appId: "1:302505148937:web:05f9caf3eb3bf860ac2ed8",
    measurementId: "G-FZFTH0MVNY"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const Schedule = ({userName, upload, isUser, userId}) => {
    const [imageFileName, setImageFileName] = useState('');
    const [imageUrl, setImgURL] = useState('');
    const [uid, setUid] = useState('');
    const fetchFiles = async(fetchUid) => {
        const possibleExtensions = ['jpg', 'png', 'jpeg'];

        for (const ext of possibleExtensions) {
            try {
                const scheduleRef = ref(storage, `users/${fetchUid}/schedule.${ext}`);
                const scheduleImageUrl = await getDownloadURL(scheduleRef);
                if (scheduleImageUrl) {
                    setImgURL(scheduleImageUrl);
                    setImageFileName(`schedule.${ext}`);
                    // console.log(`Schedule image found: ${scheduleImageUrl}`);
                    break; // Exit the loop once the file is found
                }
            } catch (error) {
                // Log errors but continue trying other extensions
                console.warn(`Failed to fetch schedule with extension .${ext}:`, error.message);
            }
        }
    };

    useEffect(() => {
        if (isUser){
            // console.log(userName);
            const fetchScheduleImage = async () => {
                try {
                    await axios.get(`/api/current-user`, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${Cookies.get('access_token')}`,
                        },
                    }).then(response => {setUid(response.data.uid); fetchFiles(response.data.uid); console.log(response.data.uid);});
                } catch (error) {
                    console.error('Failed to load schedule image:', error);
                }
            };

            fetchScheduleImage();
        } else {
            axios.get(`/api/get-schedule/${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`,
                },
            }).then(response => setImgURL(response.data.schedule_ics_url));
        }
    }, [userName, upload]);

    // Handle delete action
    const handleDelete = async () => {
        try {
            // Construct the reference to the file in Firebase Storage
            const scheduleRef = ref(storage, `users/${uid}/${imageFileName}`);
            // Delete the file
            await deleteObject(scheduleRef);
            // Update the UI after deletion
            setImgURL('');
            setImageFileName('');
            // console.log('Schedule image deleted successfully.');
        } catch (error) {
            console.error('Failed to delete schedule image:', error);
        }
    };

    return (
        // <div className="temp">
        //     <img src={schedule} alt="Schedule under construction" style={{width: "50vw", borderRadius: "15px"}}/>
        // </div>

        <div className="temp">
            {imageUrl ? (
                <div className="image" style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                    <img
                        src={imageUrl}
                        alt="User Schedule"
                        style={{ width: "50vw", borderRadius: "15px" }}
                    />
                    {isUser &&
                        <button
                            onClick={handleDelete}
                            style={{
                                marginTop: '10px',
                                color: 'red',
                                background: 'none',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                border: 'none',
                            }}>
                            Delete Schedule
                        </button>
                    }
                </div>

            ) : (
                <p>No Schedule</p>
            )}
        </div>

    )
}

export default Schedule;