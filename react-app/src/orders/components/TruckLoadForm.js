import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useHistory } from "react-router";
import PropTypes from "prop-types";
import { useState } from "react";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, {
  selectFilter, Comparator
} from "react-bootstrap-table2-filter";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import emailjs from "@emailjs/browser";

export const TruckLoadForm = () => {
  
  const componentRef = useRef();
  const [selectedRows, setSelectedRows] = useState([])
  const [isRowSelected, setIsRowSelected] = useState(false)
  

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [data, setData] = useState([]);
  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    axios(`${process.env.REACT_APP_API_URL}/orders`).then((res) => {
      console.log(res.data);
      setData(res.data);
    });
  };

  const selectOptions = {
    south: "South",
    north: "North",
    orlando: "Orlando",
    pickup: "Pick Up",
  };

  const selectStatus = {
    ready: "Ready",
    roduction: "In Production",
  };

  const dateFormatter=(data,row)=>{
    return<>{new Date(
      data
    ).toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}</>
  }

  const columns = [
    {
      dataField: "id",
      text: "Order ID",
      sort: true,
    },
    {
      dataField: "createdAt",
      text: "Date",
      sort: true,
      formatter: dateFormatter,
    },
    {
      dataField: "customer.company",
      text: "Company",
      sort: true,
    },
    {
      dataField: "invoiceNumber",
      text: "Invoice #",
      sort: true,
    },
    {
      dataField: "shippingRoute",
      text: "Route",
      sort: true,
      filter: selectFilter({
        options: selectOptions,
        comparator: Comparator.LIKE
      }),
    },
    {
      dataField: "orderStatus",
      text: "Status",
      sort: true,
      filter: selectFilter({
        options: selectStatus,
        comparator: Comparator.LIKE
      }),
    },
  ];

  // on selects

  const handleOnSelect = (row, isSelect, rowIndex, e) => {
    setSelectedRows([...selectedRows, row])
    setIsRowSelected(() => isSelect)
    return true
  }

  const handleOnSelectAll = (isSelect, rows) => {
    setIsRowSelected(isSelect)
    setSelectedRows(rows)
  }

  // select row from bootstrap table

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: true,
    // hideSelectColumn: true,
    bgColor: '#55D6BE',
    onSelectAll: handleOnSelectAll,
    onSelect: handleOnSelect,
    }
  


  // send email to those on the selected

  // selectedRows.forEach(row => {
  //   sendEmail(row)
  // }) 



    

  const sendEmail = (e) => {
    e.preventDefault();
    var templateParams = {
      // customer: orderdetails?.order?.customer.email,
    };
    emailjs
      .send(
        "service_g2ht3pj",
        "out-for-delivery",
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
    alert ("Your Emails have been sent!")
  };

  //allow to click into order
  //once you start checking ordders have buttons appear at top, one for notify out for delivery and one to print packing slips
  //third button to archive order or send to closed orders, this would require a seperate page to show these orders and have functionality to re-open or unarchive order. 

  return (
    <>
    
        {/* <div className='w-100 h-100 p-2 rounded-3'> */}
          <div className='p-3' >
            <div>
              <Container>
                <Row>
                  <Col>
                    <Button
                        onClick={sendEmail}
                        variant='success'
                        className='mb-3'
                      >
                        Notify Out for Delivery
                    </Button>
                  </Col>
                </Row>
              </Container>
            </div>
            <div ref={componentRef}> 
              <div>
                <Row className='justify-content-between'>
                  <Col>
                    <img
                      alt=''
                      src='/./../Step-Solution-Logo-Dark.png'
                      width='330'
                      height='auto'
                      className='d-inline-block align-center'
                    />{" "}
                  </Col>

                  <Col>
                    <h1 className='text-end align-text-bottom'>
                      <strong>Truck</strong>Load
                    </h1>
                  </Col>
                </Row>
              </div>

                {/* Dashboard content */}

              <div className=''>
                  <BootstrapTable
                    keyField='id'
                    data={data}
                    columns={columns}
                    selectRow={ selectRow }
                    striped
                    hover
                    condensed
                    pagination={paginationFactory()}
                    filter={filterFactory()}
                  ></BootstrapTable>
              </div>
            </div>

          </div>
        
          <Container>
            <Col className='mb-5 text-center'>
              <Button
                onClick={handlePrint}
                variant="primary" type='submit' className="printer-btn shadow col-6"
              >
                print this view
              </Button>
            </Col>
          </Container>
        {/* </div> */}
 
    </>
  );
};

TruckLoadForm.propTypes = {
  user: PropTypes.object,
  userId: PropTypes.string,
};
