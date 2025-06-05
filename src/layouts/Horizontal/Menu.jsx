import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import MenuItem from "./MenuItem";
import MenuItemWithChildren from "./MenuItemWithChildren";
import classNames from "classnames";

const AppMenu = ({ menuItems }) => {
  const location = useLocation();
  const menuRef = useRef(null);

 const [activeMenuItems, setActiveMenuItems] = useState([]);
const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];

  const toggleMenu = (item) => {
    if (activeMenuItems.includes(item.key)) {
      setActiveMenuItems((prev) => prev.filter((key) => key !== item.key));
    } else {
      setActiveMenuItems((prev) => [...prev, item.key]);
    }
  };

  return (
    <ul className="menu" ref={menuRef} id="main-side-menu">
      {safeMenuItems.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.children ? (
            <MenuItemWithChildren
              item={item}
              tag="li"
              className="menu-item"
              subMenuClassNames="dropdown-menu"
              activeMenuItems={activeMenuItems}
              linkClassName="nav-link"
              toggleMenu={toggleMenu}
            />
          ) : (
            <MenuItem
              item={item}
              className={classNames({
                "menuitem-active": activeMenuItems.includes(item.key),
              })}
              linkClassName={classNames({
                "menuitem-active": activeMenuItems.includes(item.key),
              })}
            />
          )}
        </React.Fragment>
      ))}
    </ul>
  );
};

export default AppMenu;
