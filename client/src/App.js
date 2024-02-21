import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import DieuHuongURL from './Router';
import { CartProvider } from './components/Cart/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Router>
        <CartProvider>
          <Header />
          <DieuHuongURL />
          <Footer />
        </CartProvider>
        <ToastContainer />
      </Router>
    </>
  );
}

export default App;
