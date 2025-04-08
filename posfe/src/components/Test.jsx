import React, { useEffect, useRef, useState } from 'react'
import { HotColumn, HotTable } from '@handsontable/react'
import * as XLSX from 'xlsx'
import { checkApi } from '../api/check'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/styles/handsontable.css'
import 'handsontable/styles/ht-theme-main.css'
import './Test.css'
import { DEFAULT_HEADERS } from '../util/constant'
import { ExportModal } from './ExportModal'
import { toast } from 'react-toastify'
import { ProductList } from './ProductList'
import { useNavigate } from 'react-router-dom'
import AutoSuggestExample from './SuggestProduct'
import { suplierApi } from '../api/suplier'
import { useInfiniteQuery } from '@tanstack/react-query'
import { unitApi } from '../api/unit'
import { productApi } from '../api/product'

registerAllModules()

export const Test = () => {
  const navigate = useNavigate()
  const hotRef = useRef(null)
  const [data, setData] = useState(() => {
    const initialData = Array.from({ length: 10 }, () => Array(10).fill(''))
    initialData[0] = DEFAULT_HEADERS.concat(
      Array(10 - DEFAULT_HEADERS.length).fill('')
    )
    return initialData
  })
  const [headers, setHeaders] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedRows, setHighlightedRows] = useState(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOpenProduct, setIsOpenProduct] = useState(false)
  const [listSuplier, setSuplier] = useState([])
  const [listUnit, setListUnit] = useState([])
  const [listProduct, setListProduct] = useState([])

  const closeModal = () => setIsOpenProduct(!isOpenProduct)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await suplierApi.getAll(0, 100, '')
        const items = response?.data?.items || []
        setSuplier(items)
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error)
      }
    }
    const fetchProducts2 = async () => {
      try {
        const response = await unitApi.getAll(0, 100, '')
        const items = response?.data?.items || []
        setListUnit(items)
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error)
      }
    }
    const fetchProducts3 = async () => {
      try {
        const response = await productApi.getAll(0, 100, '')
        const items = response?.data?.items || []
        setListProduct(items)
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error)
      }
    }
    fetchProducts3()
    fetchProducts2()
    fetchProducts()
  }, [])

  const handleFileUpload = async e => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const response = await checkApi.checkFile(file)
      const jsonData = response.data || []

      //Chuyển đổi JSON thành mảng 2D
      // Tiêu đề
      let headers = [...DEFAULT_HEADERS]

      // Thêm các trường mới từ 'others' vào tiêu đề
      // if (jsonData.length > 0 && jsonData[0].others) {
      //   const otherFields = Object.keys(jsonData[0].others);
      //   headers = [...headers, ...otherFields];
      // }
      if (jsonData.length > 0 && jsonData[0].others) {
        const otherFields = Object.keys(jsonData[0].others).filter(
          key => key !== 'Ngày' && !headers.includes(key) // Tránh trùng lặp
        )
        headers = [...headers, ...otherFields]
      }
      // Chuyển đổi JSON thành mảng 2D
      const newData = [
        headers, // Hàng tiêu đềc
        ...jsonData.map(item => {
          const baseData = [
            item.sku || '',
            item.name || '',
            item.others?.['Mã nhà cung cấp'] || '',
            item.others?.['Nhà cung cấp'] || '',
            item.others?.['Phần trăm'] || '',
            item.quantity || '',
            Number(item.unitPrice) || 0,
            item.unit || '',
            Number(item.sellPrice) || 0,
            item.others?.['Ngày'] || getCurrDay()

            // item.others?.['Địa chỉ'] || '',
            // item.others?.['SĐT'] || '',
            // item.batchNumber || '',
            // item.expiryDate || ''
          ]

          // Thêm các trường mới từ 'others' vào dữ liệu
          if (item.others) {
            const otherValues = Object.entries(item.others)
              .filter(([key]) => key !== 'Ngày' && key !== '') // Lọc bỏ "Ngày"
              .map(([, value]) => value)
            return [...baseData, ...otherValues] // Chỉ thêm các giá trị còn lại
          }

          return baseData
        })
      ]
      updateDataWithTotal(newData)
      setData([...newData])
      setHeaders([...headers])
    } catch (error) {
      console.log('Upload failed: ' + error.response?.data || 'Server error')
      toast.warning('Upload failed: ' + error.response?.data || 'Server error')
    }
  }

  // chọn suggestt
  const handleProductSelect = product => {
    console.log('ID sản phẩm được chọn:', product)

    setData(prevData => {
      const newData = prevData.map(row => [...row])
      const emptyRowIndex = newData.findIndex(row =>
        row.every(cell => cell === '')
      )

      if (emptyRowIndex !== -1) {
        newData[emptyRowIndex][0] = generateItemCode()
        newData[emptyRowIndex][1] = product?.name
        newData[emptyRowIndex][2] = product?.supplierCode
        newData[emptyRowIndex][3] = product?.suplier
        newData[emptyRowIndex][4] = product?.percent
        newData[emptyRowIndex][5] = ''
        newData[emptyRowIndex][6] = ''
        newData[emptyRowIndex][7] = ''
        newData[emptyRowIndex][8] = ''
        newData[emptyRowIndex][9] = getCurrDay()
        // newData[emptyRowIndex][10] = product?.address
        // newData[emptyRowIndex][11] = product?.sdt
      } else {
        const newRow = Array(newData[0].length).fill('')

        newRow[0] = generateItemCode()
        newRow[1] = product?.name
        newRow[2] = product?.supplierCode
        newRow[3] = product?.suplier
        newRow[4] = product?.percent
        newRow[5] = ''
        newRow[6] = ''
        newRow[7] = ''
        newRow[8] = ''
        newRow[9] = getCurrDay()
        // newRow[10] = product?.address
        // newRow[11] = product?.sdt

        newData.push(newRow)
      }

      return updateDataWithTotal(newData)
    })
  }

  const formPos365 = () => {
    const newData = Array.from({ length: 10 }, () => Array(10).fill(''))
    newData[0] = DEFAULT_HEADERS.concat(Array(10 - headers.length).fill('')) // Đảm bảo độ dài hàng là 20
    setData(newData)
  }

  const handleSearch = e => {
    const query = e.target.value
    setSearchQuery(query)

    if (hotRef.current) {
      const hotInstance = hotRef.current.hotInstance
      const search = hotInstance.getPlugin('search')
      const searchResult = search.query(query)
      // console.log("Kết quả tìm kiếm:", searchResult);
      // row có kết quả tìm kiếm
      const matchedRows = new Set(searchResult.map(result => result.row))
      setHighlightedRows(matchedRows)
      hotInstance.render() // Cập nhật bảng sau khi tìm kiếm
    }
  }
  // const handleReset = () => {
  //   setData(Array.from({ length: 10 }, () => Array(10).fill("")));
  // };
  // Xuất dữ liệu từ bảng tính ra file Excel
  const handleExport = () => {
    // const jsonData = data.map((row) => row.map((cell) => cell.value || ""));
    const jsonData = data
    const worksheet = XLSX.utils.aoa_to_sheet(jsonData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, 'pos365.xlsx')
  }
  // Xuất dữ liệu từ bảng tính ra file Excel với tuỳ chọn file
  const handleExportDemo = selectedColumns => {
    const columnIndexes = selectedColumns.map(col => data[0].indexOf(col))
    const filteredData = data.map(row => columnIndexes.map(index => row[index]))
    const worksheet = XLSX.utils.aoa_to_sheet(filteredData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, 'pos365.xlsx')
  }

  const addRow = () => {
    if (!hotRef.current) return
    const hotInstance = hotRef.current.hotInstance
    hotInstance.alter('insert_row_below', hotInstance.countRows())
  }

  const addColumn = () => {
    if (!hotRef.current) return
    const hotInstance = hotRef.current.hotInstance
    if (!hotInstance) return

    hotInstance.alter('insert_col_end', hotInstance.countCols())
  }

  // tự động chèn mã hàng
  const handleAfterChange = (changes, source) => {
    if (!changes || source === 'loadData') return

    const newData = [...data]

    changes.forEach(([row, col, oldValue, newValue]) => {
      if (
        newValue &&
        (col == 5 || col == 6 || col == 7) &&
        !newData[row][5] &&
        !newData[row][6]
      ) {
        newData[row][0] = generateItemCode() // Gán mã hàng hóa nếu cột 0 đang trống
      }

      // ✅ Nếu sửa cột Số lượng thì nhân lên 1000
      if (col === 6 && !isNaN(newValue)) {
        newData[row][col] = parseFloat(newValue) * 1000 || 0
      }

      if (newValue && col !== 0 && !newData[row][8]) {
        newData[row][8] = newData[row][5] * Number(newData[row][6])
      }
      if (newValue && col !== 0) {
        newData[row][9] = getCurrDay() // Gán ngày/tháng/năm hiện tại vào cột 8
      }

      // tự động thêm row khi hết
      if (row === newData.length - 1 && newValue !== '') {
        newData.push(Array(newData[0].length).fill('')) // Thêm hàng mới rỗng
      }
    })

    const suplierNameIndex = data[0]?.indexOf('Nhà cung cấp')
    const addressIndex = data[0]?.indexOf('Địa chỉ')
    const phoneIndex = data[0]?.indexOf('SĐT')
    const supplierCodeIndex = data[0]?.indexOf('Mã nhà cung cấp')
    const percentIndex = data[0]?.indexOf('Phần trăm')
    changes.forEach(([row, col, oldValue, newValue]) => {
      if (col === suplierNameIndex) {
        const matchedSupplier = listSuplier.find(sup => sup.name === newValue)
        if (matchedSupplier) {
          //   newData[row][addressIndex] = matchedSupplier.address || ''
          //   newData[row][phoneIndex] = matchedSupplier.sdt || ''
          newData[row][percentIndex] = matchedSupplier.percent || ''
          newData[row][supplierCodeIndex] = matchedSupplier.supplierCode || ''
        }
      }
    })
    setData(updateDataWithTotal(newData))
  }

  const generateItemCode = (supplierCode, price) => {
    if (supplierCode && price) {
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      const month = String(now.getMonth() + 1).padStart(2, '0') // Thêm số 0 nếu cần
      const day = String(now.getDate()).padStart(2, '0')
      return `${supplierCode}${day}${month}${year}${price}`
    }
    return null
  }
  const getCurrDay = () => {
    const currentDate = new Date()
    const day = currentDate.getDate()
    const month = currentDate.getMonth() + 1 // Tháng bắt đầu từ 0 nên cần +1
    const year = currentDate.getFullYear()

    // Định dạng ngày/tháng/năm theo ý muốn, ví dụ: "dd/mm/yyyy"
    return `${day < 10 ? '0' + day : day}/${
      month < 10 ? '0' + month : month
    }/${year}`
  }

  const generateItemCodeAuto = (supplierCode, price) => {
    if (!supplierCode || !price) return ''
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${supplierCode}${day}${month}${year}${price}`
  }

  // Hàm tính lại tổng tiền và thêm dòng "Tổng tiền"
  const updateDataWithTotal = rawData => {
    const clonedData = rawData.slice()
    const headerRow = clonedData[0]

    const slIndex = headerRow.indexOf('SL')
    const unitPriceIndex = headerRow.indexOf('Đơn giá')
    const supplierNameIndex = headerRow.indexOf('Nhà cung cấp')
    const percentIndex = headerRow.indexOf('Phần trăm')
    const sellPriceIndex = headerRow.indexOf('Giá bán')
    const skuIndex =
      headerRow.indexOf('Mã hàng hóa') !== -1
        ? headerRow.indexOf('Mã hàng hóa')
        : 0

    if (
      slIndex === -1 ||
      sellPriceIndex === -1 ||
      supplierNameIndex === -1 ||
      unitPriceIndex === -1 ||
      percentIndex === -1
    ) {
      return clonedData
    }

    // Xoá dòng tổng nếu có
    const lastRow = clonedData[clonedData.length - 1]
    if (lastRow && lastRow[sellPriceIndex - 1] === 'Tổng tiền') {
      clonedData.pop()
    }

    let total = 0

    for (let i = 1; i < clonedData.length; i++) {
      const row = clonedData[i]
      const sl = parseFloat(row[slIndex])
      const unitPrice = parseFloat(row[unitPriceIndex])

      const supplierName = row[supplierNameIndex]
      const matchedSupplier = listSuplier.find(sup => sup.name === supplierName)
      const percent = matchedSupplier?.percent
      if (!isNaN(sl) && !isNaN(unitPrice) && !isNaN(percent)) {
        const discount = (percent * unitPrice * sl) / 100
        const sellPrice = sl * unitPrice + discount
        row[sellPriceIndex] = sellPrice
        total += sellPrice

        // Lấy tên nhà cung cấp và tìm mã tương ứng từ listSuplier

        const supplierCode = matchedSupplier?.supplierCode
        if (supplierCode && sellPrice) {
          row[skuIndex] = generateItemCodeAuto(supplierCode, sellPrice)
        }
      }
    }

    // Thêm dòng tổng
    const totalRow = new Array(headerRow.length).fill('')
    totalRow[sellPriceIndex - 1] = 'Tổng tiền'
    totalRow[sellPriceIndex] = total

    clonedData.push(totalRow)

    return clonedData
  }

  const productNameIndex = data[0]?.indexOf('Tên hàng hóa')
  const dvtIndex = data[0]?.indexOf('ĐVT')
  const suplierIndex = data[0]?.indexOf('Nhà cung cấp')

  return (
    <div className='p-8 h-[100vh] bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100'>
      <h1 className='text-3xl font-semibold mb-6 text-gray-800 text-center'>
        POS Management
      </h1>

      <div className='flex flex-col gap-6 mb-8'>
        <div className='flex flex-col gap-6'>
          <div className='flex gap-6'>
            <input
              type='text'
              className='w-1/3 p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white'
              placeholder='Nhập từ khóa tìm kiếm...'
              value={searchQuery}
              onChange={handleSearch}
            />
            <button
              onClick={addRow}
              className='px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all duration-300 '
            >
              Thêm Hàng
            </button>
            <button
              onClick={addColumn}
              className='px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-all duration-300'
            >
              Thêm Cột
            </button>
            <AutoSuggestExample onProductSelect={handleProductSelect} />
          </div>

          <div className='flex gap-6'>
            {/* Button Lưu */}
            <button
              onClick={handleExport}
              className='px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all duration-300'
            >
              Xuất File
            </button>

            {/* Button Mở file */}
            <label className='inline-flex items-center gap-3 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg shadow hover:bg-gray-700 cursor-pointer transition-all duration-300'>
              Mở file
              <input
                type='file'
                accept='.xlsx, .xls'
                className='hidden'
                onChange={handleFileUpload}
              />
            </label>

            <button
              onClick={() => navigate('/product')}
              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-300'
            >
              Danh Sách Hàng
            </button>
            <button
              onClick={() => navigate('/suplier')}
              className='px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-all duration-300'
            >
              Danh Sách Nhà Cung Cấp
            </button>
            <button
              onClick={() => navigate('/unit')}
              className='px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-all duration-300'
            >
              Danh Sách Đơn vị tính
            </button>

            {/* Button Tải file mẫu */}
            <button
              onClick={formPos365}
              className='px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium transition-all duration-300'
            >
              Mẫu POS365
            </button>

            {/* Button Tuỳ chọn */}
            <button
              onClick={() => setIsModalOpen(!isModalOpen)}
              className='px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium transition-all duration-300'
            >
              Tuỳ chọn
            </button>
          </div>
        </div>
      </div>

      <div className='overflow-auto p-3 border border-gray-300 rounded-md shadow-lg '>
        <HotTable
          ref={hotRef}
          data={data}
          rowHeaders={true}
          width='100%'
          height='auto'
          autoWrapRow={true}
          autoWrapCol={true}
          manualColumnResize={true}
          search={true}
          manualRowResize={true}
          allowInsertColumn={true}
          contextMenu={contextMenuSettings}
          className='custom-table'
          beforeChange={handleBeforeChange}
          afterChange={handleAfterChange}
          cells={(row, col) => {
            const cellProperties = {}

            // Header row background color (blueish tone)
            if (row === 0) {
              cellProperties.className = 'custom-cell'
            }

            if (highlightedRows.has(row)) {
              cellProperties.className = 'highlight-search bg-yellow-100'
            }
            if (col === productNameIndex) {
              cellProperties.type = 'dropdown'
              cellProperties.source = listProduct.map(item => item.name)
              cellProperties.strict = true
              cellProperties.allowInvalid = false
            }

            // Dropdown for Unit
            if (col === dvtIndex) {
              cellProperties.type = 'dropdown'
              cellProperties.source = listUnit.map(item => item.name)
              cellProperties.strict = true
              cellProperties.allowInvalid = false
            }

            // Dropdown for Supplier
            if (col === suplierIndex) {
              cellProperties.type = 'dropdown'
              cellProperties.source = listSuplier.map(item => item.name)
              cellProperties.strict = true
              cellProperties.allowInvalid = false
            }

            return cellProperties
          }}
          afterValidate={(isValid, value, row, col, validationResult) => {
            if (!isValid) {
              console.log(
                `Giá trị không hợp lệ tại hàng ${row}, cột ${col}: ${value}`
              )
              alert(
                `Giá trị không hợp lệ tại hàng ${row}, cột ${col}: ${value}`
              )
            }
          }}
          licenseKey='non-commercial-and-evaluation'
        />
      </div>

      {isModalOpen && (
        <ExportModal
          columns={data[0]}
          onExport={handleExportDemo}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isOpenProduct && (
        <ProductList isOpen={isOpenProduct} onClose={closeModal} />
      )}
    </div>
  )
}

const contextMenuSettings = {
  //   callback(key, selection, clickEvent) {
  //     console.log(key, selection, clickEvent);
  //   },
  items: {
    row_above: {
      disabled () {
        // `disabled` can be a boolean or a function
        // Disable option when first row was clicked
        return this.getSelectedLast()?.[0] === 0 // `this` === hot
      },
      name: 'Thêm hàng trên '
    },
    row_below: {
      name: 'Thêm hàng dưới '
    },
    col_left: {
      name: 'Thêm cột trái '
    },
    col_right: {
      name: 'Thêm cột phải '
    },
    clear_column: {
      name: 'Xoá dữ liệu cột '
    },
    remove_row: {
      name: 'Xoá hàng '
    },
    remove_col: {
      name: 'Xoá cột '
    }
  }
}

const handleBeforeChange = (changes, source) => {
  if (source === 'edit') {
    const hasError = changes.some(([row, col, oldValue, newValue]) => {
      // Kiểm tra giá trị rỗng ở các cột bắt buộc
      if ([1, 3, 9].includes(col) && (!newValue || newValue.trim() === '')) {
        alert(`Cột ${col + 1} không được để trống!`)
        return true
      }

      // Kiểm tra Đơn giá & Giá bán - phải là số dương nhưng không yêu cầu phải nhập
      if ([5, 6, 8].includes(col)) {
        const numericValue = Number(newValue)
        if (newValue && (isNaN(numericValue) || numericValue <= 0)) {
          alert(`Cột ${col + 1} phải là số dương!`)
          return true
        }
      }

      // Kiểm tra Hạn sử dụng - định dạng MM/DD/YYYY
      if (col === 9 && !/^\d{2}\/\d{2}\/\d{4}$/.test(newValue)) {
        alert(`Cột ${col + 1} phải có định dạng MM/DD/YYYY!`)
        return true
      }

      return false
    })

    if (hasError) return false
  }
}
