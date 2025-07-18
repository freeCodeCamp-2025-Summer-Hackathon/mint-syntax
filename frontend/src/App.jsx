import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import Header from './components/Header';
import Footer from './components/Footer';
import IdeaFormSection from './components/IdeaFormSection';
import IdeaSubmissionForm from './components/IdeaSubmissionForm';
import LandingPageContent from './components/LandingPageContent';
import HelpPage from './components/HelpPage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import RegisterPage from './pages/RegisterPage';

import { IdeaAddPage, IdeaEditPage, IdeaPage, IdeasPage } from './pages/Ideas';
import './styles.css';

import ErrorBoundary from './components/ErrorBoundary.jsx';
import NotFound from './pages/NotFound.jsx';

import { devLog } from './utils/devLogger';
import { DevOnly } from './components/DevOnly';

function App() {
  useEffect(() => {
    devLog('App component has mounted.');
    devLog('Current environment mode:', import.meta.env.MODE);
  }, []);

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
        <ErrorBoundary>
          <Header />
          <Routes>
            <Route
              path=''
              element={
                <>
                  <IdeaFormSection count='3' sort='trending' />
                  <IdeaSubmissionForm />
                  <LandingPageContent />
                </>
              }
            />
            <Route path='help' element={<HelpPage />} />
            <Route path='login' element={<LoginPage />} />
            <Route path='forgot-password' element={<ForgotPassword />} />
            <Route path='register' element={<RegisterPage />} />
            <Route path='ideas'>
              <Route index element={<IdeasPage />} />
              <Route path=':ideaId' element={<IdeaPage />} />
              <Route path=':ideaId/edit' element={<IdeaEditPage />} />
              <Route path='add' element={<IdeaAddPage />} />
              <Route path='page/:page' element={<IdeasPage />} />
            </Route>
            <Route path='*' element={<NotFound />} />
          </Routes>
          <Footer />

          <DevOnly>
            <div
              style={{
                position: 'fixed',
                bottom: '10px',
                left: '10px',
                background: 'rgba(0, 128, 255, 0.2)',
                padding: '6px 10px',
                borderRadius: '5px',
                fontSize: '0.75em',
                fontWeight: 'bold',
                color: 'navy',
                zIndex: 1000,
              }}
            >
              DEV
            </div>
          </DevOnly>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
