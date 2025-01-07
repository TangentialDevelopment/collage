import React, {useState, useEffect} from "react";
import headerImage from '../images/profile-header.png';
import batman from '../images/max-pic.png';
import gmail64 from '../images/gmail64.svg.png';
import linkedin64 from '../images/linkedin64.png';
import camera from '../images/change-profile.png';
import '../CSS/Personal.css';
import '../CSS/Search.css';
import { Popover, Group, Button, Text, rem, Select} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE} from '@mantine/dropzone';
import { IconUpload, IconX} from '@tabler/icons-react';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, getMetadata, uploadBytesResumable } from "firebase/storage";
import Cookies from 'js-cookie';
import axios from 'axios';

const firebaseConfig = {
  apiKey: 'AIzaSyDc5B7m__Z77iTyQYmb9cXxrn7Bo3a9C18',
  authDomain: "collage-849c3.firebaseapp.com",
  projectId: "collage-849c3",
  storageBucket: "collage-849c3.appspot.com",
  messagingSenderId: "302505148937",
  appId: "1:302505148937:web:05f9caf3eb3bf860ac2ed8",
  measurementId: "G-FZFTH0MVNY"
}

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const Personal = ({isUser, userId}) => {
  const majors = ['Actuarial Mathematics', 'Aerospace Engineering', 'Afroamerican and African Studies', 'American Culture', 'Anthropology', 'Applied Exercise Science', 'Archaeology', 'Archaeology of the Ancient Mediterranean', 'Architecture', 'Art and Design', 'Arts and Ideas in the Humanities', 'Asian Studies', 'Astronomy and Astrophysics', 'Biochemistry', 'Biological Physics', 'Biology', 'Biology, Health, and Society', 'Biomedical Engineering', 'Biomolecular Science', 'Biophysics', 'Biopsychology, Cognition, and Neuroscience', 'Business', 'Cellular and Molecular Biomedical Science', 'Chemical Engineering', 'Chemistry', 'Chinese Studies', 'Civil Engineering', 'Classical Civilization', 'Classical Languages and Literatures', 'Climate and Meteorology', 'Cognitive Science', 'Communication and Media', 'Community and Global Public Health', 'Comparative Culture and Identity', 'Comparative Literature', 'Composition', 'Computer Engineering', 'Computer Science', 'Creative Writing and Literature', 'Culture and Media', 'Dance', 'Data Science', 'Dental Hygiene', 'Drama', 'Earth and Environmental Sciences', 'Ecology, Evolution, and Biodiversity', 'Economics', 'Electrical Engineering', 'Elementary Teacher Education', 'Engineering Physics', 'English', 'Environment', 'Environment and Conservation', 'Environmental Engineering', 'Ethnic Studies', 'Film, Television, and Media', 'French and Francophone Studies', 'Gender and Health', 'General Studies', 'German', 'Global Environment and Health', 'Greek', 'History', 'History of Art', 'Honors Mathematics', 'Human Origins, Biology, and Behavior', 'Industrial and Operations Engineering', 'Information Analysis and Design', 'Interarts Performance', 'Interdisciplinary Astronomy', 'Interdisciplinary Chemical Sciences', 'Interdisciplinary Physics', 'International Security, Norms, and Cooperation', 'International Studies', 'Italian', 'Japanese Studies', 'Jazz & Contemporary Improvisation', 'Judaic Studies', 'Korean Studies', 'Latin American and Caribbean Studies', 'Latin Language and Literature', 'Latina/Latino Studies', 'Law, Justice, and Social Change', 'Learning, Equity, and Problem Solving for the Public Good', 'Linguistics', 'Materials Science and Engineering', 'Mathematical Sciences', 'Mathematics', 'Mathematics of Finance and Risk Management', 'Mechanical Engineering', 'Medical Anthropology', 'Microbiology', 'Middle East Studies', 'Middle Eastern and North African Studies', 'Molecular, Cellular, and Developmental Biology', 'Movement Science', 'Music', 'Music Education', 'Music Theory', 'Musical Theatre', 'Musicology', 'Naval Architecture and Marine Engineering', 'Neuroscience', 'Nuclear Engineering and Radiological Sciences', 'Nursing', 'Organ', 'Organizational Studies', 'Performing Arts Technology', 'Pharmaceutical Sciences', 'Philosophy', 'Philosophy, Politics, and Economics', 'Physics', 'Piano', 'Plant Biology', 'Polish', 'Political Economy and Development', 'Political Science', 'Politics, Law, and Economy', 'Power, Identity, and Inequality', 'Psychology', 'Public Health Sciences', 'Public Policy', 'Pure Mathematics', 'Robotics', 'Romance Languages and Literatures', 'Russian', 'Russian, East European, and Eurasian Studies', 'Screenwriting', 'Secondary Mathematics Teaching Certificate', 'Secondary Teacher Education', 'Social Theory and Practice', 'Sociology', 'Sociology and Social Work', 'Sociology of Health and Medicine', 'South Asian Studies', 'Southeast Asian Studies', 'Space Sciences and Engineering', 'Spanish', 'Sport Management', 'Statistics', 'Strings', 'Structural Biology', 'Theatre & Drama', 'Urban Technology', 'User Experience Design', 'Voice & Opera', 'Winds & Percussion', 'Women’s and Gender Studies'];
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [minor, setMinor] = useState('');
  const [major, setMajor] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    college: '',
    graduation_year: '',
    enrollment_date: '',
    linkedin_url: '',
    email: '',
    pronouns: '',
    full_name: '',
    follower_count: 0,
    following_count: 0,
    profile_img_url: '',
  });
  const [imageFileName, setImageFileName] = useState('');
  const [imageFile, setImageFile] = useState();
  const [opened, setOpened] = useState(false);
  const [imageUrl, setImgURL] = useState('');
  // const fetchPfp = async () => {
  //   const result = await fetch("/api/test-pfp", {
  //       method: "GET",
  //       credentials: "include",
  //       mode: "cors",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${Cookies.get('access_token')}`,
  //       },
  //     },)
  //     .then((response) => response.json())
  //     .then((data) => { setImgURL(data.profile_img_url);});
  // }

  // useEffect(() => {
  //   fetchPfp();
  // }, [])


  useEffect(() => {
    axios.get(`/api/registration-info/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Cookies.get('access_token')}`,
      },
    })
    .then(response => {
      const fetchedProfile = response.data['personal'];
      fetchedProfile.enrollment_date = formatDate(fetchedProfile.enrollment_date);
      setMajor(fetchedProfile.major);
      setMinor(fetchedProfile.minor);
      setProfile(fetchedProfile);
      // console.log(profile.linkedin_url);
      // console.log("ENROLLMENT", profile.full_name);
    })
    .catch(err => {console.error(err)});
  }, []);

  const parseEmail = (email) => {
    return email ? email.split('@')[0] : '';
  }

  const togglePopup = () => {
    setPopupVisible(!isPopupVisible);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Make POST request here
    profile.enrollment_date = isValidDateFormat(profile.enrollment_date) ? profile.enrollment_date : null;
    const payload = {
      profile: profile,
      major: major,
      minor: minor,
      user_id: userId
    };

    axios.post(`/api/update-profile`, payload, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get('access_token')}`,
            },
    })
    .then((response) => {

    })
    .catch((err) => console.error(err));
  }

  const handleImageUpload = (files) => {
    if (files && files[0]) {
      setImageFile(files[0]);
      setImageFileName(files[0].name);
      axios.get(`/api/current-user`, {
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Cookies.get('access_token')}`,
        },
    })
    .then((response) => {
      const storageRef = ref(storage, `photos/${response.data.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, files[0]);
      uploadTask.on("state_changed",
        (snapshot) => {
          //can track progress here
          const prog = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
        },
        (error) => {
          console.error('Photo upload failed:', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setProfile((prevProfile) => ({
              ...prevProfile,
              profile_img_url: url,
            }));
            fetch("/api/update-pfp", {
              method: "POST",
              credentials: "include",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Cookies.get('access_token')}`,
              },
              body: JSON.stringify({profile_img_url: url
              }),
            },);
          });
        }
      );
    })
    .catch((err) => console.error(err));
    }
    setOpened(false);
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    // console.log(dateString);
    if (isNaN(date)) {
        throw new Error("Invalid date format");
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function isValidDateFormat(date) {
      const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
      return regex.test(date);
  }


  return (
    <>
      {/* {userData ? ( */}
        <div className="personal-container">
          <div className="personal-header">
            <div className="header-image-container">
              {/* top header image */}
              <img src={headerImage} alt="image" className="header-image"/>

              {/* pencil button */}
              {/* {isUser && (
                <button onClick={togglePopup} className="pencil-button" style={{backgroundColor: "transparent"}}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="pencil-icon" width="44" height="44" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#2c3e50" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                    <path d="M13.5 6.5l4 4" />
                  </svg>
                </button>
              )} */}

              {/* popup box */}
              {isPopupVisible && (
                <div className="popup-overlay" onClick={togglePopup}>
                  <div className="popup-box" onClick={e => e.stopPropagation()}>
                    <div className="popup-header">
                      <h2>Edit Profile</h2>
                      <button onClick={togglePopup} className="close-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" width="44" height="44" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#2c3e50" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M18 6l-12 12" />
                          <path d="M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="popup-content">
                      <div className="form-group">
                        <p>Name</p>
                        <input
                          type="text"
                          name="name"
                          value={profile.full_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <p>Pronouns</p>
                        <input
                          type="text"
                          name="pronouns"
                          value={profile.pronouns}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                      <p>Major</p>
                      </div>
                      <Select
                        placeholder="Select your major"
                        data={majors}
                        searchable
                        value={major}
                        onChange={(major) => setMajor(major)}
                        styles={{
                          dropdown: {
                            zIndex: 1100, // Ensure it is above your popup-box z-index
                          },
                        }}
                      />
                      <div className="form-group">
                      <p>Minor</p>
                      </div>
                      <Select
                        placeholder="Select your minor"
                        data={majors}
                        name="minor"
                        searchable
                        value={minor}
                        onChange={(minor) => setMinor(minor)}
                        styles={{
                          dropdown: {
                            zIndex: 1100, // Ensure it is above your popup-box z-index
                          },
                        }}
                      />
                      <div className="form-group">
                        <p>College</p>
                        <input
                          type="text"
                          name="college"
                          value={profile.college}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <p>Graduation Year</p>
                        <input
                          type="text"
                          name="graduation_year"
                          value={profile.graduation_year}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <p>Enrollment Date (YYYY-MM-DD)</p>
                        <input
                          type="text"
                          name="enrollment_date"
                          value={profile.enrollment_date}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <p>LinkedIn URL</p>
                        <input
                          type="text"
                          name="linkedin_url"
                          value={profile.linkedin_url}
                          onChange={handleChange}
                        />
                      </div>
                      {/* <div className="form-group">
                        <p>Email</p>
                        <input
                          type="text"
                          name="email"
                          value={profile.email}
                          onChange={handleChange}
                        />
                      </div> */}
                    </div>
                    <div className="popup-footer">
                      <button onClick={() => { handleSubmit(); togglePopup(); }} className="save-btn">Save Changes</button>
                    </div>
                  </div>
                </div>
              )}

              {/* profile picture */}
              <img src={profile.profile_img_url} alt="Profile" className="profile-picture" />

              {/* camera button */}
              {isUser && (
                <Popover width={300} opened={opened} closeOnClickOutside={false} closeOnEscape={false} onClose={() => setOpened(false)} trapFocus position="bottom" withArrow shadow="md">
                  <Popover.Target>
                    <button onClick={() => setOpened(true)} className="camera-button">
                      <img src={camera} alt="Camera" className="camera"/>
                    </button>
                  </Popover.Target>
                <Popover.Dropdown  styles={{dropdown: {color: "black", backgroundColor: "white"}}} radius="md">
                <Dropzone
                  multiple={false}
                  style={{ height: "100%", color: '#5d5d5d' }}
                  onDrop={handleImageUpload}
                  // onReject={(files) => console.log('rejected files', files)}
                  maxSize={5 * 1024 ** 2}
                  accept={IMAGE_MIME_TYPE}
                  className="resume-drop"
                >
                  <Group position="center" spacing="xl" mih={60} style={{ pointerEvents: 'none' }}>
                    <Dropzone.Accept>
                      <IconUpload
                        style={{ width: "100%", height: "100%", color: 'var(--mantine-color-blue-6)' }}
                        stroke={1.5}
                      />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                      <IconX
                        style={{ width: "100%", height: "100%", color: 'var(--mantine-color-red-6)' }}
                        stroke={1.5}
                      />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                      <IconUpload
                        style={{ width: rem(30), height: rem(30), color: 'var(--mantine-color-dimmed)' }}
                        stroke={1.5}
                      />
                    </Dropzone.Idle>
                    <Text size="md">
                      {'Click or drag file here to upload photo'}
                    </Text>
                  </Group>
                </Dropzone>
                  <div className='filters-footer'>
                    <div className='confirm-button'>
                      <Button
                              styles={{root: {color: "black"}}} autoContrast="false" variant="filled" color="#D9D9D9"
                              radius="xl" onClick={() => { setOpened(false);}} size="xs">
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
                </Popover.Dropdown>
                </Popover>

              )}
            </div>

            <div className="header-content">
              <h1 className="name">{profile.full_name}</h1>
              <p className="user-tag">@{parseEmail(profile.email)} &nbsp; | &nbsp; {profile.pronouns}</p>

              {/* edit profile button */}
              {isUser && (
                <button className="edit-icon" style={{padding: "15px 0px 0px 0px"}} onClick={togglePopup}>edit profile</button>
              )}

              <div className="icons">
                {profile.email ? (
                  <button onClick={() => window.location.href = `mailto:${profile.email}`} className="email">
                    <img src={gmail64} alt="gmail"/>
                  </button>
                ) : (
                  <button disabled className="email-disabled">
                    <img src={gmail64} alt="gmail"/>
                  </button>
                )}

                {profile.linkedin_url ? (
                  <button onClick={() => {
                    const url = profile.linkedin_url.startsWith('http')
                      ? profile.linkedin_url
                      : `https://${profile.linkedin_url}`;
                    window.open(url, '_blank');
                  }}
                  className="linkedin">
                    <img src={linkedin64} alt="gmail"/>
                  </button>
                ) : (
                  <button disabled className="linkedin-disabled">
                    <img src={linkedin64} alt="gmail"/>
                  </button>
                )}
              </div>

              <div className="followers">
                <p>{profile.follower_count} connections</p>
                {/* <p>{profile.following_count} following</p> */}
              </div>
              {/* <div className="logout">
                <Button radius="xl" color="rgba(189, 189, 189, 1)" onClick={() => logout() } className="logout-button">Logout</Button>
              </div> */}
            </div>

          </div>
          <div className="personal-info">
            <p className="label">MAJOR</p>
            <p className="data">{major}</p>
            <p className="label">MINOR</p>
            <p className="data">{minor ? minor : "No minor"}</p>
            <p className="label">COLLEGE</p>
            <p className="data">{profile.college}</p>
            <p className="label">GRADUATION YEAR</p>
            <p className="data">{profile.graduation_year}</p>
          </div>

        </div>
      {/* ) : (
        <p>Loading...</p>
      )} */}
    </>
  );
};

export default Personal;