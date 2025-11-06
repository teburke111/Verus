import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Images from './pages/Images';
import Text from './pages/Text';
import Audio from './pages/Audio';
import Video from './pages/Video';
import MyUploads from "./pages/MyUploads";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Images" element={<Images />} />
        <Route path="/Text" element={<Text />} />
        <Route path="/Audio" element={<Audio />} />
        <Route path="/Video" element={<Video />} />
        <Route path="/my-uploads" element={<MyUploads />} />
      </Routes>
    </div>
  );
}

export default App;
