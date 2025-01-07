import React, {useState} from 'react';
import { Button } from '@mantine/core';
import '../CSS/Signup.css';

const InterestsButton = ({title, interests, setInterests}) => {
    const [clicked, setClicked] = useState(false);
    return <div key={title} className="interests-button">
        {!clicked && <Button size="compact-sm" key={title} onClick={(e) => {if(clicked) {setInterests(interests.filter((item) => item !== title))} else {setInterests([...interests, title])} setClicked(!clicked);}} radius="xl" variant="default">{title}</Button>}
        {clicked && <Button size="compact-sm" key={title} onClick={(e) => {if(clicked) {setInterests(interests.filter((item) => item !== title))} else {setInterests([...interests, title])} setClicked(!clicked);}} radius="xl" variant="filled" color="gray">{title}</Button>}
  </div>
}

export default InterestsButton;