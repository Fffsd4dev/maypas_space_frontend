import { Modal, Button } from "react-bootstrap";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";

// components
import { VerticalForm, FormInput} from "../../../components";
const AddSubscription = ({
  show,
  onHide,
  onSubmit,
  loading
}) => {

  
  // const [loading, setLoading] = useState(false);
  /*
    form validation schema
    */
  const schemaResolver = yupResolver(yup.object().shape({
    name: yup.string().required("Please enter name"),
    // email: yup.string().required("Please enter email").email("Please enter valid email"),
    duration: yup.string().required("Please enter duration (in months)"),
    price: yup.string().required("Please enter fee/charges")
  }));
  return <>
      <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header className="bg-light" onHide={onHide} closeButton>
          <Modal.Title className="m-0">Add a New Subscription Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <VerticalForm onSubmit={onSubmit} resolver={schemaResolver}>
            <FormInput label="Plan Name" type="text" name="name" placeholder="Enter subscription plan name" containerClass={"mb-3"} />
            {/* <FormInput label="Email address" type="email" name="email" placeholder="Enter email" containerClass={"mb-3"} /> */}
            <FormInput label="Duration (in months)" type="number" name="duration" placeholder="Enter duration in months" containerClass={"mb-3"} />
            <FormInput label="Fee/Charges" type="number" name="price" placeholder="Enter fee/charges" containerClass={"mb-3"} />

            <div className="text-end">

              <Button variant="success" type="submit" className="waves-effect waves-light me-1">
                {loading ? (" Creatin Plan...") : (" Create Plan")} 
              </Button>
              <Button variant="danger" className="waves-effect waves-light" onClick={onHide}>
                Hide
              </Button>
            </div>
          </VerticalForm>
        </Modal.Body>
      </Modal>
    </>;
};
export default AddSubscription;