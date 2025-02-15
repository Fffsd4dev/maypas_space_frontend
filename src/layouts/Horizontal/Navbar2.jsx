import React from "react";
// import { Collapse } from 'react-bootstrap';
// import classNames from 'classnames';
// import SimpleBar from 'simplebar-react';

// helpers
import { getHorizontalMenuItems } from "../../helpers/menu2";

// components
import AppMenu2 from "./Menu2";
const Navbar2 = () => {
  // change the inputTheme value to light for creative theme
  // const inputTheme = 'light';

  return <React.Fragment>
      <div className="app-menu">
        <AppMenu2 menuItems={getHorizontalMenuItems()} />
      </div>
    </React.Fragment>;
};
export default Navbar2;