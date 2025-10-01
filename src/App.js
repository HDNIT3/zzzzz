import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { MovieBooking } from "./pages/Movie-Booking";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/mov-bk" element={<MovieBooking />}/>
        </Routes>
        <Footer />
      </Router>
  )
}

export default App;
