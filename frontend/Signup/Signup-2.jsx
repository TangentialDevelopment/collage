import React, {useEffect} from 'react';
import { NumberInput, Select } from '@mantine/core';
import '../CSS/Signup.css';

const Signup2 = ({major, setMajor, startYear, setStartYear, gradYear, setGradYear, valid, setValid}) => {
  const majors = ['Actuarial Mathematics', 'Aerospace Engineering', 'Afroamerican and African Studies', 'American Culture', 'Anthropology', 'Applied Exercise Science', 'Archaeology', 'Archaeology of the Ancient Mediterranean', 'Architecture', 'Art and Design', 'Arts and Ideas in the Humanities', 'Asian Studies', 'Astronomy and Astrophysics', 'Biochemistry', 'Biological Physics', 'Biology', 'Biology, Health, and Society', 'Biomedical Engineering', 'Biomolecular Science', 'Biophysics', 'Biopsychology, Cognition, and Neuroscience', 'Business', 'Cellular and Molecular Biomedical Science', 'Chemical Engineering', 'Chemistry', 'Chinese Studies', 'Civil Engineering', 'Classical Civilization', 'Classical Languages and Literatures', 'Climate and Meteorology', 'Cognitive Science', 'Communication and Media', 'Community and Global Public Health', 'Comparative Culture and Identity', 'Comparative Literature', 'Composition', 'Computer Engineering', 'Computer Science', 'Creative Writing and Literature', 'Culture and Media', 'Dance', 'Data Science', 'Dental Hygiene', 'Drama', 'Earth and Environmental Sciences', 'Ecology, Evolution, and Biodiversity', 'Economics', 'Electrical Engineering', 'Elementary Teacher Education', 'Engineering Physics', 'English', 'Environment', 'Environment and Conservation', 'Environmental Engineering', 'Ethnic Studies', 'Film, Television, and Media', 'French and Francophone Studies', 'Gender and Health', 'General Studies', 'German', 'Global Environment and Health', 'Greek', 'History', 'History of Art', 'Honors Mathematics', 'Human Origins, Biology, and Behavior', 'Industrial and Operations Engineering', 'Information Analysis and Design', 'Interarts Performance', 'Interdisciplinary Astronomy', 'Interdisciplinary Chemical Sciences', 'Interdisciplinary Physics', 'International Security, Norms, and Cooperation', 'International Studies', 'Italian', 'Japanese Studies', 'Jazz & Contemporary Improvisation', 'Judaic Studies', 'Korean Studies', 'Latin American and Caribbean Studies', 'Latin Language and Literature', 'Latina/Latino Studies', 'Law, Justice, and Social Change', 'Learning, Equity, and Problem Solving for the Public Good', 'Linguistics', 'Materials Science and Engineering', 'Mathematical Sciences', 'Mathematics', 'Mathematics of Finance and Risk Management', 'Mechanical Engineering', 'Medical Anthropology', 'Microbiology', 'Middle East Studies', 'Middle Eastern and North African Studies', 'Molecular, Cellular, and Developmental Biology', 'Movement Science', 'Music', 'Music Education', 'Music Theory', 'Musical Theatre', 'Musicology', 'Naval Architecture and Marine Engineering', 'Neuroscience', 'Nuclear Engineering and Radiological Sciences', 'Nursing', 'Organ', 'Organizational Studies', 'Performing Arts Technology', 'Pharmaceutical Sciences', 'Philosophy', 'Philosophy, Politics, and Economics', 'Physics', 'Piano', 'Plant Biology', 'Polish', 'Political Economy and Development', 'Political Science', 'Politics, Law, and Economy', 'Power, Identity, and Inequality', 'Psychology', 'Public Health Sciences', 'Public Policy', 'Pure Mathematics', 'Robotics', 'Romance Languages and Literatures', 'Russian', 'Russian, East European, and Eurasian Studies', 'Screenwriting', 'Secondary Mathematics Teaching Certificate', 'Secondary Teacher Education', 'Social Theory and Practice', 'Sociology', 'Sociology and Social Work', 'Sociology of Health and Medicine', 'South Asian Studies', 'Southeast Asian Studies', 'Space Sciences and Engineering', 'Spanish', 'Sport Management', 'Statistics', 'Strings', 'Structural Biology', 'Theatre & Drama', 'Urban Technology', 'User Experience Design', 'Voice & Opera', 'Winds & Percussion', 'Women’s and Gender Studies'];
  const checkValid = (e) => {
    if (major !== ''){
      setValid(true);
    }
    else{
      setValid(false);
    }
  }
  useEffect((e) => {checkValid(e)}, [major])
  return <div>
      <Select
        label="Major"
        placeholder="Select your major"
        data={majors}
        searchable
        value={major}
        onChange={(major) => setMajor(major)}
        size="lg"
      />
      <br/>
      <div className='dropDownLine'>
        <div className='dropDown1'>
        <NumberInput value={startYear} onChange={setStartYear} label="Start year" size="lg"
                  styles={
                    {
                      label: {fontSize: 20, textAlign: 'left', alignContent: 'left', color: '#5d5d5d'},
                      input: {fontSize: 20}
                    }
                  }
                  min={2020}
                  max={2025}
        />
        </div>
        <div className='dropDown2'>
        <NumberInput value={gradYear} onChange={setGradYear} label="Expected End Year" size="lg"
                  styles={
                    {
                      label: {fontSize: 20, textAlign: 'left', alignContent: 'left', color: '#5d5d5d'},
                      input: {fontSize: 20}
                    }
                  }
                  min={2025}
                  max={2032}
        />
        </div>
      </div>
  </div>;
  //first text input is required with Label: What's your major and year? Placeholder: Major (intended or declared)
  //next is two side by side native selects with the start and grad years, both are required
  //error occurs if end year is less than start year
};

export default Signup2;