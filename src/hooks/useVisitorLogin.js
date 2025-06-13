import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import * as yup from 'yup';
import { useAuthContext } from '@/context/useAuthContext';
import httpClient from '@/helpers/httpClient';

const useVisitorLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { saveSession } = useAuthContext();
  const [searchParams] = useSearchParams();
  const { user } = useAuthContext();
  const { visitorSlug } = useParams();
  console.log(visitorSlug);
  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password')
  });
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: 'user@demo11.com',
      password: '123456'
    }
  });
  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo');
    if (redirectLink) navigate(redirectLink); else navigate(`/${visitorSlug}/home`);
  };

  const [popup, setPopup] = useState({ message: "", type: "", isVisible: false, buttonLabel: "", buttonRoute: "" });

  const login = handleSubmit(async (data) => {
    setLoading(true);
    console.log('submitting');
    console.log({ visitorSlug });
    console.log(data);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${visitorSlug}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      console.log(res);

      const result = await res.json();

      console.log(result);
      if (result.token && res.ok) {
        console.log(res.ok);
        console.log(result.user.visitor_id);
        saveSession({ ...(result ?? {}), visitorToken: result.token, visitor: visitorSlug, visitor_id: result.user.visitor_id, user_type_id: result.user.user_type_id, visitorFirstName: result?.user?.first_name, visitorLastName: result?.user?.last_name, visitorEmail: result?.user?.email, visitorPhone: result?.user?.phone });
        console.log(result)
        setPopup({
          message: "Login successful!",
          type: "success",
          isVisible: true,
          buttonLabel: "Proceed ",
          buttonRoute: `/${visitorSlug}/home`,
        });

        // redirectUser();
      } else {
        console.error('Login Failed:', res);
        const errorMessages = result.message;
        setPopup({
          message: `Login Failed: ${errorMessages}`,
          type: "error",
          isVisible: true,
          buttonLabel: "Retry",
          buttonRoute: `/${visitorSlug}/auth/visitorLogin`,
        });
      }
    } catch (e) {
      console.error('Error during Login:', e);
      setPopup({
        message: "An error occurred. Please try again.",
        type: "error",
        isVisible: true,
        buttonLabel: "Retry",
        buttonRoute: `/${visitorSlug}/auth/visitorLogin`,
      });

      if (e.response?.data?.error) {
        control.setError('email', {
          type: "custom",
          message: e.response?.data?.error
        });
        control.setError('password', {
          type: "custom",
          message: e.response?.data?.error
        });
      }
    } finally {
      setLoading(false);
    }
  });
  return {
    loading,
    login,
    control,
    popup,
    setPopup
  };
};
export default useVisitorLogin;