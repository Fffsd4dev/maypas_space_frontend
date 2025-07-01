import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import classNames from "classnames";
import { useLogoColor } from "../context/LogoColorContext";

//interface

// notifiaction continer styles
const notificationContainerStyle = {
  maxHeight: "300px",
  display: "none"
};
const notificationShowContainerStyle = {
  maxHeight: "300px"
};
const NotificationDropdown = ({ notifications, fetchNotification }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationContentStyle, setNotificationContentStyles] = useState(
    notificationContainerStyle
  );

    const { colour: primary, secondaryColor: secondary } = useLogoColor();
  
    // Inject dynamic nav-link style for primary color
    useEffect(() => {
      const styleId = "dynamic-nav-link";
      let styleTag = document.getElementById(styleId);
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = `
        .nav-link {
          transition: color 0.2s;
        }
        .nav-link.show {
          color: ${primary} !important;
        }
        .nav-link:hover,
        .nav-link:focus {
          color: ${primary} !important;
        }
      `;
      return () => {
        if (styleTag) styleTag.remove();
      };
    }, [primary]);
  

  /*
   * toggle notification-dropdown
   */
  const toggleDropdown = (isOpen) => {
    setDropdownOpen(isOpen);
    fetchNotification();
    setNotificationContentStyles(
      isOpen ? notificationShowContainerStyle : notificationContainerStyle
    );
    // Fetch notifications when the dropdown is closed
    if (!isOpen) {
      fetchNotification();
    }
    };
  const handleClearNotification = index => {
    notifications.splice(index, 1);
  };
  return <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
      <Dropdown.Toggle id="dropdown-notification" role="button" as="a" onClick={toggleDropdown} className={classNames("nav-link waves-effect light arrow-none notification-list", {
      show: dropdownOpen
    })}>
        <i className="fe-bell noti-icon font-22"></i>
        <span className="badge bg-danger rounded-circle noti-icon-badge">
            {notifications?.length || 0}

        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu dropdown-menu-end dropdown-menu-animated dropdown-lg py-0">
        <div onClick={toggleDropdown}>
          <div className="p-2 border-top-0 border-start-0 border-end-0 border-dashed border">
            <div className="row align-items-center">
              <div className="col">
                <h6 className="m-0 font-16 fw-semibold">Notification</h6>
              </div>
              <div className="col-auto">
                {/* <Link to="#" className="text-dark text-decoration-underline">
                  <small>Clear All</small>
                </Link> */}
              </div>
            </div>
          </div>
          <SimpleBar className="px-1" style={{ maxHeight: "300px" }}>
            {(notifications || []).map((item, i) => (
              <div
                className="dropdown-item p-0 notify-item card shadow-none mb-1"
                key={i}
                style={{
                  backgroundColor: item.is_read ? secondary : "#FFEBEE", // Green for read, red for unread
                }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className={`notify-icon bg-${item.bgColor}`}>
                        <i className={item.icon}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 text-truncate ms-2">
                      <h5 className="noti-item-title fw-semibold font-14">
                        {item.text}
                      </h5>
                      <small className="noti-item-subtitle text-muted">
                        {item.subText}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </SimpleBar>

          {/* <Link to="#" className="dropdown-item text-center text-primary notify-item notify-all">
            View All <i className="fe-arrow-right"></i>
          </Link> */}
        </div>
      </Dropdown.Menu>
    </Dropdown>;
};
export default NotificationDropdown;