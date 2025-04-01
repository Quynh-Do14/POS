import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { Test } from './components/Test'
import { ToastContainer } from 'react-toastify'
import { ProductList } from './components/ProductList'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom' // Đã thêm import
import SimpleAutoSuggest from './components/SuggestProduct'
import { SupplierList } from './components/Supplier'
import { UnitList } from './components/Unit'

function App () {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Test />} />
        <Route path='/product' element={<ProductList />} />
        <Route path='/suplier' element={<SupplierList />} />
        <Route path='/unit' element={<UnitList />} />

        <Route path='/test' element={<SimpleAutoSuggest />} />
      </Routes>
      <ToastContainer
        position='bottom-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='colored'
      />
    </Router>
  )
}

export default App
