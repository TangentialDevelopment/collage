import React, { Suspense, useState, lazy } from "react";
// import PropTypes from "prop-types";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Title, Button, Group } from '@mantine/core';
const LandingNew = lazy(() => import('./Landing/Landing-new'));
const Signup = lazy(() => import('./Signup/Wrapper'));
const Login = lazy(() => import('./Login/Wrapper'));
const Classpreview = lazy(() => import('./Class/Preview'));
const Personal = lazy(() => import('./UserProfile/Personal'));
const FileUpload = lazy(() => import('./UserProfile/FileUpload'));
const Requests = lazy(() => import('./Network/Requests'));
const Savedcourses = lazy(() => import('./UserProfile/Savedcourses'));
const UserProfile = lazy(() => import('./UserProfile/UserProfile'));
// const Schedule = lazy(() => import('./UserProfile/Schedule'));
// const ActivityGlimpse = lazy(() => import('./UserProfile/ActivityGlimpse'));
// const Dev = lazy(() => import('./HomeWrapper'));
const Dev = lazy(() => import('./Dev'));
// const Footer = lazy(() => import('./Footer/Footer'));
const Home = lazy(() => import('./HomeWrapper'));
const NetworkWrapper = lazy(() => import('./Network/NetworkWrapper'));
const Loading = lazy(() => import('./loading/LoadScreen'));
const Signup4 = lazy(() => import('./Signup/Signup-4'));
const Privacy = lazy(() => import('./Legal/PrivacyPolicy'));
const Terms = lazy(() => import('./Legal/TermsConditions'));

export default function Registration() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [registered, setRegistered] = useState(false);
  return (
    <>
    <Suspense fallback={<Loading/>}>
        <Router>
          <div>
            <Routes>
              <Route path="/" element={<LandingNew />} />
              <Route path="/collage/login" element={<Login loggedIn={loggedIn} setLoggedIn={setLoggedIn} registered={registered} setRegistered={setRegistered}/>} />
              <Route path="/collage/signup" element={<Signup setLoggedIn={setLoggedIn} setRegistered={setRegistered}/>} />
              <Route path="/collage/classpreview" element={<Classpreview />} />
              <Route path="/collage/savedcourses" element={<Savedcourses />} />
              <Route path="/collage/profile" element={<Personal isUser={true} userName="hello"/>}/>
              <Route path="/collage/file" element={<FileUpload />}/>
              <Route path="/collage/classpreview" element={<Classpreview />} />
              <Route path="/collage/savedcourses" element={<Savedcourses />} />
              <Route path="/collage/userprofile" element={<UserProfile />} />
              <Route path="/collage/requests" element={<Requests />} />
              <Route path="/collage/dev" element={<Dev />} />
              <Route path="/collage/home" element={<Home />} />
              <Route path="/collage/network" element={<NetworkWrapper/>}/>
              <Route path="/collage/loading" element={<Loading/>}/>
              {/* <Route path="/collage/Footer" element={<Footer/>}/> */}
              <Route path="/collage/PrivacyPolicy" element={<Privacy/>}/>
              <Route path="/collage/Terms" element={<Terms/>}/>
            </Routes>
          </div>
        </Router>
      </Suspense>
    </>
  );
};