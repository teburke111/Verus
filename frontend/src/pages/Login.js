import React from 'react';
import LoginBox from '../components/LoginBox';
// Topbar import removed

function Login() {
  return (
    // Topbar is rendered globally in App.js, so we only render the content here
    <div className="Login">
      <LoginBox />
    </div>
  );
}
export default Login;
