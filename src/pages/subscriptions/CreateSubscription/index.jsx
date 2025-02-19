import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";
import classNames from "classnames";

// components
import PageTitle from "../../../components/PageTitle";
import Table from "../../../components/Table";
import AddSubscription from "./AddSubscription";

// dummy data
import { customers } from "./data";

/* name column render */
const NameColumn = ({
  row
}) => {
  return <div className="table-user">
      <img src={row.original.avatar} alt="" className="me-2 rounded-circle" />
      <Link to="#" className="text-body fw-semibold">
        {row.original.name}
      </Link>
    </div>;
};

/* last order column render */
const LastOrderColumn = ({
  row
}) => {
  return <>
      {row.original.last_order.date}{" "}
      <small className="text-muted">{row.original.last_order.time}</small>
    </>;
};

/* status column render */
const StatusColumn = ({
  row
}) => {
  return <React.Fragment>
      <span className={classNames("badge", {
      "badge-soft-success": row.original.status === "Active",
      "badge-soft-danger": row.original.status === "Blocked"
    })}>
        {row.original.status}
      </span>
    </React.Fragment>;
};

/* action column render */
const ActionColumn = () => {
  return <React.Fragment>
      <Link to="#" className="action-icon">
        {" "}
        <i className="mdi mdi-eye"></i>
      </Link>
      <Link to="#" className="action-icon">
        {" "}
        <i className="mdi mdi-square-edit-outline"></i>
      </Link>
      <Link to="#" className="action-icon">
        {" "}
        <i className="mdi mdi-delete"></i>
      </Link>
    </React.Fragment>;
};

// columns to render
const columns = [{
  Header: "Customer",
  accessor: "name",
  sort: true,
  Cell: NameColumn,
  classes: "table-user"
}, {
  Header: "Phone",
  accessor: "phone",
  sort: true
}, {
  Header: "Balance",
  accessor: "balance",
  sort: true
}, {
  Header: "Orders",
  accessor: "orders",
  sort: true
}, {
  Header: "Last Order",
  accessor: "last_order",
  sort: true,
  Cell: LastOrderColumn
}, {
  Header: "Status",
  accessor: "status",
  sort: true,
  Cell: StatusColumn
}, {
  Header: "Action",
  accessor: "action",
  sort: false,
  Cell: ActionColumn
}];

// give page size
const sizePerPageList = [{
  text: "10",
  value: 10
}, {
  text: "25",
  value: 25
}, {
  text: "All",
  value: customers.length
}];

const CreateSubscription = () => 
    
    {
          const [show, setShow] = useState(false);
          const onCloseModal = () => setShow(false);
          const onOpenModal = () => setShow(true);
        
          /*
            handle form submission
            */
          const onSubmit = async (data) => {
            console.log('submitting');
            console.log(data);
            try {
              // WILL EDIT HERE
              const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              });
              console.log(res);
        
              const result = await res.json();
              
              console.log(result);
              if ( res.ok ) {
                console.log(res.ok);
        
                // saveSession({ ...(result ?? {}), token: result.token });
        
                // saveSession({
                //   ...(res.data ?? {}),
                //   token: res.data.token
                // });
        
                setPopup({
                  message: "Login successful!",
                  type: "success",
                  isVisible: true,
                  buttonLabel: "Proceed to the Admin Dashboard",
                  buttonRoute: "/dashboard-1",
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
            onCloseModal();

          };
        return <React.Fragment>
        <PageTitle breadCrumbItems={[{
        label: "Subscriptions",
        path: "/CreateSubscription"
      }, {
        label: "Create Subscription",
        path: "/CreateSubscription",
        active: true
      }]} title={"Create Subscriptions"} />
  
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Row>
                  <Col sm={4}>
                <Button variant="danger" className="waves-effect waves-light" onClick={onOpenModal}>
                                    <i className="mdi mdi-plus-circle me-1"></i> Add Subscription
                                  </Button>
                  </Col>
  
                  <Col sm={8}>
                    {/* <div className="text-sm-end">
                      <Button className="btn btn-success mb-2 me-1">
                        <i className="mdi mdi-cog-outline"></i>
                      </Button>
  
                      <Button className="btn btn-light mb-2 me-1">Import</Button>
  
                      <Button className="btn btn-light mb-2">Export</Button>
                    </div> */}
                  </Col>
                </Row>
  
                <Table columns={columns} data={customers} pageSize={10} sizePerPageList={sizePerPageList} isSortable={true} pagination={true} isSelectable={true} isSearchable={true} tableClass="table-striped dt-responsive nowrap w-100" searchBoxClass="my-2" />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* add customer modal */}
      <AddSubscription show={show} onHide={onCloseModal} onSubmit={onSubmit} />
      </React.Fragment>;

  };
  export default CreateSubscription;