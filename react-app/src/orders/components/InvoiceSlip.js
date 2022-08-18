import React, { useEffect } from "react";
import { Button, Row, Col, Table, Container } from "react-bootstrap";
import { useState } from "react";
import { useReactToPrint } from 'react-to-print';
import { useRef } from "react";
import { useParams } from "react-router-dom";


export const InvoiceSlip = () => {

    let {id: orderId} = useParams();

    const componentRef = useRef();
    
    const handlePrint = useReactToPrint({
      content: () => componentRef.current,
    });

      // hooks and redux
  const [orderdetails, setOrderDetails] = useState(null);
  
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
  }, []);

  return (
    <div  className="p-3">
       <Container fluid ref={componentRef} className="p-3">
        <Row className="slip-header mb-3">
            <Col>
                <h3>step solutions llc</h3>
                <p>10416 W State Road 84 Ste 6 <br></br> 
                Davie, FL 33324 US <br></br>
                admin@stepsolutionusa.com<br></br>
                www.stepsolutionusa.com</p>
            </Col>
            <Col className="text-end text-md-right mx-5">
            <img
          alt=""
          src="https://static1.squarespace.com/static/5feb8101b5b33b527b373ebc/t/624deb72c3b55f64018575de/1649273714852/stdpsolution+icon-05.png"
          width="100"
          height="100"
          
        />
        <h3 ><strong>invoice #</strong> {orderdetails?.order?.invoiceNumber}</h3>
            </Col>
        </Row>
       
        <Row className="slip-top-content">
            <Col>
                <h5>BILL TO</h5>
                <p>{orderdetails?.order?.customer?.company} <br></br>
                {orderdetails?.order?.customer?.address}<br></br>
                {orderdetails?.order?.customer?.address2}<br></br>
                {orderdetails?.order?.customer?.city},{orderdetails?.order?.customer?.state} {orderdetails?.order?.customer?.zipCode}                </p>
            </Col>
            <Col className=" text-md-left mx-5">
                <p>ISSUE DATE</p><p><strong>{new Date(
                      orderdetails?.order?.createdAt
                    ).toLocaleDateString("en-us", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })} </strong></p>
            </Col>
            <Col>
                <p>INVOICE NUMBER</p><p>{orderdetails?.order?.invoiceNumber}</p>
            </Col>
            <Col>    
                <p>PO/JOB NAME</p><p><strong>{orderdetails?.order?.poName}</strong></p>
            </Col>
            <Col className="text-end">
              <p>AMOUNT DUE</p><h1><strong>$ {orderdetails?.order?.totalAmount}</strong></h1>
            </Col>
        </Row>

        <Row className="slip-item-details mb-3 mx-2">
            <Table bordered responsive='md' className='table print-table'>
                <thead>
                    <tr>  
                        <th className="col-4" scope='col'>Product</th>
                        <th className="col-2 text-center" scope='col'>Qty</th>
                        <th className="col-2 text-center" scope='col'>Amount</th>
                        {/* <th className="col-4" scope='col'>Notes</th> */}
                    </tr>
                </thead>

                <tbody>
                    {orderdetails?.products.map((orderItem, index) => (
                        <tr key={orderItem.id}>
                        <td>{orderItem?.name}</td>
                        <td className="text-center">{orderdetails.order.orderItems[index]?.quantity}</td>
                        <td className="text-right">$ {orderItem.price}</td>
                        {/* <td>{orderdetails.order.orderItems[index]?.notes}</td> */}
                        </tr>
                    ))}
                     <tr>
                        <td colSpan={2}><strong>TOTAL</strong></td>
                        <td className="text-right"><strong>$ {orderdetails?.order?.totalAmount}</strong></td>
                     </tr>
                </tbody>
            </Table>    
            <Table bordered responsive='md'>
              <tbody className="">
               
              </tbody>
            </Table>
        </Row>
   
        <Row className="slip-footer justify-content-center">
            <Col className="text-center">
            <h2>Thank you for choosing <strong>step</strong>solution!</h2>
            </Col>
        </Row>
        </Container>
        <Row className="justify-content-center">
          <Button 
            onClick={handlePrint}
            variant="primary"
            type='submit'
            className="printer-btn shadow col-6" >
                Print
          </Button>
        </Row> 
    </div>
  );
};