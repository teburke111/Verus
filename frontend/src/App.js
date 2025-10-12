import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Login from './pages/Login';
import Images from './pages/Images';
import Text from './pages/Text';
import Audio from './pages/Audio';
import Video from './pages/Video';

function App() {
  return (
    <div className="App">
      {/* <Login /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Images" element={<Images />} />
        <Route path="/Text" element={<Text />} />
        <Route path="/Audio" element={<Audio />} />
        <Route path="/Video" element={<Video />} />
      </Routes>
    </div>
    
  );
}

export default App;
