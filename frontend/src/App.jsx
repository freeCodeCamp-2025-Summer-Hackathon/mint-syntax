import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import IdeaFormSection from './components/IdeaFormSection.jsx';
import IdeaSubmissionForm from './components/IdeaSubmissionForm.jsx';
import LandingPageContent from './components/LandingPageContent.jsx';
import HelpPage from './components/HelpPage.jsx';
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
                <IdeaFormSection />
                <IdeaSubmissionForm />
                <LandingPageContent />
              </>
            }
          />
          <Route path='/help' element={<HelpPage />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default App;
