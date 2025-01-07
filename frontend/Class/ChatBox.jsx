import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import styled from 'styled-components';
import '../CSS/classPreview.css';

const ChatSection = styled.div`
  background-color: #f0f4ff;
  padding: 20px;
  flex: 2;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  border: 1px solid #c3c3c3;
  border-radius: 31px;
  height: 453px;
  margin-top: 45px;
`;

const TabButton = styled.button`
  padding: 10px;
  font-size: 14px;
  background-color: ${({ active }) => (active ? '#333' : '#f0f0f0')};
  color: ${({ active }) => (active ? '#fff' : '#333')};
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-right: 5px;
`;

const ChatInput = styled.input`
  border: none;
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
  font-size: 16px;
`;

const ChatBox = ({ courseId }) => {
  const [activeTab, setActiveTab] = useState('Academic');
  const [query, setQuery] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);

  const placeholderQuestions = {
    Academic: "How intense is the course load in this course?",
    Content: "Tell more about the main topics covered in this course?",
    Professional: "How does this course apply to real-world careers?"
  };

  const handleTabChange = (tab) => setActiveTab(tab);

  useEffect(() => {
    if (courseId) {
      const fetchCourseData = async () => {
        try {
          const response = await axios.get(`/api/individual-course/${courseId}`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Cookies.get('access_token')}`,
            },
          });
          setCourseData(response.data);
        } catch (error) {
          console.error("Error fetching course data:", error);
        }
      };
      fetchCourseData();
    } else {
      console.warn("No course ID provided to fetch course data.");
    }
  }, [courseId]);

  const handleCourseFinder = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const newMessage = { role: 'user', content: query };
    const updatedHistory = [...conversationHistory, newMessage];

    try {
      const payload = {
        query,
        course: {
          name: courseData?.course_name,
          description: courseData?.course_description,
          credits: courseData?.credit_hours,
          department: courseData?.department,
          tags: [courseData?.tag_1, courseData?.tag_2, courseData?.tag_3, courseData?.tag_4, courseData?.tag_5].filter(Boolean),
        },
        tab: activeTab,
        history: updatedHistory,
      };
      setQuery('');

      const res = await axios.post('/api/ai-course-finder', payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get('access_token')}`,
        },
      });
      const aiMessage = { role: 'assistant', content: res.data.response || 'No AI response available' };
      setConversationHistory([...updatedHistory, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault(); // Prevent the default tab behavior
      if (!query) setQuery(placeholderQuestions[activeTab]);
    } else if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default enter behavior
      handleCourseFinder();
    }
  };

  return (
    <div className="chat-box">
      <ChatSection>
        <div style={{ display: 'flex', gap: '10px' }}>
          <TabButton active={activeTab === 'Academic'} onClick={() => handleTabChange('Academic')}>Academic</TabButton>
          <TabButton active={activeTab === 'Content'} onClick={() => handleTabChange('Content')}>Content</TabButton>
          <TabButton active={activeTab === 'Professional'} onClick={() => handleTabChange('Professional')}>Professional</TabButton>
        </div>
        <div style={{ overflowY: 'scroll', flex: 1, padding: '10px', marginTop: '15px', backgroundColor: '#fff', borderRadius: '8px' }}>
          {conversationHistory.map((msg, index) => (
            <div key={index} style={{ margin: '10px 0', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <strong>{msg.role === 'user' ? 'You:' : 'Collage AI:'}</strong> {msg.content}
            </div>
          ))}
          {loading && <div>Thinking...</div>}
        </div>
        <ChatInput
          type="text"
          placeholder={placeholderQuestions[activeTab]}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress} // Handle Tab and Enter keys
        />
        <button onClick={handleCourseFinder} style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#333', color: '#fff', border: 'none', marginTop: '10px', cursor: 'pointer' }}>
          Ask Collage AI
        </button>
      </ChatSection>
    </div>
  );
};

export default ChatBox;
