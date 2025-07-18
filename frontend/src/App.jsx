import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import HelpPage from './components/HelpPage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import RegisterPage from './pages/RegisterPage';

import { IdeaAddPage, IdeaEditPage, IdeaPage, IdeasPage } from './pages/Ideas';
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
          <Route path='' element={<LandingPage />} />
          <Route path='help' element={<HelpPage />} />
          <Route path='login' element={<LoginPage />} />
          <Route path='forgot-password' element={<ForgotPassword />} />
          <Route path='register' element={<RegisterPage />} />
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
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default App;
