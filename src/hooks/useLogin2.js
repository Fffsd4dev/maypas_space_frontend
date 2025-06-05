import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as yup from 'yup';
import { useAuthContext } from '@/context/useAuthContext';
import httpClient from '@/helpers/httpClient';
import { useParams } from "react-router-dom";


import Popup from '../components/Popup/Popup';

const useLogin2 = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    saveSession
  } = useAuthContext();
  const [searchParams] = useSearchParams();
  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password')
  });
  const {
    control,
    handleSubmit
  } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
        email: 'user@demo22.com',
        password: '223456'
      }
  });
  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo');
    if (redirectLink) navigate(redirectLink);else navigate('/dashboard');
  };

  const [popup, setPopup] = useState({ message: "", type: "", isVisible: false, buttonLabel: "", buttonRoute: "" });
  const { tenantSlug } = useParams();

  const login = handleSubmit( async (data) => {
    setLoading(true);
    console.log(data);
    console.log('submitting');
  
    try {
      // WILL EDIT HERE
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/system-admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      console.log(data);
      console.log(res);

      const result = await res.json();
      
      console.log(result);
      if (result.token && res.ok ) {
        console.log(res.ok);

        saveSession({ ...(result ?? {}), token: result.token, ownerFirstName: result?.admin?.first_name, ownerLastName:result?.admin?.last_name ,  ownerUserTypeId: result?.admin?.user_type_id, });

        // saveSession({
        //   ...(res.data ?? {}),
        //   token: res.data.token
        // });

        setPopup({
          message: "Login successful!",
          type: "success",
          isVisible: true,
          buttonLabel: "Proceed to the Owners Dashboard",
          buttonRoute: "/dashboard",
      });

        redirectUser();
      } else {
        console.error('Login Failed:', res);
        const errorMessages = result.message
                    setPopup({
                        message: `Login Failed: ${errorMessages}`,
                        type: "error",
                        isVisible: true,
                        buttonLabel: "Retry",
                        buttonRoute: `/auth/login2`,
                    });
      }
    } catch (e) {
      console.error('Error during Login:', e);
                setPopup({
                    message: "An error occurred. Please try again.",
                    type: "error",
                    isVisible: true,
                    buttonLabel: "Retry",
                    buttonRoute: `/auth/login2`,
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
export default useLogin2;
