// import { Modal, Button } from "react-bootstrap";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";

// // components
// import { VerticalForm, FormInput } from "../../../components";
// const AddCustomer = ({
//   show,
//   onHide,
//   onSubmit
// }) => {
//   /*
//     form validation schema
//     */
//   const schemaResolver = yupResolver(yup.object().shape({
//     name: yup.string().required("Please enter name"),
//     email: yup.string().required("Please enter email").email("Please enter valid email"),
//     phone: yup.string().required("Please enter phone").matches(/^\d{10}$/, "Phone number is not valid"),
//     location: yup.string().required("Please enter location")
//   }));
//   return <>
//       <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
//         <Modal.Header className="bg-light" onHide={onHide} closeButton>
//           <Modal.Title className="m-0">Add New Workspace</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="p-4">
//           <VerticalForm onSubmit={onSubmit} resolver={schemaResolver}>
//             <FormInput label="Full Name" type="text" name="name" placeholder="Enter full name" containerClass={"mb-3"} />
//             <FormInput label="Email address" type="email" name="email" placeholder="Enter email" containerClass={"mb-3"} />
//             <FormInput label="Phone" type="text" name="phone" placeholder="Enter phone number" containerClass={"mb-3"} />
//             <FormInput label="Location" type="text" name="location" placeholder="Enter location" containerClass={"mb-3"} />

//             <div className="text-end">
//               <Button variant="success" type="submit" className="waves-effect waves-light me-1">
//                 Save
//               </Button>
//               <Button variant="danger" className="waves-effect waves-light" onClick={onHide}>
//                 Continue
//               </Button>
//             </div>
//           </VerticalForm>
//         </Modal.Body>
//       </Modal>
//     </>;
// };
// export default AddCustomer;





import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import axios from "axios";

// components
import { FormInput } from "../../../components";

const AddCustomer = ({ show, onHide }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /*
    Form validation schema
  */
  const schema = yup.object().shape({
    company_name: yup.string().required("Please enter company name"),
    first_name: yup.string().required("Please enter first name"),
    last_name: yup.string().required("Please enter last name"),
    email: yup.string().required("Please enter email").email("Please enter a valid email"),
    phone: yup.string().required("Please enter phone").matches(/^\d{10}$/, "Phone number is not valid"),
    company_no_location: yup.string().required("Please enter company location"),
    company_countries: yup.string().required("Please enter at least one country"),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });

  // Reset form when modal is closed
  useEffect(() => {
    if (!show) {
      reset(); // Clears form state
      setErrorMessage(""); // Clears any previous errors
    }
  }, [show, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        company_name: data.company_name,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        company_no_location: data.company_no_location,
        company_countries: data.company_countries.split(",").map((c) => c.trim()), // Convert string to array
      };

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/system-admin/register-workspace`, payload);

      if (response.status === 201 || response.status === 200) {
        alert("Workspace created successfully!");
        reset(); // Clear the form
        onHide(); // Close the modal
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      setErrorMessage(error.response?.data?.message || "Failed to create workspace. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title className="m-0">Add New Workspace</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            label="Company Name"
            type="text"
            name="company_name"
            placeholder="Enter company name"
            containerClass="mb-3"
            register={register}
            error={errors.company_name?.message}
            className={errors.company_name ? "is-invalid" : ""}
          />
          <FormInput
            label="First Name"
            type="text"
            name="first_name"
            placeholder="Enter first name"
            containerClass="mb-3"
            register={register}
            error={errors.first_name?.message}
            className={errors.first_name ? "is-invalid" : ""}
          />
          <FormInput
            label="Last Name"
            type="text"
            name="last_name"
            placeholder="Enter last name"
            containerClass="mb-3"
            register={register}
            error={errors.last_name?.message}
            className={errors.last_name ? "is-invalid" : ""}
          />
          <FormInput
            label="Email address"
            type="email"
            name="email"
            placeholder="Enter email"
            containerClass="mb-3"
            register={register}
            error={errors.email?.message}
            className={errors.email ? "is-invalid" : ""}
          />
          <FormInput
            label="Phone"
            type="text"
            name="phone"
            placeholder="Enter phone number"
            containerClass="mb-3"
            register={register}
            error={errors.phone?.message}
            className={errors.phone ? "is-invalid" : ""}
          />
          <FormInput
            label="Company Location"
            type="text"
            name="company_no_location"
            placeholder="Enter company location"
            containerClass="mb-3"
            register={register}
            error={errors.company_no_location?.message}
            className={errors.company_no_location ? "is-invalid" : ""}
          />
          <FormInput
            label="Company Countries"
            type="text"
            name="company_countries"
            placeholder="Enter countries (comma-separated)"
            containerClass="mb-3"
            register={register}
            error={errors.company_countries?.message}
            className={errors.company_countries ? "is-invalid" : ""}
          />

          <div className="text-end">
            <Button variant="success" type="submit" className="waves-effect waves-light" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Submit"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddCustomer;
