import React, {useState, useEffect, lazy} from "react";
import { Button, Popover } from '@mantine/core';
import { IconBookmark, IconStar, IconBookmarkFilled } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import '../CSS/Search.css';
import '../CSS/classPreview.css';
import '../CSS/course_tag.css';
import starFilled from '../Icons/starFilled.svg';
import starEmpty from '../Icons/starEmpty.svg';
import Cookies from 'js-cookie';
import axios from 'axios';
// import fullLogo from '../images/full-logo.png';
import icon from '../images/temp.png';
const Rating = lazy(() => import('./rating'))

const Preview = ({courseId, refetch, percentMatch}) => {
    const [opened, setOpened] = useState(false);
    const [value, setValue] = useState(2);
    const [saved, setSaved] = useState(false);
    const [courseData, setCourseData] = useState();
    const updateValue = (value) => {
        setValue(value);
    }

    useEffect(() => {
        axios.get(`/api/is-course-saved/${courseId}`, { 
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Cookies.get('access_token')}`,
            },
        })
        .then(response => {
            setSaved(response.data['is_saved']);
        })
        .catch(err => {console.error(err)});
    }, [saved]);

    const handleSave = async () => {
        if(!saved){
            fetch(`/api/save-course`, {
                method: "POST",
                credentials: "include",
                mode: "cors",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Cookies.get('access_token')}`,
                },
                body: JSON.stringify({course_id: courseId}),
              },)
              .then(() => setSaved(!saved))
        }
        else {
            fetch(`/api/delete-saved-course`, {
                method: "DELETE",
                credentials: "include",
                mode: "cors",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Cookies.get('access_token')}`,
                },
                body: JSON.stringify({course_id: courseId}),
              },)
              .then(() => {setSaved(!saved);})
        }
        
    }

    const handleRate = () => {
        fetch(`/api/rate`, {
            method: "POST",
            credentials: "include",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Cookies.get('access_token')}`,
            },
            body: JSON.stringify({course_id: courseId,
                                  rating: value}),
            },)
            .then(() => {setOpened(false); fetchPreview(); refetch();})
    }
    const fetchPreview = async () => {
        const result = await fetch(`/api/individual-course/${courseId.toString()}`, {
            method: "GET",
            credentials: "include",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Cookies.get('access_token')}`,
            },
          },)
          .then((response) => response.json())
          .then((data) => { setCourseData(data);});
    }
    useEffect(() => {fetchPreview()}, []);

    const sampleData = {course_code: "ECON 101", course_name: "Principles of Economics I", percent_match: "95%",
                        rating: 3, num_ratings: 243, tags: ["Intro", "Econ", "LSA"], icon_url: icon, credit_hours: 4,
                        credit_color: "red", header_color: "green", icon_color: "blue", course_description: "Temporary course description",
                        open_status: "open", saved: false, department: "LSA", class_topic: "ECON"
                        }

    return (<>
        <div className="content">
            {courseData && <div className="preview">
                <div className="card">
                    <div className="title-grid">
                        <img src={courseData.icon_url} alt="classicon" className="icon" />
                        <div className="middle">
                            <h1>{courseData.course_code}</h1>
                            <p>{courseData.course_name}</p>
                            <p className="match">{percentMatch}% match</p>
                        </div>
                        <div className="rating-flex">
                            <div className="rate-and-save">
                                {saved && <Button variant="default" radius="xl" rightSection={<IconBookmarkFilled color="black" size={20} stroke={1}/>} onClick={()=>handleSave()}>Saved</Button>}
                                {!saved && <Button variant="default" radius="xl" rightSection={<IconBookmark size={20} stroke={1}/> } onClick={()=>handleSave()}>Save</Button>}
                                <Popover width={300} opened={opened} closeOnClickOutside={false} closeOnEscape={false} onClose={() => setOpened(false)} trapFocus position="bottom" withArrow shadow="md">
                                <Popover.Target>
                                    <Button variant="default" radius="xl"  onClick={()=> setOpened(true)} rightSection={<IconStar size={20} stroke={1} onClick={()=> setOpened(true)}/>}>Rate</Button>
                                </Popover.Target>

                                    <Popover.Dropdown  styles={{dropdown: {color: "black", backgroundColor: "white"}}} radius="md">
                                    <div className="rating">
                                        <Rating fractions={2} defaultValue={5} value={value} updateValue={updateValue}/>
                                        <div className='filters-footer'>
                                            <div className='confirm-button'>
                                            <Button
                                                    styles={{root: {color: "black"}}} autoContrast="false" variant="filled" color="#D9D9D9"
                                                    radius="xl" onClick={() => {handleRate()}} size="xs">
                                                        Confirm
                                            </Button>
                                            </div>
                                            <div className='cancel-button'>
                                            <Button
                                                    styles={{root: {color: "black"}}} autoContrast="false" variant="filled" color="#D9D9D9"
                                                    radius="xl" onClick={() => { setOpened(false);}} size="xs">
                                                        Cancel
                                            </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Popover.Dropdown>
                                </Popover>

                            </div>
                            <div className="rating-row">
                            <div>
                                {Array(5).fill(0).map((_, index) => (
                                    <span key={index} className="star">
                                        {index < courseData.rating ? (
                                        <img className='star' src= {starFilled} alt="S" />
                                        ) : (
                                        <img src= {starEmpty} alt="E" />
                                        )}
                                    </span>
                                    ))}
                            </div>
                                <span className='star-text'>({courseData.num_ratings})</span>
                            </div>
                        </div>
                    </div>
                    <div className="newLine">
                        <div className="class-info">
                            <p className="class-title">Credits</p>
                            <p className="value credits">{courseData.credit_hours}</p>
                        </div>
                        <div className="class-info">
                            <p className="class-title">Subject</p>
                            <p className="value subject">{courseData.class_topic}</p>
                        </div>
                        <div className="class-info">
                            <p className="class-title">Department</p>
                            <p className="value department">{courseData.department}</p>
                        </div>
                        <div className="class-info">
                            <p className="class-title">Status</p>
                            <p className="value status">{courseData.open_status}</p>
                        </div>
                    </div>
                </div>
                <div className="class-description">
                    <h2 className="desTitle">Course Tags</h2>
                    <div className="tags">
                        <div className="tag" style={{ fontSize: "1rem" }}>
                            {courseData.tag_1}
                        </div>
                        <div className="tag" style={{ fontSize: "1rem" }}>
                            {courseData.tag_2}
                        </div>
                        <div className="tag" style={{ fontSize: "1rem" }}>
                            {courseData.tag_3}
                        </div>
                        <div className="tag" style={{ fontSize: "1rem" }}>
                            {courseData.tag_4}
                        </div>
                        <div className="tag" style={{ fontSize: "1rem" }}>
                            {courseData.tag_5}
                        </div>
                    </div>
                </div>
            </div>}
        </div>
        </>
    )
}

export default Preview