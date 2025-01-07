import React from "react";
import '../CSS/UserResult.css';

const UserResult = ({key, name, username, profile_image, major, grad_year, follower_count, top_mutuals, right_component}) => {

    return (
        <>  
            <div className="wrapper" id={key}>
                <div className="left-section">
                    <img src={profile_image} alt="Profile Pic"/>
                    <h3>{name}</h3>
                    <p>@{username}, {major} '{grad_year}</p>
                    {top_mutuals.length === 2 ? (
                        <p>
                            {top_mutuals[0]} and {top_mutuals[1]} and {follower_count - 2} others follow
                        </p>
                    ) : (
                        <p>
                            {top_mutuals.join(', ')}
                        </p>
                    )}
                </div>
                <div className="right-section">
                    {right_component}
                </div>
            </div>
        </>
    );
};

export default UserResult;