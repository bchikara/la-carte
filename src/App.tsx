import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import BusinessSite from './pages/BusinessSite/BusinessSite';
import Snackbar from './components/Snackbar/Snackbar';

function App() {
  return (
    <>
      <BrowserRouter>
        <Header></Header>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/business" element={<BusinessSite />} />
          </Routes>
        <Footer></Footer>
        <Snackbar></Snackbar>
      </BrowserRouter>
    </>
  );
}

export default App;
