import React, { lazy } from "react";
import {MantineProvider} from '@mantine/core';
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';

// import Registration from "./registration";
const Registration = lazy(() => import('./registration'));


// Create a root
const root = createRoot(document.getElementById("reactEntry"));

// This method is only called once
// Insert the post component into the DOM
root.render(
  <MantineProvider theme={{
    fontFamily: 'DM Sans'}}>
      <GoogleOAuthProvider clientId="302505148937-nff5el9dgjdjdbim7u3i1nv8h4gn8gqv.apps.googleusercontent.com">
        <Registration/>
      </GoogleOAuthProvider>
  </MantineProvider>
);

// testing: clientID should be set to 302505148937-crgfo4fb3b9r8aboosgdn50tg1ordufc.apps.googleusercontent.com
// deployment: clientID should be set to 302505148937-nff5el9dgjdjdbim7u3i1nv8h4gn8gqv.apps.googleusercontent.com
