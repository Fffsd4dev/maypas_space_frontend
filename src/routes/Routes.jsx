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
import RoleDetails from "../pages/MyWorkspaceAccount/WorkspaceRoles/RoleDetails";
import { useParams } from "react-router-dom";

import Error404Alt from "../pages/error/Error404Alt";
import InvoiceDetails from "../pages/Settings/invoices/InvoiceDetails";

const AllRoutes = props => {
  const { isAuthenticated } = useAuthContext();
  const { orientation } = useLayoutContext();
  const {user} = useAuthContext();

  const  tenantSlug  = user?.tenant;

  const getLayout = (path) => {
    if (!path) return VerticalLayout;
    if (tenantSlug) {
      // Ensure tenant routes do not use VerticalLayout2
      return VerticalLayout;
    }
    if (path.includes("/dashboard-3") || path.includes("/account") || path.includes("/CreateSubscription") || path.includes("/TenantSub")) {
      // Ensure owner's routes use VerticalLayout2
      return VerticalLayout2;
    }
    if (path.includes("/dashboard-1") || path.includes("/workspaceAccount") || path.includes("/dashboard-4")|| path.includes("/facility") || path.includes("/location") ||  path.includes("/room")) {
      return VerticalLayout;
    }
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

  return (
    <React.Fragment>
      <Routes>
        <Route path="/subscription-details/:id" element={<SubscriptionDetails />} />
        <Route path="/plan-details/:id" element={<PlanDetails />} />
        <Route path="/role-details/:id" element={<RoleDetails />} />
        <Route path="/invoice-details/:id" element={<InvoiceDetails />} />

        {publicProtectedFlattenRoutes.map((route, idx) => (
          <Route path={route.path} element={<DefaultLayout {...props} tenantSlug={tenantSlug}>{route.element}</DefaultLayout>} key={idx} />
        ))}
        {authProtectedFlattenRoutes.map((route, idx) => {
          const Layout = getLayout(route.path);
          return (
            <Route path={route.path} element={!isAuthenticated ? <Navigate to={{ pathname: "/landing", search: "next=" + route.path }} /> : <Layout {...props} tenantSlug={tenantSlug}>{route.element}</Layout>} key={idx} />
          );
        })}

        {/* Catch all undefined routes and show the 404 error page */}
        <Route path="*" element={<Error404Alt />} />
      </Routes>
    </React.Fragment>
  );
};

export default AllRoutes;