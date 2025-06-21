import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Blog } from "./components/Blog.tsx";
import "./App.css";
import "98.css"
import { Main } from "./components/Home.tsx";
import { Post } from "./components/Post.tsx";
import { Writeups } from "./components/Writeups.tsx";
import { WriteupPost } from "./components/WriteupPost.tsx";
import { About } from "./components/About.tsx";

function App() {
  return (
    <HelmetProvider>
      <div className="max-w-7xl mx-auto pt-20 md:p-20">
        <Router>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/*" element={<Post />} />
            <Route path="/writeups" element={<Writeups />} />
            <Route path="/writeups/*" element={<WriteupPost/>} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Router>
      </div>
    </HelmetProvider>
  );
}

export default App;