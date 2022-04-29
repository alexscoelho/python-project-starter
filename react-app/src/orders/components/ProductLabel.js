import React, { useEffect } from "react";
import { Button, Row, Col, Table } from "react-bootstrap";
import { useState } from "react";
import { useReactToPrint } from 'react-to-print';
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { productSelectOptions } from "../../adapters/productAdapter";

export const ProductLabel = () => {

  let {id: orderId} = useParams();

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });



    // hooks and redux
    const dispatch = useDispatch();
    const [validated, setValidated] = useState(false);
    const [orderdetails, setOrderDetails] = useState(null);
  
  
    const fetchOrder = async (orderId) => {
      const response = await fetch(
        // `${process.env.REACT_APP_API_URL}/orders/${orderId}`
        `https://stepsolutionapi.herokuapp.com/orders/${orderId}`
    
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
    }, []);

  return (

    // <div  className="mt-5 d-flex justify-content-center align-items-center">
      <div ref={componentRef} className=" rounded  p-sm-3" >
        
         
          <img
              alt=""
              src="https://static1.squarespace.com/static/5feb8101b5b33b527b373ebc/t/624deb72c3b55f64018575de/1649273714852/stdpsolution+icon-05.png"
              width="60"
              height="60"
              className="mb-3 mx-auto d-block"
            />
         
        <h1 className="mb-3 text-center border">{orderdetails?.order?.customer?.company}</h1>
            <Row className="mb-3">
              <Col>Order ID</Col>
              <Col className="fw-bold">{orderdetails?.order?.id}</Col>
            </Row>
            <hr />
            <Row className="mb-3">
              <Col>Date</Col>
              <Col className="fw-bold">{orderdetails?.order?.createdAt}</Col>
            </Row>
            <hr />
            <Row className="mb-3">
              <Col>PO/Job Name</Col>
              <Col className="fw-bold">{orderdetails?.order?.poName}</Col>
            </Row>
            <hr />
            <Row className="mb-3">
              <Col>Route</Col>
              <Col className="fw-bold">{orderdetails?.order?.shippingRoute}</Col>
            </Row>
            <hr />
    
            <Table bordered responsive='md' className='table print-table'>
              <thead>
                <tr>  
                  <th scope='col'>#</th>
                  <th scope='col'>Product</th>
                  <th scope='col'>Qty</th>
                  <th scope='col'>Notes</th>
                </tr>
              </thead>
              <tbody>
                        {orderdetails?.products.map((orderItem, index) => (
                          <tr key={orderItem.id}>
                            <td>{index + 1}</td>
                            <td>{orderItem?.name}</td>
                            <td>{orderdetails.order.orderItems[index]?.quantity}</td>
                            <td>{orderdetails.order.orderItems[index]?.notes}</td>
                          </tr>
                        ))}
                  </tbody>
            </Table>    
            <Row className="m-5">
              <Button 
                onClick={handlePrint}
              variant="dark" type='submit' className="printer-btn" >
                print
              </Button>
            </Row>
           
      </div>
    // </div>
  );
};


