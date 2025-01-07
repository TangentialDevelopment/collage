import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Card = styled.div`
  background-color: #ff8a80;
  border-radius: 8px;
  padding: 16px;
  color: #333;
  font-family: Arial, sans-serif;
  position: relative;
  width: 300px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: white;
`;

const EditButton = styled.button`
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
`;

const InfoBlock = styled.div`
  background-color: #333;
  color: white;
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
  font-size: 14px;
  text-align: center;
`;

const CreditsInfo = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: #000;
  margin-top: 10px;
`;

const RegistrationInfo = () => {
  const [registrationData, setRegistrationData] = useState(null);

  useEffect(() => {
    axios.get('/api/registration-info', { params: { user_id: 1 } }, {
      headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get('access_token')}`,
      },
  })
      .then((response) => setRegistrationData(response.data))
      .catch((error) => console.error('Error fetching registration info:', error));
  }, []);

  return (
    <Card>
      <Header>
        <span>Registration Information</span>
        <EditButton>Edit</EditButton>
      </Header>
      {registrationData && (
        <>
          <CreditsInfo>
            <p>Credits Completed: {registrationData.credits_completed}</p>
            <p>Credits to Complete:</p>
            <ul>
              <li>For Major: {registrationData.credits_to_complete_major}</li>
              <li>For Minor 1: {registrationData.credits_to_complete_minor1}</li>
              <li>For Minor 2: {registrationData.credits_to_complete_minor2}</li>
            </ul>
          </CreditsInfo>
          <InfoBlock>
            <p>Registration Date: {registrationData.registration_date}</p>
          </InfoBlock>
          <InfoBlock>
            <p>Registration Term: {registrationData.registration_term}</p>
          </InfoBlock>
        </>
      )}
    </Card>
  );
};

export default RegistrationInfo;
