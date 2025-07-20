import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import HelpPage from './components/HelpPage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import UserPage from './pages/UserPage';
import UserEditPage from './pages/UserEditPage';
import MePage from './pages/MePage';
import MeEditPage from './pages/MeEditPage';
import MyIdeasPage from './pages/MyIdeasPage';
import LogoutPage from './pages/LogoutPage';
import SearchPage from './pages/SearchPage';
import UserIdeasPage from './pages/UserIdeasPage';

import { IdeaAddPage, IdeaEditPage, IdeaPage, IdeasPage } from './pages/Ideas';
import './styles.css';

import ErrorBoundary from './components/ErrorBoundary.jsx';
import NotFound from './pages/NotFound.jsx';

import { devLog } from './utils/devLogger.jsx';
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
            <Route path='' element={<LandingPage />} />
            <Route path='help' element={<HelpPage />} />
            <Route path='search' element={<SearchPage />} />
            <Route path='login' element={<LoginPage />} />
            <Route path='forgot-password' element={<ForgotPassword />} />
            <Route path='register' element={<RegisterPage />} />
            <Route path='users'>
              <Route index element={<UsersPage />} />
              <Route path=':id' element={<UserPage />} />
              <Route path=':id/edit' element={<UserEditPage />} />
              <Route path=':id/ideas' element={<UserIdeasPage />} />
            </Route>
            <Route path='me'>
              <Route index element={<MePage />} />
              <Route path='edit' element={<MeEditPage />} />
              <Route path='ideas' element={<MyIdeasPage />} />
            </Route>
            <Route path='logout' element={<LogoutPage />} />
            <Route path='ideas'>
              <Route index element={<IdeasPage headerText='All Ideas' />} />
              <Route path=':ideaId' element={<IdeaPage />} />
              <Route path=':ideaId/edit' element={<IdeaEditPage />} />
              <Route path='add' element={<IdeaAddPage />} />
              <Route
                path='page/:page'
                element={<IdeasPage headerText='All Ideas' />}
              />
            </Route>
            <Route path='*' element={<NotFound />} />
          </Routes>
          <Footer />

          <DevOnly>
            <div className='dev-indicator'>DEV</div>
          </DevOnly>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
