import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import RegisterForm from './RegisterForm/RegisterForm.jsx';
import './styles.css';

function Register() {
  return (
    <div className='body-style'>
       <div className='container-wrapper'>
        <Header />
        <RegisterForm />
        <Footer />
       </div>
    </div>
  );
}

export default Register;