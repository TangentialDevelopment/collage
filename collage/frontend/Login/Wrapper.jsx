import React, { useState, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Image, Title, Dialog, Text, TextInput, Button} from '@mantine/core';
import { useGoogleLogin } from "@react-oauth/google";
import '../CSS/Signup.css';
import googleLogo from '../images/google-logo.png';
import fullLogo from '../images/dark-logo.svg';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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
const auth = getAuth(app);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user; // Contains user information
};

const Login = ({loggedIn, setLoggedIn, registered, setRegistered}) => {
  const [invalidLogin, setInvalidLogin] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      // Send the user's ID token to the backend
      const idToken = await user.getIdToken();
      const loginResult = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      }).then((response) => response.json())
        .then((data) => {
        // console.log(data.registered);
        if (data.status === "failed"){
          setInvalidLogin(true);
          // alert('Please make sure you login with your .edu email.')
        }
        else{
          setLoggedIn(true);
          // console.log(loginDetails.registered);

          if (data.registered === true){
            setRegistered(true);
            navigate("/collage/home");
          }
          else{
            setRegistered(false);
            navigate("/collage/signup");
          }
        }
      });
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="wrapper-login">
      <Dialog
        opened={invalidLogin}
        withCloseButton
        onClose={() => setInvalidLogin(false)}
        size="lg"
        radius="lg"
        position={{ top: 20, left: 20 }}
      >
        <Text size="lg" style={{ marginBottom: 10 }} weight={500} color="red">
          Please make sure to use your .edu email
        </Text>
      </Dialog>
      <div className="collageTitle">
        <Image src={ fullLogo } width="20vw"/>
      </div>
      <div className="wrapperBoxLogin">
        <div className="wrapperNav"></div>
        <div className="wrapperTitle">
          <Title order={2}>Login or Register</Title>
        </div>
        <div className="wrapperContentLogin">
          <TextInput
            placeholder="Full Name (optional)"
            size="lg"
            styles={{
              label: { fontSize: 24, textAlign: 'left', alignContent: 'left' },
              input: { fontSize: 20 },
            }}
          />
          <br />
          <TextInput
            placeholder="University Name (optional)"
            size="lg"
            styles={{
              label: { fontSize: 24, textAlign: 'left', alignContent: 'left' },
              input: { fontSize: 20 },
            }}
          />
          <br />
          <Button variant='default' fullWidth size='lg' radius='xl' leftSection={<img src={googleLogo}/>} rightSection={<span/>} onClick={() => handleLogin()}>Continue with Google</Button>
        </div>
      </div>
    </div>
  );
};

export default Login;