import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";

// components
import TopbarSearch from "@/components/TopbarSearch";
import MaximizeScreen from "@/components/MaximizeScreen";
import AppsDropdown from "@/components/AppsDropdown/";
import LanguageDropdown from "@/components/LanguageDropdown";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProfileDropdown from "@/components/ProfileDropdown";
import CreateNew from "@/components/CreateNew";
import MegaMenu from "@/components/MegaMenu";
import profilePic from "@/assets/images/users/user-1.jpg";
import avatar4 from "@/assets/images/users/user-4.jpg";
import logoSm from "@/assets/images/logo-sm.png";
import logoDark from "@/assets/images/logo-dark.png";
import logoDark2 from "@/assets/images/logo-dark-2.png";
import logoLight from "@/assets/images/logo-light.png";
import logoLight2 from "@/assets/images/logo-light-2.png";
import { useViewport } from "@/hooks/useViewPort";
import { useLayoutContext } from "@/context/useLayoutContext.jsx";
import { toggleDocumentAttribute } from "@/utils";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useLogoColor } from "@/context/LogoColorContext";
import { toast } from "react-toastify";

const Topbar = ({ hideLogo, navCssClasses }) => {
  const { width } = useViewport();
  const { menu, orientation, changeMenuSize, themeCustomizer } = useLayoutContext();
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;
  const tenantFirstName = user?.tenantFirstName;
  const tenantToken = user?.tenantToken;
  const navbarCssClasses = navCssClasses || "";
  const containerCssClasses = !hideLogo ? "container-fluid" : "";
  const { colour: primary } = useLogoColor();

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch notifications
  const fetchNotification = useCallback(async () => {
    if (isFetching.current || !tenantToken || !tenantSlug) return;
    
    isFetching.current = true;
    setLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/notification/view-my-notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (isMounted.current) {
        // Handle different response formats
        let notificationData = [];
        if (Array.isArray(result)) {
          notificationData = result;
        } else if (result.data && Array.isArray(result.data)) {
          notificationData = result.data;
        } else {
          notificationData = [];
        }

        // Sort by date (most recent first)
        const sortedData = [...notificationData].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        
        setNotifications(sortedData);
        
        // Count unread notifications
        const unread = sortedData.filter(notif => notif.is_read === false || notif.is_read === 0).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("Error fetching notifications:", error);
        // Don't show toast for notification errors to avoid spamming
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [tenantToken, tenantSlug]);

  // Fetch notifications on mount and periodically
  // useEffect(() => {
  //   if (tenantToken && tenantSlug) {
  //     fetchNotification();
      
  //     // Set up polling for new notifications (every 60 seconds)
  //     const intervalId = setInterval(() => {
  //       fetchNotification();
  //     }, 60000); // 60 seconds
      
  //     return () => clearInterval(intervalId);
  //   }
  // }, [tenantToken, tenantSlug, fetchNotification]);

  // Format notifications for dropdown
  const formattedNotifications = useCallback(() => {
    return notifications.slice(0, 5).map((item, i) => ({
      id: item.id || i,
      text: item.name || "Notification",
      subText: item.description || "",
      icon: item.is_read ? "mdi mdi-bell-outline" : "mdi mdi-bell-ring-outline",
      bgColor: item.is_read ? "secondary" : "primary",
      time: item.updated_at || item.created_at,
      redirectTo: "#",
      is_read: item.is_read || false,
    }));
  }, [notifications]);

  // Profile menu items
  const ProfileMenus = [
    {
      label: "Settings",
      icon: "fe-settings",
      onClick: () => {
        themeCustomizer.toggle();
      },
    },
    {
      label: "Logout",
      icon: "fe-log-out",
      redirectTo: `/${tenantSlug}/auth/logout`,
    },
  ];

  /**
   * Toggle the leftmenu when having mobile screen
   */
  const handleLeftMenuCallBack = useCallback(() => {
    if (width < 1140) {
      if (menu.size === "full") {
        showLeftSideBarBackdrop();
        toggleDocumentAttribute("class", "sidebar-enable");
      } else {
        changeMenuSize("full");
      }
    } else if (menu.size === "condensed") {
      changeMenuSize("default");
    } else if (menu.size === "full") {
      showLeftSideBarBackdrop();
      toggleDocumentAttribute("class", "sidebar-enable");
    } else if (menu.size === "fullscreen") {
      changeMenuSize("default");
      toggleDocumentAttribute("class", "sidebar-enable");
    } else {
      changeMenuSize("condensed");
    }
  }, [width, menu.size, changeMenuSize]);

  // Create backdrop for leftsidebar
  const showLeftSideBarBackdrop = useCallback(() => {
    // Remove existing backdrop if any
    hideLeftSideBarBackdrop();
    
    const backdrop = document.createElement("div");
    backdrop.id = "custom-backdrop";
    backdrop.className = "offcanvas-backdrop fade show";
    document.body.appendChild(backdrop);
    
    if (document.getElementsByTagName("html")[0]?.getAttribute("dir") !== "rtl") {
      document.body.style.overflow = "hidden";
      if (width > 1140) {
        document.body.style.paddingRight = "15px";
      }
    }
    
    backdrop.addEventListener("click", function () {
      toggleDocumentAttribute("class", "sidebar-enable", true);
      changeMenuSize("full");
      hideLeftSideBarBackdrop();
    });
  }, [width, changeMenuSize]);

  const hideLeftSideBarBackdrop = useCallback(() => {
    const backdrop = document.getElementById("custom-backdrop");
    if (backdrop && backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
      document.body.style.overflow = "visible";
      document.body.style.paddingRight = "";
    }
  }, []);

  // Clean up backdrop on unmount
  useEffect(() => {
    return () => {
      hideLeftSideBarBackdrop();
    };
  }, [hideLeftSideBarBackdrop]);

  return (
    <React.Fragment>
      <div className={`navbar-custom ${navbarCssClasses}`} style={{ backgroundColor: primary }}>
        <div className={`topbar ${containerCssClasses}`}>
          <div className="topbar-menu d-flex align-items-center gap-1">
            <button
              className="button-toggle-menu"
              onClick={handleLeftMenuCallBack}
              aria-label="Toggle menu"
            >
              <i className="mdi mdi-menu" style={{ color: '#ffffff' }} />
            </button>
          </div>

          <ul className="topbar-menu d-flex align-items-center">
            {/* Search - commented out as it's not used
            <li className="dropdown d-none d-xl-inline-block">
              <TopbarSearch searchResults={SearchResults} />
            </li>
            */}

            {/* Maximize Screen */}
            <li className="dropdown d-none d-lg-inline-block">
              <MaximizeScreen />
            </li>

            {/* Notifications */}
            <li className="dropdown notification-list">
              <NotificationDropdown
                notifications={formattedNotifications()}
                totalCount={notifications.length}
                unreadCount={unreadCount}
                fetchNotification={fetchNotification}
                loading={loading}
              />
            </li>

            {/* Profile Dropdown */}
            <li className="dropdown">
              <ProfileDropdown
                profilePic={profilePic}
                menuItems={ProfileMenus}
                username={tenantFirstName || "User"}
              />
            </li>
          </ul>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Topbar;