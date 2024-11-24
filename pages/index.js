import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function HomePage() {
  return (
    <Router>
      <div>
        <h1>Welcome to the site</h1>
        <Routes>
          <Route path="/component-a" element={<ComponentA />} />
          <Route path="/component-b" element={<ComponentB />} />
        </Routes>
      </div>
    </Router>
  );
}

export default HomePage;
