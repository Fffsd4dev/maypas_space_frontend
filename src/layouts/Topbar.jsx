import React, { useState, useEffect } from "react";
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






// dummy search results
const SearchResults = [{
  id: 1,
  title: "Analytics Report",
  icon: "uil-notes",
  redirectTo: "#"
}, {
  id: 2,
  title: "How can I help you?",
  icon: "uil-life-ring",
  redirectTo: "#"
}, {
  id: 3,
  icon: "uil-cog",
  title: "User profile settings",
  redirectTo: "#"
}];
const otherOptions = [{
  id: 1,
  label: "New Projects",
  icon: "fe-briefcase"
}, {
  id: 2,
  label: "Create Users",
  icon: "fe-user"
}, {
  id: 3,
  label: "Revenue Report",
  icon: "fe-bar-chart-line-"
}, {
  id: 4,
  label: "Settings",
  icon: "fe-settings"
}, {
  id: 4,
  label: "Help & Support",
  icon: "fe-headphones"
}];

// get mega-menu options
const MegaMenuOptions = [{
  id: 1,
  title: "UI Components",
  menuItems: ["Widgets", "Nestable List", "Range Sliders", "Masonry Items", "Sweet Alerts", "Treeview Page", "Tour Page"]
}, {
  id: 2,
  title: "Applications",
  menuItems: ["eCommerce Pages", "CRM Pages", "Email", "Calendar", "Team Contacts", "Task Board", "Email Templates"]
}, {
  id: 3,
  title: "Extra Pages",
  menuItems: ["Left Sidebar with User", "Menu Collapsed", "Small Left Sidebar", "New Header Style", "Search Result", "Gallery Pages", "Maintenance & Coming Soon"]
}];
const Topbar = ({
  hideLogo,
  navCssClasses
}) => {
  const {
    width
  } = useViewport();
  const {
    menu,
    orientation,
    changeMenuSize,
    themeCustomizer
  } = useLayoutContext();



  const {user} = useAuthContext();
  const  tenantSlug  = user?.tenant;
  const tenantFirstName = user?.tenantFirstName;
  const navbarCssClasses = navCssClasses || "";
  const containerCssClasses = !hideLogo ? "container-fluid" : "";

  // get the notifications
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
   const [pagination, setPagination] = useState({
      currentPage: 1,
      totalPages: 1,
      nextPageUrl: null,
      prevPageUrl: null,
      pageSize: 10,
    });

  // Fetch notifications
  const fetchNotification = async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/notification/view-my-notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Notification Result:", result);
      if (result && Array.isArray(result)) {
        const fetchedData = result;
        fetchedData.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(fetchedData);
        setPagination({
          currentPage: result.data.current_page,
          totalPages: result.data.last_page,
          nextPageUrl: result.data.next_page_url,
          prevPageUrl: result.data.prev_page_url,
          pageSize: pageSize,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotification();
  }, [user?.tenantToken ]);

  // Notifications array
  const Notifications = data.map((item, i) => ({
    id: i,
    text: item.name,
    subText: item.description,
    icon: "mdi mdi-comment-account-outline",
    bgColor: "info",
    time: item.updated_at,
    redirectTo: "#",
    is_read: item.is_read,
  }));
  

  const ProfileMenus = [
  //   {
  //   label: "My Account",
  //   icon: "fe-user",
  //   redirectTo: "#"
  // }, 
  {
    label: "Settings",
    icon: "fe-settings",
    onClick: () => {
      console.log("Settings clicked");
      themeCustomizer.toggle();
    },
  }, {
    label: "Logout",
    icon: "fe-log-out",
    redirectTo: `/${tenantSlug}/auth/logout`
  }];

  /**
   * Toggle the leftmenu when having mobile screen
   */
  const handleLeftMenuCallBack = () => {
    if (width < 1140) {
      if (menu.size === 'full') {
        showLeftSideBarBackdrop();
        toggleDocumentAttribute("class", "sidebar-enable");
      } else {
        changeMenuSize('full');
      }
    } else if (menu.size === "condensed") {
      changeMenuSize('default');
    } else if (menu.size === 'full') {
      showLeftSideBarBackdrop();
      toggleDocumentAttribute("class", "sidebar-enable");
    } else if (menu.size === 'fullscreen') {
      changeMenuSize('default');
      toggleDocumentAttribute("class", "sidebar-enable");
    } else {
      changeMenuSize('condensed');
    }
  };

  // create backdrop for leftsidebar
  function showLeftSideBarBackdrop() {
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
      changeMenuSize('full');
      hideLeftSideBarBackdrop();
    });
  }
  function hideLeftSideBarBackdrop() {
    const backdrop = document.getElementById("custom-backdrop");
    if (backdrop) {
      document.body.removeChild(backdrop);
      document.body.style.overflow = "visible";
    }
  }
  return <React.Fragment>
            <div className={`navbar-custom ${navbarCssClasses}`}>
                <div className={`topbar ${containerCssClasses}`}>
                    <div className="topbar-menu d-flex align-items-center gap-1">
                        {!hideLogo && <div className="logo-box">
                                <Link to="/" className="logo logo-dark text-center">
                  <span className="logo-sm">
                    <img src={logoSm} alt="" height="22" />
                  </span>
                                    <span className="logo-lg">
                    <img src={orientation === 'two-column' ? logoDark2 : logoDark} alt="" height="20" />
                  </span>
                                </Link>
                                <Link to="/" className="logo logo-light text-center">
                  <span className="logo-sm">
                    <img src={logoSm} alt="" height="22" />
                  </span>
                                    <span className="logo-lg">
                    <img src={orientation === 'two-column' ? logoLight2 : logoLight} alt="" height="20" />
                  </span>
                                </Link>
                            </div>}

                        <button className="button-toggle-menu" onClick={handleLeftMenuCallBack}>
                            <i className="mdi mdi-menu" />
                        </button>

                        {/* <div className="dropdown d-none d-xl-block">
                            <CreateNew otherOptions={otherOptions} />
                        </div>

                        <div className="dropdown dropdown-mega d-none d-xl-block">
                            <MegaMenu subMenus={MegaMenuOptions} />
                        </div> */}
                    </div>

                    <ul className="topbar-menu d-flex align-items-center">
                        {/* <li className="app-search dropdown d-none d-lg-block">
                            <TopbarSearch items={SearchResults} />
                        </li> */}
                        {/* <li className="dropdown d-inline-block d-lg-none">
                         <SearchDropdown />
                         </li> */}
                        <li className="dropdown d-none d-lg-inline-block">
                            <MaximizeScreen />
                        </li>
                        <li className="dropdown d-none d-lg-inline-block topbar-dropdown">
                            <AppsDropdown />
                        </li>
                        {/* <li className="dropdown d-none d-lg-inline-block topbar-dropdown">
                            <LanguageDropdown />
                        </li> */}
                        <li className="dropdown notification-list">
                            <NotificationDropdown notifications={Notifications} fetchNotification={fetchNotification} />
                        </li>
                        <li className="dropdown">
                            <ProfileDropdown profilePic={profilePic} menuItems={ProfileMenus} username={tenantFirstName}  />
                        </li>
                        <li>
                            {/* <button className="nav-link dropdown-toggle right-bar-toggle waves-effect waves-light btn btn-link shadow-none" onClick={themeCustomizer.toggle}>
                                <i className="fe-settings noti-icon font-22"></i>
                            </button> */}
                        </li>
                    </ul>
                </div>
            </div>
        </React.Fragment>;
};
export default Topbar;