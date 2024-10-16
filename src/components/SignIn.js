import './sign.css';
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleOpenTabs = () => {
    // Open two new tabs for the sign-in process
    window.open('/signin', '_blank'); // First tab
    window.open('/signin', '_blank'); // Second tab
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    // Determine the user ID based on the browser
    const userId = navigator.userAgent.includes("Edg") ? 'user1' : 'user2'; // Edge as user1, others as user2

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('userId', userId); // Store the determined user ID
      localStorage.setItem('userEmail', email); // Store email to display in chat
      
      // Navigate to the appropriate chat based on userId
      navigate(userId === 'user1' ? '/chatuser1' : '/chatuser2'); 
    } catch (err) {
      console.error("Sign-in error:", err);
      setError(err.message);
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/signup'); // Redirect to Signup page
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <h2 className="text-center mb-4">Sign In</h2>
        <form onSubmit={handleSignIn}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Sign In</button>
        </form>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <div className="mt-3 text-center">
          <button className="btn btn-link" onClick={handleSignUpRedirect}>Don't have an account? Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
