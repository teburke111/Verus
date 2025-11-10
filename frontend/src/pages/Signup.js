import React from 'react';
import SignupBox from '../components/SignupBox';
// Topbar is imported and rendered only in App.js now.

function Signup() {
  return (
    // Topbar is rendered globally in App.js, so we only render the content here
    <div className="Signup">
      <SignupBox />
    </div>
  );
}

export default Signup;
