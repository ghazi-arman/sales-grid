import { useState, useCallback, useEffect } from 'react';
import { Column, Table } from 'react-virtualized';
import TextField from '@material-ui/core/TextField';
import './App.css';
import 'react-virtualized/styles.css';
const axios = require('axios');
require('dotenv').config();

function App() {
  const [sales, setSales] = useState([]);
  const [visibleSales, setVisibleSales] = useState([]);
  const [query, setQuery] = useState("");

  const loadSales = useCallback(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/getSalesByRow`, {
      params: {
        startRow: 0,
        endRow: 10000
      }
    }).then(function (response) {
      const salesArray = Object.keys(response.data).map((key) => response.data[key]);
      setSales(salesArray);
      setVisibleSales(salesArray);
    });
  }, []);

  const searchTable = useCallback((query) => {
    const results = sales.filter((sale) => 
      Object.keys(sale).some((property) => String(sale[property]).toLowerCase().includes(query.toLowerCase()))
    );
    setVisibleSales(results);
  }, [sales]);

  const handleSearch = (event) => {
    setQuery(event.target.value);
    searchTable(event.target.value.toLowerCase());
  }

  const rowStyler = (index) => {
    if (Math.abs(index.index % 2) === 1) {
      return {
        backgroundColor: '#d3d3d3'
      }
    }
  }

  const sortTable = ({ sortBy }) => {
    let sortedSales;
    if (sortBy === 'OrderDate'  || sortBy === 'shipDate') {
      sortedSales = [...visibleSales].sort((a, b) => (new Date(a[sortBy]) > new Date(b[sortBy])) ? 1 : -1);
    } else if (sortBy === 'OrderID' || sortBy === 'TotalCost') {
      sortedSales = [...visibleSales].sort((a, b) => (parseFloat(a[sortBy]) > parseFloat(b[sortBy])) ? 1 : -1);
    } else {
      sortedSales = [...visibleSales].sort((a, b) => (a[sortBy] > b[sortBy]) ? 1 : -1);
    }
    setVisibleSales(sortedSales);
  }

  useEffect(() => {
    if (sales.length === 0) {
      loadSales();
    }
  }, [loadSales, sales]);
 
  return (
    <div className="App">
      <div className="SearchDiv">
        <TextField
          style={{ margin: 20 }}
          label="Search"
          value={query}
          onChange={handleSearch}
        />
      </div>
      <Table
        width={window.innerWidth}
        height={window.innerHeight}
        headerHeight={30}
        rowHeight={30}
        rowCount={visibleSales.length}
        rowGetter={({index}) => visibleSales[index]}
        rowStyle={rowStyler}
        sort={sortTable}>
        <Column width={window.innerWidth / 6} label="Order ID" dataKey="OrderID" />
        <Column width={window.innerWidth / 6} label="Country" dataKey="Country" />
        <Column width={window.innerWidth / 6} label="Item Type" dataKey="ItemType" />
        <Column width={window.innerWidth / 6} label="Order Date" dataKey="OrderDate" />
        <Column width={window.innerWidth / 6} label="Ship Date" dataKey="ShipDate" />
        <Column width={window.innerWidth / 6} label="Total Cost" dataKey="TotalCost" />
      </Table>
    </div>
  );
}

export default App;
