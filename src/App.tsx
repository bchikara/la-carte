import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import BusinessSite from './pages/BusinessSite/BusinessSite';
import Snackbar from './components/Snackbar/Snackbar';
import Contact from './pages/Contact/Contact';
import Term from './pages/Term/Term';
import Refund from './pages/Refund/Refund';
import Privacy from './pages/Privacy/Privacy';
import Order from './pages/Order/Order';
import Scanner from './pages/Scanner/Scanner';
import Menu from './pages/Menu/Menu';

function App() {
  return (
    <>
      <BrowserRouter>
        <Header></Header>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<BusinessSite />} />
            <Route path="/contact" element={<Contact />} />
            <Route path='/terms-and-condition' element={<Term />}></Route>
            <Route path='/refund' element={<Refund />}></Route>
            <Route path='/privacy' element={<Privacy />}></Route>
            <Route path='/explore' element={<Order />}></Route>
            <Route path='/scanner' element={<Scanner />}></Route>
            <Route path='/menu/:id' element={<Menu />}></Route>
          </Routes>
        <Footer></Footer>
        <Snackbar></Snackbar>
      </BrowserRouter>
    </>
  );
}

export default App;
