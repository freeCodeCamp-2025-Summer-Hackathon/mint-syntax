import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import IdeaFormSection from './components/IdeaFormSection';
import IdeaSubmissionForm from './components/IdeaSubmissionForm';
import LandingPageContent from './components/LandingPageContent';
import HelpPage from './components/HelpPage';
import LoginPage from './pages/LoginPage';
import './styles.css';

function App() {
  return (
    <div id='top' className='body-style'>
      <Helmet>
        <title>Idea Forge</title>
        <meta
          name='description'
          content='A collaborative brainstorming board where users can post new ideas or feature requests, upvote, comment on, and suggest improvements for ideas, and see trending or implemented ideas.'
        />
      </Helmet>
      <div className='container-wrapper'>
        <Header />
        <Routes>
          <Route
            path='/'
            element={
              <>
                <IdeaFormSection count='3' />
                <IdeaSubmissionForm />
                <LandingPageContent />
              </>
            }
          />
          <Route path='/help' element={<HelpPage />} />
          <Route path='/login' element={<LoginPage />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default App;
