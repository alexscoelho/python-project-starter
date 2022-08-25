import React, { useEffect } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import PropTypes from "prop-types";
import { useState } from "react";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, {
  selectFilter,
  Comparator,
} from "react-bootstrap-table2-filter";
import { useReactToPrint } from "react-to-print";
import {
  Document,
  BlobProvider,
  pdf,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { useRef } from "react";
import emailjs from "@emailjs/browser";
import { PackingSlip } from "./PackingSlip";
import { PackingSlipSimple } from "./PackingSlipSimple";

export const TruckLoadForm = () => {
  const componentRef = useRef();
  const [selectedRows, setSelectedRows] = useState([]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [data, setData] = useState([]);
  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    axios(`${process.env.REACT_APP_API_URL}/orders`).then((res) => {
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

  const dateFormatter = (data, row) => {
    return (
      <>
        {new Date(data).toLocaleDateString("en-us", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </>
    );
  };

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
        comparator: Comparator.LIKE,
      }),
    },
    {
      dataField: "orderStatus",
      text: "Status",
      sort: true,
      filter: selectFilter({
        options: selectStatus,
        comparator: Comparator.LIKE,
      }),
    },
  ];

  const handleOnSelect = (row, isSelect, rowIndex, e) => {
    if (isSelect) {
      setSelectedRows([...selectedRows, row]);
    } else {
      const newSelectedRows = selectedRows.filter(
        (currentRow) => currentRow.id !== row.id
      );
      setSelectedRows(newSelectedRows);
    }
    return true;
  };

  const handleOnSelectAll = (isSelect, rows) => {
    if (!isSelect) setSelectedRows([]);
    else {
      setSelectedRows(rows);
    }
  };

  const selectRow = {
    mode: "checkbox",
    clickToSelect: true,
    // hideSelectColumn: true,
    bgColor: "#55D6BE",
    onSelectAll: handleOnSelectAll,
    onSelect: handleOnSelect,
  };

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
    alert("Your Emails have been sent!");
  };

  const PackingSlipPdf = (id) => {
    return (
      <Document>
        <PackingSlipSimple id={id} />
      </Document>
    );
  };

  const styles = StyleSheet.create({
    page: { backgroundColor: "tomato" },
    section: { color: "white", textAlign: "center", margin: 30 },
  });

  const MyComp = () => {
    return (
      <Document>
        <Page size='A4' style={styles.page}>
          <View style={styles.section}>
            <Text>Section #1</Text>
          </View>
        </Page>
      </Document>
    );
  };

  const handlePrintPackingSlips = async () => {
    selectedRows.forEach(
      (row) => {
        let alink = document.createElement("a");
        // let pdfcomponent = <PackingSlipPdf id={row.id} />;
        alink.href = pdf(<MyComp />)
          .toBlob()
          .then((pdf) => {
            console.log(pdf);
            alink.download = `packingslip${row.id}.pdf`;
            alink.click();
          });
      }

      // window.open(`profile/user/${row.id}/orderdetails/packing-slip`, "_blank")
    );
  };

  return (
    <>
      {/* <div className='w-100 h-100 p-2 rounded-3'> */}
      <div className='p-3'>
        <div>
          <Container>
            <Row md={4}>
              <Col>
                <Button onClick={sendEmail} variant='success' className='mb-3'>
                  Notify Out for Delivery
                </Button>
              </Col>
              <Col>
                <Button
                  onClick={handlePrintPackingSlips}
                  variant='success'
                  className='mb-3'
                >
                  Print Packing Slips
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
              selectRow={selectRow}
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
            onClick={handlePrintPackingSlips}
            variant='primary'
            type='submit'
            className='printer-btn shadow col-6'
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
