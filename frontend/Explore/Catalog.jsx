import React, {useState, lazy, useEffect} from 'react';
import courseIcon from '../images/temp.png';
import { Title } from '@mantine/core';
const Sidebar = lazy(() => import('./Sidebar'));
const CourseTag = lazy(() => import('./CourseTag'));
const IndividualCourse = lazy(() => import('../Class/IndividualCourse'));

const Catalog = ({currData, refetch, handleExploreMore}) => {
    // const sampleData = [{course_code: "ECON 101", course_name: "Principles of Economics I", percent_match: "95%",
    //                     rating: 3, num_ratings: 243, tags: ["Intro", "Econ", "LSA"], icon_url: courseIcon, credit_hours: 4,
    //                     credit_color: "red", header_color: "green", icon_color: "blue"
    //                     }, {course_code: "ECON 201", course_name: "Principles of Economics I", percent_match: "95%",
    //                     rating: 3, num_ratings: 243, tags: ["Intro", "Econ", "LSA"], icon_url: courseIcon, credit_hours: 4,
    //                     credit_color: "red", header_color: "green", icon_color: "blue"
    //                     }]
    const [course, setCourse] = useState(false);
    const [courseId, setCourseId] = useState('econ101'); // just set course data and pass it
    const [percentMatch, setPercentMatch] = useState(0);
    const handleBack = () => {
        setCourse(false);
    };
    // console.log(currData)
    return (<>
            {!course && <>
                <div className="left-col"><Sidebar/></div>
                <div className="right-col">
                    <div className="wrapper-grid">
                        {currData.length < 1 && <Title>No Results Found</Title>}
                        {currData.length > 0 && currData.map((data) => <CourseTag id={data.course_id} key={data.course_id} data={data} onClick={() => {setCourse(true); setCourseId(data.course_id); setPercentMatch(data.percent_match);}}/>)}
                    </div>
                </div></>}
            {course && <IndividualCourse courseId={courseId} handleBack={handleBack} refetch={refetch} handleExploreMore={handleExploreMore} percentMatch={percentMatch}/>}</>
    )
};

export default Catalog;