import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useHistory } from "react-router";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button, Table } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import emailjs from "@emailjs/browser";

// redux and custom hook imports
import { useSelector } from "react-redux";
import Select from "react-select";
import { orderStatusOptions, staffOptions } from "../common";
import { shippingRouteOptions } from "../common/shippingRouteOptions";

import Alert from "react-bootstrap/Alert";
import { NewProductFormModal } from "../../components/NewProductFormModal";

export const DashboardOrderDetails = () => {
  const history = useHistory();
  const username = useSelector((state) => state.session.user.username);
  let { id: orderId } = useParams();

  // Current Order
  // const { orderdetails, setOrderDetails } = useFetchOrder({ orderId });
  const [orderdetails, setOrderDetails] = useState("");
  const [orderStatus, setOrderStatus] = useState([]);
  const [shippingRoute, setShippingRoute] = useState([]);

  const [staff, setStaff] = useState("");

  // Invoice
  const [createdInvoice, setCreatedInvoice] = useState(null);

  // Error Message
  const [errorMessage, setErrorMessage] = useState({
    message: "",
    active: false,
    flag: "danger",
  });

  // edit order products
  const [showModal, setShowModal] = useState(false);

  // edit order items
  const [newOrderItems, setNewOrderItems] = useState([]);

  const handleOrderItemChange = (e, index, orderItems) => {
    const targetItem = orderdetails.order.orderItems[index];
    const updatedOrderItems = orderItems.map((item) =>
      item.id === targetItem.id
        ? {
            ...item,
            quantity: parseInt(e.target.value),
          }
        : item
    );
    console.log(updatedOrderItems);
    setNewOrderItems(updatedOrderItems);
  };

  const routeSelect = () => {
    if (orderdetails) {
      return (
        <Form.Group as={Col} controlId='formRoute'>
          <Form.Label>Route</Form.Label>
          <Select
            defaultValue={{
              value: orderdetails?.order?.shippingRoute,
              label: orderdetails?.order?.shippingRoute,
            }}
            onChange={setShippingRoute}
            options={shippingRouteOptions}
          />
        </Form.Group>
      );
    } else return null;
  };

  const statusSelect = () => {
    if (orderdetails) {
      return (
        <Form.Group as={Col} controlId='formStatus'>
          <Form.Label>Status</Form.Label>
          <Select
            defaultValue={{
              value: orderdetails?.order?.orderStatus,
              label: orderdetails?.order?.orderStatus,
            }}
            onChange={setOrderStatus}
            options={orderStatusOptions}
          />
        </Form.Group>
      );
    } else return null;
  };

  const staffSelect = () => {
    if (orderdetails) {
      return (
        <Form.Group as={Col} controlId='formStaff'>
          <Form.Label>Staff</Form.Label>
          <Select
            defaultValue={{
              value: orderdetails?.order?.staffId,
              label:
                staffOptions[orderdetails?.order?.staffId - 1]?.label || "N/A",
            }}
            onChange={setStaff}
            options={staffOptions}
          />
        </Form.Group>
      );
    } else return null;
  };

  const fetchOrder = async (orderId) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/orders/${orderId}`
    );
    if (response.ok) {
      const orderdetails = await response.json();
      setOrderDetails(orderdetails);
    } else if (response.status < 500) {
      const data = await response.json();
      if (data.errors) {
        return data.errors;
      }
    } else {
      return ["An error occurred. Please try again."];
    }
  };

  useEffect(() => {
    fetchOrder(orderId);
  }, [orderId]);

  const editOrder = async (orderPayload) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/orders/${orderId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return ["An error occurred. Please try again."];
    }
  };

  const editOrderItem = async (id, orderItemPayload) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/order-items/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderItemPayload),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return ["An error occurred. Please try again."];
    }
  };

  const handleDelete = async (orderId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/orders/${orderId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) await history.push(`/profile/user/`);
    } catch (err) {
      console.log("Order could not be deleted");
    }
  };

  // Send Email
  const sendEmail = (e) => {
    e.preventDefault();

    var templateParams = {
      customer: orderdetails?.order?.customer.email,
    };

    emailjs
      .send(
        "service_g2ht3pj",
        "order-ready",
        templateParams,
        "kBf3wIb1lGnimy156"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  // const printInvoice = (invoiceID) => {
  //   fetch(`/api/auth/invoice/${invoiceID}/pdf?minorversion=63`, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((data) => console.log(data))
  //     .catch((error) => console.log(error));
  // };

  const sendAnInvoice = (email, invoiceId) => {
    fetch("/api/auth/send-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        invoiceId,
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((error) => console.log(error));
  };

  

  const createInvoice = ({ order, products }) => {

    const discountline = {
      DetailType: "DiscountLineDetail",   
      // Amount: orderdetails.order.discount, 
      Amount:"0",
      Description: "Less discount", 
      DiscountLineDetail: {
          PercentBased: false, 
      }
    };

    const lineItems = products.map((product, index) => {
      return {
        Amount: product.price * order.orderItems[index].quantity,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          Qty: order.orderItems[index].quantity,
          UnitPrice: product.price,
          ItemRef: {
            value: product.quickbooksId,
            name: product.name,
          },
        },
      }     
    });

    const payload = {
      Line: [...lineItems, discountline],
      AllowIPNPayment: true,
      AllowOnlinePayment: true,
      AllowOnlineCreditCardPayment: true,
      AllowOnlineACHPayment: true,
      CustomField: [
        {
          DefinitionId: "1",
          Name: "Work Order",
          Type: "StringType",
          StringValue: orderdetails.order.id,
        },
        {
          DefinitionId: "2",
          Name: "PO# / Job Name",
          Type: "StringType",
          StringValue: orderdetails.order.poName,
        },
        {
          DefinitionId: "3",
          Name: "Route",
          Type: "StringType",
          StringValue: orderdetails.order.shippingRoute,
        },
      ],
      CustomerRef: {
        value: order.customer.quickbooksId,
      },
    };
    fetch("/api/auth/create-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.Invoice)
          setErrorMessage({
            message: "Invoice could not be created",
            active: true,
          });
        editOrder({
          invoiceNumber: parseInt(data.Invoice.DocNumber),
        });
        sendAnInvoice(order.customer.email, data.Invoice.Id);
        setErrorMessage({
          message: "Invoice created and sent to customer",
          active: true,
          flag: "success",
        });
      })
      .catch((error) => console.log(error));
  };

  const handleEditOrder = async () => {
    editOrder({
      shippingRoute: shippingRoute.value,
      orderStatus: orderStatus.value,
      staffId: staff.value,
    });
    console.log(newOrderItems);
    for (let i = 0; i < newOrderItems.length; i++) {
      console.log(newOrderItems[i]);
      editOrderItem(newOrderItems[i].id, newOrderItems[i]);
    }
  };

  return (
    <>
      <div className='w-100 d-flex p-4'>
        <div className='w-100 p-2 rounded-3'>
          <div className='dashboard-page'>
            {/* Dashboard title area */}
            <Container>
              <Row className='mb-3'>
                <Col>
                  <h2>
                    Order #<strong> {orderdetails?.order?.id}</strong>
                  </h2>
                </Col>
                </Row>
                <Row className='mb-3'>
                {!(username === "staff") && (
                  <Col md='auto'>
                    <Link
                      to={{
                        pathname: `/profile/user/${orderdetails?.order?.id}/orderdetails/productionlabel`,
                        state: orderdetails,
                      }}
                      target='_blank'
                    >
                      <Button variant='dark' className='mb-3'>
                        Print Production Label
                      </Button>
                    </Link>
                  </Col>
                )}

                <Col md='auto'>
                  <Link
                    to={{
                      pathname: `/profile/user/${orderdetails?.order?.id}/orderdetails/productlabel`,
                      state: orderdetails,
                    }}
                    target='_blank'
                  >
                    <Button variant='dark' className='mb-3'>
                      Print Product Label
                    </Button>
                  </Link>
                </Col>
                {!(username === "staff") && (
                  <>
                    <Col md='auto'>
                      <Button
                        onClick={() => createInvoice(orderdetails)}
                        variant='success'
                        className='mb-3'
                      >
                        Generate Invoice
                      </Button>
                    </Col>

                    <Col md='auto'>
                      <Link
                        to={{
                          pathname: `/profile/user/${orderdetails?.order?.id}/orderdetails/invoice-slip`,
                          state: orderdetails,
                        }}
                        target='_blank'
                      >
                        <Button variant='secondary' className='mb-3'>
                          Print Invoice
                        </Button>
                      </Link>
                    </Col>

                    <Col md='auto'>
                    <Link
                    to={{
                      pathname: `/profile/user/${orderdetails?.order?.id}/orderdetails/packing-slip`,
                      state: orderdetails,
                    }}
                    target='_blank'
                  >
                    <Button variant='secondary' className='mb-3'>
                    Print Packing Slip
                    </Button>
                      </Link>
                    </Col>
                  </>
                )}
              </Row>
            </Container>

            {/* Dashboard content */}
            {errorMessage.active && (
              <Alert variant={errorMessage.flag}>{errorMessage.message}</Alert>
            )}
            <Form className='h-100 p-5 border rounded-3'>
              <Row className='mb-3'>
                <Form.Group as={Col} controlId='formOrderID'>
                  <Form.Label>Order ID</Form.Label>
                  <Form.Control type='text' value={orderdetails?.order?.id} />
                </Form.Group>

                <Form.Group as={Col} controlId='formCustomer'>
                  <Form.Label>Customer</Form.Label>
                  <Form.Control
                    type='text'
                    value={orderdetails?.order?.customer?.company}
                  />
                </Form.Group>

                <Form.Group as={Col} controlId='formOrderDate'>
                  <Form.Label>Date Placed</Form.Label>
                  <Form.Control
                    type='text'
                    value={new Date(
                      orderdetails?.order?.createdAt
                    ).toLocaleDateString("en-us", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  />
                </Form.Group>
              </Row>
              <Row className='mb-3'>
                <Form.Group as={Col} controlId='formJobName'>
                  <Form.Label>PO/Job Name</Form.Label>
                  <Form.Control
                    type='text'
                    value={orderdetails?.order?.poName}
                    onChange={(e) =>
                      setOrderDetails({
                        ...orderdetails,
                        poName: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                {routeSelect()}
                {statusSelect()}
                {staffSelect()}
              </Row>
              {!(username === "staff") && (
                <Row className='mb-3'>
                  <Form.Group as={Col} controlId='formTierLevel'>
                    <Form.Label>Tier Level</Form.Label>
                    <Form.Control
                      type='text'
                      value={orderdetails?.order?.customer.tierLevel}
                      onChange={(e) =>
                        setOrderDetails({
                          ...orderdetails,
                          tierLevel: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                  <Form.Group as={Col} controlId='formTierLevel'>
                    <Form.Label>Invoice #</Form.Label>
                    <Form.Control
                      type='text'
                      value={orderdetails?.order?.invoiceNumber}
                      onChange={(e) =>
                        setOrderDetails({
                          ...orderdetails,
                          invoiceNumber: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                  
                  <Form.Group as={Col} controlId='formDiscount'>
                    <Form.Label>Discount</Form.Label>
                    <Form.Control
                      type='text'
                      // value={`$ ${orderdetails?.order?.discount}`}
                    />
                  </Form.Group>
                  <Form.Group as={Col} controlId='formTotalAmount'>
                    <Form.Label>Amount </Form.Label>
                    <Form.Control
                      type='text'
                      value= {`$ ${orderdetails?.order?.totalAmount}`}
                    />
                  </Form.Group>
                </Row>
              )}
              <Row>
                <Table striped bordered hover responsive='lg' className='table'>
                  <thead className='thead-dark'>
                    <tr>
                      <th scope='col'>#</th>
                      <th scope='col'>Product</th>
                      <th scope='col'>Qty</th>
                      {!(username === "staff") && <th scope='col'>Rate</th>}
                      <th scope='col'>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderdetails?.products?.map((orderItem, index) => (
                      <tr key={orderItem.id}>
                        <td>{index + 1}</td>
                        <td>{orderItem?.name}</td>
                        <td>
                          <Form.Control
                            type='text'
                            placeholder={
                              orderdetails.order.orderItems[index]?.quantity
                            }
                            onChange={(e) =>
                              handleOrderItemChange(
                                e,
                                index,
                                orderdetails.order.orderItems
                              )
                            }
                          />
                          {/* {orderdetails.order.orderItems[index]?.quantity} */}
                        </td>
                        {!(username === "staff") && (
                          <td>${orderItem?.price}</td>
                        )}
                        <td>{orderdetails.order.orderItems[index]?.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Row>
              <Row>
                <Col md='auto'>
                  <Button
                    onClick={handleEditOrder}
                    // onClick={() =>
                    //   editOrder({
                    //     shippingRoute: shippingRoute.value,
                    //     orderStatus: orderStatus.value,
                    //     staffId: staff.value,
                    //   })
                    // }
                    variant='success'
                  >
                    Update Order
                  </Button>
                </Col>
                {!(username === "staff") && (
                  <>
                    <Col md='8'>
                      <Button
                        variant='warning'
                        onClick={() => setShowModal(true)}
                      >
                        Add products
                      </Button>
                    </Col>

                    <Col md='2'>
                      <Button
                        variant='danger'
                        onClick={() => handleDelete(orderdetails?.order?.id)}
                      >
                        Delete Order
                      </Button>
                    </Col>
                  </>
                )}
              </Row>
            </Form>
            <NewProductFormModal
              showModal={showModal}
              setShowModal={showModal}
              onHide={() => setShowModal(false)}
              orderDetails={orderdetails}
            />
          </div>
        </div>
      </div>
    </>
  );
};
