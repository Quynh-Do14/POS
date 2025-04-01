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

registerAllModules()

export const Test = () => {
  const nagivate = useNavigate()
  const hotRef = useRef(null)
  const [data, setData] = useState(() => {
    const initialData = Array.from({ length: 14 }, () => Array(14).fill(''))
    initialData[0] = DEFAULT_HEADERS.concat(
      Array(14 - DEFAULT_HEADERS.length).fill('')
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
            item.quantity || '',
            Number(item.unitPrice) || 0,
            item.unit || '',
            Number(item.sellPrice) || 0,
            item.others?.['Ngày'] || getCurrDay(),
            item.others?.['Mã nhà cung cấp'] || '',
            item.others?.['Nhà cung cấp'] || '',
            item.others?.['Phần trăm'] || '',
            item.others?.['Địa chỉ'] || '',
            item.others?.['SĐT'] || '',
            item.batchNumber || '',
            item.expiryDate || ''
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
        newData[emptyRowIndex][2] = ''
        newData[emptyRowIndex][3] = ''
        newData[emptyRowIndex][4] = ''
        newData[emptyRowIndex][5] = ''
        newData[emptyRowIndex][6] = getCurrDay()
        newData[emptyRowIndex][7] = product?.supplierCode
        newData[emptyRowIndex][8] = product?.suplier
        newData[emptyRowIndex][9] = product?.percent
        newData[emptyRowIndex][10] = product?.address
        newData[emptyRowIndex][11] = product?.sdt
      } else {
        const newRow = Array(newData[0].length).fill('')

        newRow[0] = generateItemCode()
        newRow[1] = product?.name
        newRow[2] = ''
        newRow[3] = ''
        newRow[4] = ''
        newRow[5] = ''
        newRow[6] = getCurrDay()
        newRow[7] = product?.supplierCode
        newRow[8] = product?.suplier
        newRow[9] = product?.percent
        newRow[10] = product?.address
        newRow[11] = product?.sdt

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
      console.log('newData[row]', newData[row])
      console.log('col', col)

      if (
        newValue &&
        (col == 5 || col == 6 || col == 7 || col == 5) &&
        !newData[row][5] &&
        !newData[row][8]
      ) {
        newData[row][0] = generateItemCode() // Gán mã hàng hóa nếu cột 0 đang trống
      }

      if (newValue && col !== 0 && !newData[row][5]) {
        newData[row][5] = newData[row][2] * Number(newData[row][3])
      }
      if (newValue && col !== 0 && !newData[row][8]) {
        newData[row][6] = getCurrDay() // Gán ngày/tháng/năm hiện tại vào cột 8
      }

      // tự động thêm row khi hết
      if (row === newData.length - 1 && newValue !== '') {
        newData.push(Array(newData[0].length).fill('')) // Thêm hàng mới rỗng
      }
    })
    setData(updateDataWithTotal(newData))

    const suplierNameIndex = data[0]?.indexOf('Nhà cung cấp')
    const addressIndex = data[0]?.indexOf('Địa chỉ')
    const phoneIndex = data[0]?.indexOf('SĐT')
    const supplierCodeIndex = data[0]?.indexOf('Mã nhà cung cấp')
    const percentIndex = data[0]?.indexOf('Phần trăm')
    changes.forEach(([row, col, oldValue, newValue]) => {
      if (col === suplierNameIndex) {
        const matchedSupplier = listSuplier.find(sup => sup.name === newValue)
        if (matchedSupplier) {
          newData[row][addressIndex] = matchedSupplier.address || ''
          newData[row][phoneIndex] = matchedSupplier.sdt || ''
          newData[row][percentIndex] = matchedSupplier.percent || ''
          newData[row][supplierCodeIndex] = matchedSupplier.supplierCode || ''
        }
      }
    })
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
    const sellPriceIndex = headerRow.indexOf('Giá bán')
    const skuIndex =
      headerRow.indexOf('Mã hàng hóa') !== -1
        ? headerRow.indexOf('Mã hàng hóa')
        : 0

    if (
      slIndex === -1 ||
      sellPriceIndex === -1 ||
      supplierNameIndex === -1 ||
      unitPriceIndex === -1
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

      if (!isNaN(sl) && !isNaN(unitPrice)) {
        const sellPrice = sl * unitPrice
        row[sellPriceIndex] = sellPrice
        total += sellPrice

        // Lấy tên nhà cung cấp và tìm mã tương ứng từ listSuplier
        const supplierName = row[supplierNameIndex]
        const matchedSupplier = listSuplier.find(
          sup => sup.name === supplierName
        )
        const supplierCode = matchedSupplier?.supplierCode

        if (!row[skuIndex] && supplierCode && sellPrice) {
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

  const dvtIndex = data[0]?.indexOf('ĐVT')
  const suplierIndex = data[0]?.indexOf('Nhà cung cấp')

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>POS Demo</h1>
      <div className='flex flex-col gap-2 mb-3'>
        <div className='flex flex-col justify-between gap-2'>
          <div className='flex gap-2 '>
            <input
              type='text'
              className='border p-2 mb-2'
              placeholder='Nhập từ khóa tìm kiếm...'
              value={searchQuery}
              onChange={handleSearch}
            />
            <button
              onClick={addRow}
              className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium transition duration-200'
            >
              Thêm Hàng
            </button>
            <button
              onClick={addColumn}
              className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium transition duration-200'
            >
              Thêm Cột
            </button>
            <AutoSuggestExample onProductSelect={handleProductSelect} />
          </div>

          <div className='flex gap-2'>
            {/* Button Lưu */}
            <button
              onClick={handleExport}
              className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium transition duration-200'
            >
              Xuất File
            </button>
            {/* Button Mở file */}
            <label className='inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-md shadow hover:bg-blue-600 cursor-pointer transition duration-200'>
              Mở file
              <input
                type='file'
                accept='.xlsx, .xls'
                className='hidden'
                onChange={handleFileUpload}
              />
            </label>

            <button
              onClick={() => {
                nagivate('/product')
              }}
              className='bg-blue-500 text-white p-2 rounded font-medium transition duration-200'
            >
              Danh Sách Hàng
            </button>
            <button
              onClick={() => {
                nagivate('/suplier')
              }}
              className='bg-blue-500 text-white p-2 rounded font-medium transition duration-200'
            >
              Danh Sách Nhà Cung Cấp
            </button>
            <button
              onClick={() => {
                nagivate('/unit')
              }}
              className='bg-blue-500 text-white p-2 rounded font-medium transition duration-200'
            >
              Danh Sách Đơn vị tính
            </button>
            {/* Button Tải file mẫu */}
            <button
              onClick={formPos365}
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium transition duration-200'
            >
              Mẫu POS365
            </button>

            <button
              onClick={() => setIsModalOpen(!isModalOpen)}
              className='bg-blue-500 text-white p-2 rounded font-medium transition duration-200'
            >
              Tuỳ chọn
            </button>
            {/* <button
              onClick={handleReset}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Reset
            </button> */}
          </div>
        </div>
      </div>

      <div className='overflow-auto max-h-[550px] border border-gray-300'>
        <HotTable
          ref={hotRef}
          data={data}
          rowHeaders={true}
          // colHeaders={true}
          width='100%'
          height='auto'
          autoWrapRow={true}
          autoWrapCol={true}
          // colWidths={120}
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
            if (row === 0) {
              cellProperties.className = 'custom-cell'
            }
            if (highlightedRows.has(row)) {
              cellProperties.className = 'highlight-search'
            }
            if (col === dvtIndex) {
              cellProperties.type = 'dropdown'
              cellProperties.source = listUnit.map(item => item.name)
              // [
              //   'Cái',
              //   'Chiếc',
              //   'Bộ',
              //   'Hộp',
              //   'Thùng',
              //   'Kg',
              //   'Gam',
              //   'Lít',
              //   'Chai',
              //   'Gói',
              //   'Túi',
              //   'Cuộn',
              //   'Cặp',
              //   'Vỉ',
              //   'Viên',
              //   'Ống',
              //   'Bao',
              //   'Tấm',
              //   'Tờ',
              //   'Thẻ',
              //   'Miếng'
              // ]
              cellProperties.strict = true // Chỉ cho chọn trong danh sách
              cellProperties.allowInvalid = false
            }
            if (col === suplierIndex) {
              cellProperties.type = 'dropdown'
              cellProperties.source = listSuplier.map(item => item.name)
              cellProperties.strict = true // Chỉ cho chọn trong danh sách
              cellProperties.allowInvalid = false
            }
            // Validation cho cột bắt buộc (cột 0, 1, 6)
            // if ([1, 6].includes(col)) {
            //   cellProperties.validator = function (value, callback) {
            //     if (!value || value.trim() === "") {
            //       callback(false); // Không hợp lệ
            //     } else {
            //       callback(true); // Hợp lệ
            //     }
            //   };
            // }
            // // Validation cho Số lượng (SL) - cột 2
            // if (col === 2) {
            //   cellProperties.validator = function (value, callback) {
            //     const numericValue = Number(value);
            //     if (isNaN(numericValue)) {
            //       callback(false); // Không phải số
            //     } else if (!Number.isInteger(numericValue)) {
            //       callback(false); // Không phải số nguyên
            //     } else if (numericValue <= 0) {
            //       callback(false); // Không phải số nguyên dương
            //     } else {
            //       callback(true); // Hợp lệ
            //     }
            //   };
            // }
            // // Validation cho Đơn giá & Giá bán - cột 3, 7
            // if ([3, 7].includes(col)) {
            //   cellProperties.validator = function (value, callback) {
            //     const numericValue = Number(value);
            //     if (isNaN(numericValue)) {
            //       callback(false); // Không phải số
            //     } else if (numericValue <= 0) {
            //       callback(false); // Không phải số dương
            //     } else {
            //       callback(true); // Hợp lệ
            //     }
            //   };
            // }
            // // Validation cho Hạn sử dụng - cột 5
            // if (col === 5) {
            //   cellProperties.validator = function (value, callback) {
            //     const regex = /^\d{2}\/\d{2}\/\d{4}$/; // Định dạng MM/DD/YYYY
            //     if (!regex.test(value)) {
            //       callback(false); // Không hợp lệ
            //     } else {
            //       callback(true); // Hợp lệ
            //     }
            //   };
            // }

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
      if ([0, 1, 6, 8].includes(col) && (!newValue || newValue.trim() === '')) {
        alert(`Cột ${col + 1} không được để trống!`)
        return true
      }

      // Kiểm tra Số lượng (SL) - phải là số nguyên dương
      if (col === 2) {
        const numericValue = Number(newValue)
        if (
          isNaN(numericValue) ||
          !Number.isInteger(numericValue) ||
          numericValue <= 0
        ) {
          alert(`Cột ${col + 1} phải là số nguyên dương!`)
          return true
        }
      }

      // Kiểm tra Đơn giá & Giá bán - phải là số dương
      if ([2, 3, 5].includes(col)) {
        const numericValue = Number(newValue)
        if (isNaN(numericValue) || numericValue <= 0) {
          alert(`Cột ${col + 1} phải là số dương!`)
          return true
        }
      }

      // Kiểm tra Hạn sử dụng - định dạng MM/DD/YYYY
      if (col === 6 && !/^\d{2}\/\d{2}\/\d{4}$/.test(newValue)) {
        alert(`Cột ${col + 1} phải có định dạng MM/DD/YYYY!`)
        return true
      }

      return false
    })

    if (hasError) return false
  }
}
