import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Contact from "./components/contact";

function HomePage() {
  return (
    <Router>
      <div>
        <h1>Welcome to the site</h1>
        <Routes>
          <Route path="*" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}

export default HomePage;
