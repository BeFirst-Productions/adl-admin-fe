import { Link } from 'react-router-dom';
import * as yup from 'yup';
import PasswordFormInput from '@/components/form/PasswordFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { Button } from 'react-bootstrap';
import useSignIn from './useSignIn';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
export const loginSchema = yup.object({
  email: yup.string().email('Please enter a valid email').required('please enter your email'),
  password: yup.string().required('Please enter your password')
});

const LoginForm = () => {
  const {
    loading,
    control
  } = useSignIn();
  const {logIn}=useAuth()
  const [error,setError]=useState("")
   const signin = async (e) => {
  e.preventDefault(); // ✅ STOP browser refresh

  const values = {
    email: e.target.email.value,
    password: e.target.password.value,
  };

  const res = await logIn(values);
  setError(res)
};

  return <form onSubmit={signin} className="authentication-form">
      <TextFormInput control={control} name="email" containerClassName="mb-3" label="Email" id="email-id" placeholder="Enter your email" />

      <PasswordFormInput control={control} name="password" containerClassName="mb-3" placeholder="Enter your password" id="password-id" label={<>
            {/* <Link to="/auth/reset-pass" className="float-end text-muted text-unline-dashed ms-1">
              Reset password
            </Link> */}
            <label className="form-label" htmlFor="example-password">
              Password
            </label>
          </>} />

      <div className="mb-3">
        {/* <div className="form-check">
          <input type="checkbox" className="form-check-input" id="checkbox-signin" />
          <label className="form-check-label" htmlFor="checkbox-signin">
            Remember me
          </label>
        </div> */}
       {error&& <span className='text-danger'>{error}</span>}
      </div>
      <div className="mb-1 text-center d-grid">
        <Button variant="primary" type="submit" disabled={loading}>
          Sign In
        </Button>
      </div>
    </form>;
};
export default LoginForm;