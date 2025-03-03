import { Navigate, Route, Routes } from "react-router-dom";
import SubscriptionDetails from "../pages/subscriptions/SubscriptionDetails";

// All layouts containers
import DefaultLayout from "@/layouts/Default";
import VerticalLayout from "@/layouts/Vertical";
import VerticalLayout2 from "@/layouts/Vertical2";
import DetachedLayout from "@/layouts/Detached";
import HorizontalLayout from "@/layouts/Horizontal/";
import TwoColumnLayout from "@/layouts/TwoColumn/";
import { authProtectedFlattenRoutes, publicProtectedFlattenRoutes } from "./index";
import { useLayoutContext } from "@/context/useLayoutContext.jsx";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import React from "react";
import PlanDetails from "../pages/subscriptions/PlanDetails";

const AllRoutes = props => {
  const { isAuthenticated } = useAuthContext();
  const { orientation } = useLayoutContext();
  const getLayout = () => {
    let layoutCls = TwoColumnLayout;
    switch (orientation) {
      case 'horizontal':
        layoutCls = HorizontalLayout;
        break;
      case 'detached':
        layoutCls = DetachedLayout;
        break;
      case 'vertical':
        layoutCls = VerticalLayout;
        break;
      case 'vertical2':
        layoutCls = VerticalLayout2;
        break;
      default:
        layoutCls = TwoColumnLayout;
        break;
    }
    return layoutCls;
  };
  const Layout = getLayout();
  return (
    <React.Fragment>
      <Routes>
        <Route path="/subscription-details/:id" element={<SubscriptionDetails />} />
        <Route path="/plan-details/:id" element={<PlanDetails />} />

        {publicProtectedFlattenRoutes.map((route, idx) => (
          <Route path={route.path} element={<DefaultLayout {...props}>{route.element}</DefaultLayout>} key={idx} />
        ))}
        {authProtectedFlattenRoutes.map((route, idx) => (
          <Route path={route.path} element={!isAuthenticated ? <Navigate to={{ pathname: "/landing", search: "next=" + route.path }} /> : <Layout {...props}>{route.element}</Layout>} key={idx} />
        ))}
      </Routes>
    </React.Fragment>
  );
};

export default AllRoutes;