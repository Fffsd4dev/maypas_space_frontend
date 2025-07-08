import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import * as yup from 'yup';
import { useAuthContext } from '@/context/useAuthContext';
import httpClient from '@/helpers/httpClient';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { saveSession } = useAuthContext();
  const [searchParams] = useSearchParams();
  const { user } = useAuthContext();
  const { tenantSlug } = useParams();
   const { visitorSlug } = useParams();
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
    if (redirectLink) navigate(redirectLink); else navigate(`/${tenantSlug}/tenantDashboard`);
  };

  const [popup, setPopup] = useState({ message: "", type: "", isVisible: false, buttonLabel: "", buttonRoute: "" });

  const login = handleSubmit(async (data) => {
    setLoading(true);
    console.log('submitting');
    console.log({ tenantSlug });
    console.log(data);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/login`, {
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
        console.log(result.user.tenant_id);
        saveSession({ ...(result ?? {}), tenantToken: result.token, tenant: tenantSlug, tenant_id: result.user.tenant_id, user_type_id: result.user.user_type_id, tenantFirstName: result?.user?.first_name, tenantLastName: result?.user?.last_name, tenantEmail: result?.user?.email, tenantPhone: result?.user?.phone, tenantCompanyName: result?.user?.company_name });
        console.log(result)
        console.log(result.user)
       if (result?.user?.user_type?.user_type === "Admin") {
          saveSession({
            ...(result ?? {}),
            tenantToken: result?.token,
            tenant: tenantSlug,
            tenant_id: result?.user?.tenant_id,
            user_type_id: result?.user?.user_type_id,
            tenantFirstName: result?.user?.first_name,
            tenantLastName: result?.user?.last_name,
            tenantEmail: result?.user?.email,
            tenantPhone: result?.user?.phone,
            tenantCompanyName: result?.user?.company_name,
            CName: result?.company_name,
            tenantLinkName: result?.slug
          });
          setPopup({
            message: "Login successful!",
            type: "success",
            isVisible: true,
            buttonLabel: "Proceed to the Admin Dashboard",
            buttonRoute: `/${tenantSlug}/tenantDashboard`
          });

        } else if (result?.user?.user_type?.user_type === "Owner") {
           saveSession({
            ...(result ?? {}),
            tenantToken: result?.token,
            tenant: tenantSlug,
            tenant_id: result?.user?.tenant_id,
            user_type_id: result?.user?.user_type_id,
            tenantFirstName: result?.user?.first_name,
            tenantLastName: result?.user?.last_name,
            tenantEmail: result?.user?.email,
            tenantPhone: result?.user?.phone,
            tenantCompanyName: result?.user?.company_name,
            CName: result?.company_name,
            tenantLinkName: result?.slug
          });
          setPopup({
            message: "Login successful as workspace owner!",
            type: "success",
            isVisible: true,
            buttonLabel: "Proceed to Your Dashboard",
            buttonRoute: `/${tenantSlug}/tenantDashboard`
          });

        } else if (result?.user?.user_type?.user_type == "Client") {
                    saveSession({ ...(result ?? {}), visitorToken: result?.token, visitor: visitorSlug, visitor_id: result?.user?.visitor_id, user_type_id: result?.user?.user_type_id, visitorFirstName: result?.user?.first_name, visitorLastName: result?.user?.last_name, visitorEmail: result?.user?.email, visitorPhone: result?.user?.phone });

        console.log("My user type:", result?.user?.user_type?.user_type );
          setPopup({
            message: "Login successful!",
            type: "success",
            isVisible: true,
            buttonLabel: "Continue",
            buttonRoute: `/${tenantSlug}/home`
          });
        } else {  
           setPopup({
          message: "Login successful!",
          type: "success",
          isVisible: true,
          buttonLabel: "Proceed to the Admin Dashboard",
          buttonRoute: `/${tenantSlug}/tenantDashboard`,
        });

        saveSession({ ...(result ?? {}), tenantToken: result.token, tenant: tenantSlug, tenant_id: result.user.tenant_id, user_type_id: result.user.user_type_id, tenantFirstName: result?.user?.first_name, tenantLastName: result?.user?.last_name, tenantEmail: result?.user?.email, tenantPhone: result?.user?.phone, tenantCompanyName: result?.user?.company_name, CName: result.company_name,
            tenantLinkName: result.slug });
      }
      } else {
        console.error('Login Failed:', res);
        const errorMessages = result.message;
        setPopup({
          message: `Login Failed: ${errorMessages}`,
          type: "error",
          isVisible: true,
          buttonLabel: "Retry",
          buttonRoute: `/${tenantSlug}/auth/login`,
        });
      }
    } catch (e) {
      console.error('Error during Login:', e);
      setPopup({
        message: "An error occurred. Please try again.",
        type: "error",
        isVisible: true,
        buttonLabel: "Retry",
        buttonRoute: `/${tenantSlug}/auth/login`,
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
export default useLogin;