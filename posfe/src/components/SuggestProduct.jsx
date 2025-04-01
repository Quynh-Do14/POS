import React, { useEffect, useState } from 'react'
import Autosuggest from 'react-autosuggest'
import { productApi } from '../api/product'

const getSuggestionValue = suggestion => suggestion.name

const renderSuggestion = suggestion => (
  <div className='px-4 py-2 cursor-pointer hover:bg-gray-100'>
    {suggestion.name}
  </div>
)

// main
const AutoSuggestExample = ({ onProductSelect }) => {
  const [inputValue, setInputValue] = useState('')
  const [suggestedItems, setSuggestedItems] = useState([])
  const [products, setProducts] = useState([])

  // Gọi API để lấy danh sách sản phẩm khi component được mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getAll(0, 100, '')

        setProducts(response?.data?.items)
        console.log(response?.data?.items)
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error)
      }
    }

    fetchProducts()
  }, [])

  // Hàm lọc sản phẩm dựa trên giá trị nhập vào
  const getSuggestions = value => {
    if (!value.trim()) return []
    const inputValue = value.trim().toLowerCase()
    return products.filter(product =>
      product.name.toLowerCase().includes(inputValue)
    )
  }

  const onSuggestionsFetchRequested = ({ value }) => {
    const filteredSuggestions = getSuggestions(value)
    // console.log("Gợi ý:", filteredSuggestions);
    setSuggestedItems(filteredSuggestions)
  }

  const onSuggestionsClearRequested = () => {
    setSuggestedItems([])
  }

  const onChange = (_, { newValue }) => {
    setInputValue(newValue)
  }

  // Xử lý khi người dùng chọn một sản phẩm
  const onSuggestionSelected = (event, { suggestion }) => {
    console.log('Sản phẩm được chọn:', suggestion)
    if (onProductSelect) {
      onProductSelect(suggestion)
    }
    setInputValue('')
  }

  const inputProps = {
    placeholder: 'Thêm sản phẩm',
    value: inputValue,
    onChange,
    className:
      'w-full px-4 py-2.5  rounded-md focus:outline focus:outline-blue-500'
  }

  return (
    <div className='w-full max-w-sm p-1  rounded-xl shadow-sm'>
      <Autosuggest
        suggestions={suggestedItems}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={inputProps}
        theme={{
          container: 'relative w-full',
          input:
            'w-full px-4  text-gray-700 bg-gray-100 rounded-md focus:outline-none',
          suggestionsContainer:
            'absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 z-10',
          suggestionsList: 'list-none m-0 p-0',
          suggestion:
            'px-4 py-2 text-gray-700 cursor-pointer hover:bg-blue-100 transition',
          suggestionHighlighted: 'bg-blue-500'
        }}
      />
    </div>
  )
}

export default AutoSuggestExample
