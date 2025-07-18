import { RegisterForm } from '../components/RegisterForm';

function RegisterPage() {
  return (
    <div className='container-wrapper'>
      <section className='section-card flex flex-col justify-center items-center'>
        <h3 className='section-heading'>Register as a new user:</h3>
        <div className='card bg-base-100 w-lg p-4 auto'>
          <RegisterForm />
        </div>
      </section>
    </div>
  );
}

export default RegisterPage;
