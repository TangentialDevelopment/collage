// Use this file to test your components by adding a link to the one you are trying to see
// Add the route to registration.jsx in order to link here
import React, {lazy} from "react";
import { Link } from 'react-router-dom';
const Personal = lazy(() => import('./UserProfile/Personal'));

const Dev = () => {
    return (<div>
        <Link to="/collage/home">
            <button>Home</button>
        </Link>
        <Link to="/collage/network">
            <button>Network</button>
        </Link>
        <Link to="/collage/CoursePage">
            <button>Course Page</button>
        </Link>
        <Link to="/collage/classpreview">
            <button>Class Preview</button>
        </Link>
        <Link to="/collage/signup">
            <button>Signup</button>
        </Link>
        <Personal isUser={true} userId={3}/>
        </div>

    )
}

export default Dev;