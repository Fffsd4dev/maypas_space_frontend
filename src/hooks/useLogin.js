import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import * as yup from 'yup';
import { useAuthContext } from '@/context/useAuthContext';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { saveSession } = useAuthContext();
  const [searchParams] = useSearchParams();
  const { tenantSlug } = useParams();
  const { visitorSlug } = useParams();

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password')
  });

  const { control, handleSubmit, setError } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo');
    if (redirectLink) {
      navigate(redirectLink);
    } else {
      navigate(`/${tenantSlug}/tenantDashboard`);
    }
  };

  const login = handleSubmit(async (data) => {
    setLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.token && res.ok) {
        // Save session data based on user type
        const sessionData = {
          ...(result ?? {}),
          tenantToken: result.token,
          tenant: tenantSlug,
          tenant_id: result.user.tenant_id,
          user_type_id: result.user.user_type_id,
          tenantFirstName: result?.user?.first_name,
          tenantLastName: result?.user?.last_name,
          tenantEmail: result?.user?.email,
          tenantPhone: result?.user?.phone,
          tenantCompanyName: result?.user?.company_name,
          CName: result?.company_name,
          tenantLinkName: result?.slug
        };

        saveSession(sessionData);

        // Redirect based on user type
        if (result?.user?.user_type_id === "2") {
          navigate(`/${tenantSlug}/tenantDashboard`);
        } else if (result?.user?.user_type_id === "1") {
          navigate(`/${tenantSlug}/tenantDashboard`);
        } else if (result?.user?.user_type_id === "3") { // Assuming 3 is for visitor
          saveSession({ 
            ...sessionData,
            visitorToken: result?.token, 
            visitor: visitorSlug, 
            visitor_id: result?.user?.visitor_id 
          });
          navigate(`/${tenantSlug}/home`);
        } else {
          // Default redirect for other user types
          navigate(`/${tenantSlug}/tenantDashboard`);
        }
      } else {
        // Handle login failure
        console.error('Login Failed:', result);
        
        // Set form errors based on response
        if (result.message) {
          setError('email', {
            type: 'manual',
            message: result.message
          });
          setError('password', {
            type: 'manual',
            message: result.message
          });
        } else {
          setError('email', {
            type: 'manual',
            message: 'Invalid email or password'
          });
          setError('password', {
            type: 'manual',
            message: 'Invalid email or password'
          });
        }
      }
    } catch (e) {
      console.error('Error during Login:', e);
      
      // Handle network or server errors
      setError('email', {
        type: 'manual',
        message: 'Network error. Please try again.'
      });
      setError('password', {
        type: 'manual',
        message: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  });

  return {
    loading,
    login,
    control,
    setError // Added for external error handling if needed
  };
};

export default useLogin;