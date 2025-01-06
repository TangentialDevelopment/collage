# Main.py Documentation

This document provides an overview of the `main.py` script, including its functionality, key components, and API endpoints.

## Overview

The `main.py` script is the core of a Flask-based web application, leveraging tools like Firebase, JWT authentication, PyPDF2 for PDF parsing, and various libraries for NLP and database operations. It supports user authentication, profile management, course suggestions, and more.

## Setup

1. **Environment Variables**:
   - `JWT_SECRET_KEY`: Secret key for JWT authentication.
   - `GOOGLE_CLIENT_ID` and `GOOGLE_SECRET_KEY`: Required for Google authentication.
   - `FIREBASE_CONFIG`: Firebase configuration in JSON format.

2. **Dependencies**:
   - Flask and related extensions: `flask`, `flask_jwt_extended`, `flask_cors`
   - Firebase Admin SDK: `firebase_admin`
   - NLP and data manipulation: `PyPDF2`, `sklearn`

3. **CORS and JWT**:
   - CORS is enabled globally for the app.
   - JWT authentication is configured to secure API endpoints.

---

## Functions

### 1. **PDF Processing**

#### `extract_text_from_pdf(file_path)`
- **Purpose**: Extracts text from a given PDF file.
- **Arguments**: `file_path` (str): Path to the PDF file.
- **Returns**: Extracted text as a string.

#### `extract_keywords_from_resume(file_path)`
- **Purpose**: Extracts keywords from a resume PDF using TF-IDF.
- **Arguments**: `file_path` (str): Path to the resume PDF.
- **Returns**: List of extracted keywords.

### 2. **User Keyword Management**

#### `update_user_keywords()`
- **Purpose**: Updates a user's keywords based on their uploaded resume.
- **Returns**: User's keywords as a comma-separated string.

### 3. **Similarity Calculation**

#### `calculate_similarity(user_keywords, course_keywords)`
- **Purpose**: Calculates the similarity between user and course keywords.
- **Arguments**:
  - `user_keywords` (list): User's keywords.
  - `course_keywords` (list): Keywords associated with a course.
- **Returns**: A similarity score (1, 0.5, or 0).

### 4. **User Verification**

#### `verify_user()`
- **Purpose**: Ensures the logged-in user has completed their profile.
- **Returns**: A JSON response indicating registration status.

---

## API Endpoints

### Authentication

#### `GET /api/`
- **Purpose**: Test endpoint to check if the server is working.
- **Response**: `{ "working": true }`

#### `POST /api/login/`
- **Purpose**: Logs in a user with a Google ID token.
- **Authentication**: Not required.
- **Response**: Status of the login and JWT token in cookies.

#### `POST /api/signup/`
- **Purpose**: Registers a new user.
- **Authentication**: JWT required.

#### `GET /api/logout/`
- **Purpose**: Logs out the user and clears session data.
- **Authentication**: JWT required.

### User Profile

#### `GET /api/current-user/`
- **Purpose**: Retrieves the current user's email prefix and UID.
- **Authentication**: JWT required.

#### `GET /api/current-user-id/`
- **Purpose**: Fetches the user's database ID.
- **Authentication**: JWT required.

#### `POST /api/view-profile/`
- **Purpose**: Logs a profile view for analytics.
- **Authentication**: JWT required.

### Course Management

#### `GET /api/filters/`
- **Purpose**: Retrieves available course filters.
- **Authentication**: JWT required.

#### `GET /api/courses/`
- **Purpose**: Fetches a list of courses (limited to 10 entries).
- **Authentication**: JWT required.

#### `GET /api/individual-course/<course_id>`
- **Purpose**: Fetches detailed information about a specific course.
- **Authentication**: JWT required.

#### `POST /api/search/`
- **Purpose**: Searches courses using filters and keywords.
- **Authentication**: JWT required.

#### `GET /api/suggested-connections/<course_id>`
- **Purpose**: Suggests potential connections for a course.
- **Authentication**: JWT required.

### Rating Management

#### `POST /api/rate`
- **Purpose**: Updates or adds a course rating from the user.
- **Authentication**: JWT required.

### Miscellaneous

#### `GET /api/update-courses/`
- **Purpose**: Updates course metadata.
- **Authentication**: JWT required.

#### `GET /api/delete/`
- **Purpose**: Deletes a test user account.
- **Authentication**: Not required.

#### `GET /api/get-mailing/`
- **Purpose**: Fetches emails of subscribed users.
- **Authentication**: Not required.

---

## Key Considerations

1. **Security**: Ensure sensitive endpoints require JWT authentication and proper validation.
2. **Error Handling**: Add robust error handling for database and external API calls.
3. **Performance**: Optimize database queries and consider caching for frequently accessed data.

---

## Future Enhancements
- Add more detailed course descriptions.
- Implement a recommendation system based on user activity.
- Provide a frontend for easier navigation and testing.
