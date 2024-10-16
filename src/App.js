import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ChatUser1 from './components/ChatUser1'; // Corrected import
import ChatUser2 from './components/ChatUser2'; // Corrected import
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

const App = () => {
  return (
    <Router>
      <Routes>
  <Route path="/signup" element={<SignUp />} />
  <Route path="/signin" element={<SignIn />} />
  <Route path="/chatuser1" element={<ChatUser1 />} />
  <Route path="/chatuser2" element={<ChatUser2 />} />
  <Route path="/" element={<SignIn />} />
</Routes>

    </Router>
  );
};

export default App;

