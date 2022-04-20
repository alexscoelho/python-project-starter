import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button, Table } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Select from "react-select";
import axios from "axios";
import { customerSelectOptions } from "../../../adapters/customerAdapter";
import { productSelectOptions } from "../../../adapters/productAdapter";
import { createOrderDto } from "../../../adapters/orderAdapter";
import { createOrderItemDto } from "../../../adapters/orderItemsAdapter";
import { sendEmail } from "../../../utils/sendEmail";

export const DashboardNewOrder = () => {
  const params = useParams();
  // const { store, actions } = useContext(Context);
  let { id } = useParams();

  // const formatter = new Intl.NumberFormat("en-US", {
  // 	style: "currency",
  // 	currency: "USD",
  // 	minimumFractionDigits: 0
  // });

  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState([]);
  const [poName, setPoName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [orderProducts, setOrderProducts] = useState([
    {
      id: 1,
      createdAt: "2022-04-16T18:36:20.778Z",
      updatedAt: "2022-04-16T18:36:20.778Z",
      sku: "dfvdfb",
      name: "Product 1",
      price: 10,
      imageUrl: "http://yahoo.com",
      description: "this is a description",
      tierLevel: "2",
      type: "SERVICE",
      quantity: 2,
      notes: "note",
    },
    {
      id: 2,
      createdAt: "2022-04-16T20:20:27.988Z",
      updatedAt: "2022-04-16T20:20:27.989Z",
      sku: "dfvdfb",
      name: "Product 2",
      price: 10,
      imageUrl: "http://yahoo.com",
      description: "this is a description",
      tierLevel: "2",
      type: "SERVICE",
      quantity: 2,
      notes: "note",
    },
  ]);

  const [route, setRoute] = useState([]);
  const routes = [
    { value: "North", label: "North" },
    { value: "South", label: "South" },
    { value: "Pick Up", label: "Orlando" },
    { value: "Pick Up", label: "North" },
  ];

  const [orderStatus, setOrderStatus] = useState([]);
  const orderStatusOptions = [
    { value: "In Production", label: "In Production" },
    { value: "Ready", label: "Ready" },
    { value: "Completed", label: "Completed" },
  ];

  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    getCustomers();
  }, []);
  useEffect(() => {
    getProducts();
  }, []);
  const getCustomers = () => {
    axios(`${process.env.REACT_APP_API_URL}/customers`).then((res) => {
      const customerOptions = customerSelectOptions(res.data);
      setCustomers(customerOptions);
    });
  };
  const getProducts = () => {
    axios(`${process.env.REACT_APP_API_URL}/products`).then((res) => {
      const productOptions = productSelectOptions(res.data);
      setProducts(productOptions);
    });
  };

  useEffect(() => {
    setPrice(product.value?.price);
  }, [product]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setOrderProducts([
        ...orderProducts,
        {
          id: product.value.id,
          name: product.label,
          quantity,
          price,
          notes,
        },
      ]);
      setQuantity("");
      setPrice("");
      setNotes("");
      setProduct([]);
    }
  };

  const [totalOrderAmount, setTotalOrderAmount] = useState(0);
  useEffect(() => {
    const currentTotalOrderPrice = calculateOrderTotalPrice(orderProducts);
    setTotalOrderAmount(currentTotalOrderPrice);
  }, [orderProducts]);

  const calculateOrderTotalPrice = (orderProducts) => {
    let totalPrice = orderProducts.reduce((acc, cur) => {
      return acc + cur.price * cur.quantity;
    }, 0);

    return totalPrice;
  };

  const handleSubmit = async (order, orderItems) => {
    const newOrder = await createOrder(order);
    if (!newOrder.id) throw new Error("Order could not be created");
    const orderItemsDto = createOrderItemDto(newOrder.id, orderItems);
    for (let i = 0; i < orderItemsDto.length; i++) {
      const newOrderItem = createOrderItem(orderItemsDto[i]);
      if (!newOrderItem.id) break;
    }
    sendEmail(customer?.emai, "order-in-production");
  };

  const createOrder = async (order) => {
    const dto = createOrderDto(order);
    const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    if (response.ok) {
      const data = await response.json();
      // call redux dispatch, it set customer also in store
      return data;
    } else if (response.status < 500) {
      const data = await response.json();
      if (data.errors) {
        return data.errors;
      }
    } else {
      return ["An error occurred. Please try again."];
    }
  };

  const createOrderItem = async (orderItem) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/order-items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderItem),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status < 500) {
      const data = await response.json();
      if (data.errors) {
        return data.errors;
      }
    } else {
      return ["An error occurred. Please try again."];
    }
  };

  return (
    <>
      <div className='w-100 d-flex p-4'>
        <div className='w-100 p-2 rounded-3'>
          <div className='dashboard-page'>
            {/* Dashboard title area */}
            <Container>
              <Row>
                <h2>New Order</h2>
              </Row>
            </Container>

            {/* Dashboard content */}
            <Form
              className='h-100 p-5 border rounded-3'
              onKeyPress={handleKeyPress}
            >
              <Row className='mb-3'>
                <Form.Group as={Col} controlId='formOrderID'>
                  <Form.Label>Order ID</Form.Label>
                  <Form.Control plaintext readOnly defaultValue='023' />
                </Form.Group>

                <Form.Group as={Col} controlId='formCustomer'>
                  <Form.Label>Customer</Form.Label>
                  <Select
                    defaultValue={customer}
                    onChange={setCustomer}
                    options={customers}
                  />
                </Form.Group>

                {/* <Form.Group as={Col} controlId='formOrderDate'>
                  <Form.Label>Date Placed</Form.Label>
                  <Form.Control type='date' placeholder='' />
                </Form.Group> */}
              </Row>
              <Row className='mb-3'>
                <Form.Group as={Col} controlId='formJobName'>
                  <Form.Label>PO/Job Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='PO/Job Name'
                    value={poName}
                    onChange={(e) => setPoName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group as={Col} controlId='formRoute'>
                  <Form.Label>Route</Form.Label>
                  <Select
                    defaultValue={route}
                    onChange={setRoute}
                    options={routes}
                  />
                </Form.Group>

                <Form.Group as={Col} controlId='formStatus'>
                  <Form.Label>Status</Form.Label>
                  <Select
                    defaultValue={orderStatus}
                    onChange={setOrderStatus}
                    options={orderStatusOptions}
                  />
                </Form.Group>
              </Row>
              <Row className='mb-3'>
                <Form.Group as={Col} controlId='formTierLevel'>
                  <Form.Label>Tier Level</Form.Label>
                  <Form.Select aria-label='SelectRoute'>
                    <option>Select</option>
                    <option value='1'>A</option>
                    <option value='2'>B</option>
                    <option value='3'>C</option>
                    <option value='1'>D</option>
                    <option value='2'>E</option>
                    <option value='3'>F</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group as={Col} controlId='formTierLevel'>
                  <Form.Label>Invoice #</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='0001'
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </Form.Group>

                <Form.Group as={Col} controlId='formCustomer'>
                  <Form.Label>Total Amount</Form.Label>
                  <Form.Control
                    type='currency'
                    placeholder='$400'
                    value={totalOrderAmount || ""}
                    onChange={setTotalOrderAmount}
                  />
                </Form.Group>
              </Row>
              <Row>
                <Table striped bordered hover responsive='lg' className='table'>
                  <thead className='thead-dark'>
                    <tr>
                      <th scope='col'>#</th>
                      <th scope='col'>Product</th>
                      <th scope='col'>Qty</th>
                      <th scope='col'>Rate</th>
                      <th scope='col'>Notes</th>
                      <th scope='col'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderProducts.map((product, index) => (
                      <tr key={product.id}>
                        <td>{index}</td>
                        <td>{product.name}</td>
                        <td>{product.quantity}</td>
                        <td>{product.price}</td>
                        <td>{product.notes}</td>
                        <td>
                          <Button
                            onClick={() =>
                              setOrderProducts(
                                orderProducts.filter(
                                  (orderProduct) =>
                                    orderProduct.id !== product.id
                                )
                              )
                            }
                            variant='danger'
                          >
                            X
                          </Button>
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td>1</td>
                      <td>
                        <Select
                          defaultValue={product}
                          onChange={setProduct}
                          options={products}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type='text'
                          placeholder='qty'
                          value={quantity || ""}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type='text'
                          placeholder='$0'
                          value={price || ""}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type='text'
                          placeholder='Notes'
                          value={notes || ""}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </Row>
              <Row>
                <Col md='auto'>
                  <Button variant='danger'>Delete Order</Button>
                </Col>
                <Col>
                  <Button
                    variant='success'
                    onClick={() =>
                      handleSubmit(
                        {
                          customer,
                          totalOrderAmount,
                          poName,
                          route,
                          orderStatus,
                          invoiceNumber,
                        },
                        orderProducts
                      )
                    }
                  >
                    Save Order
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};
