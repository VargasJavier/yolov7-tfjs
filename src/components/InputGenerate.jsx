import React, { useState } from 'react'
import { splitWords } from '../utils/splitWords'
import { generateText } from '../utils/chatGPT'

const InputGenerate = ({handleChange, input, handleChangeShowVideo}) => {

  console.log('INPUT', input)

  const [result, setResult] = useState('')
  const [isLoading, setLoading] = useState(false)
  
  const handleWords = () => {
    const messageArray = input.trim().split(' ')
    console.log(messageArray);
    const messageUnrepeatArray = splitWords(messageArray)
    console.log(messageUnrepeatArray)
    return messageUnrepeatArray
  }

  const handleButton = async () => {
    handleChangeShowVideo()
    console.log('ENTRO A BUTTON');
    const content = handleWords()
    const messageContent = "[" + content.join(", ") + "]";
    console.log(messageContent);
    try {
      setLoading(true)
      const response = await generateText(messageContent)
      console.log(response);
      const isPhrase = response.includes(':')
      setResult(isPhrase ? response.split(':')[1] : response)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log('Error al generar el texto del input', error)
    }
  }

  const handleReset = () => {
    handleChangeShowVideo(true)
    setResult('')
  }

  return (
    <div>
      <div className="p-4 w-full">
        <label htmlFor="text" className=''>
          Palabras a traducir
          <input
            id='text'
            onChange={(e) => handleChange(e)}
            value={input}
            className='class="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out'
            type="text" />
        </label>
        <button className="flex w-auto mx-auto mt-8 mb-4 text-white bg-blue-500 border-0 py-2 px-8 focus:outline-none hover:bg-blue-600 rounded text-lg button" disabled={!input} onClick={handleButton}>Generar</button>
        <button className="flex w-auto mx-auto mt-8 mb-4 text-white bg-blue-500 border-0 py-2 px-8 focus:outline-none hover:bg-blue-600 rounded text-lg button" onClick={handleReset}>Reset</button>
        {
          (result.length || isLoading)
          ? isLoading ? (
            <p>Cargando...</p>
          ) : (
            <p className='text-center'>{result}</p>
          ) 
          : null
        }
      </div>
    </div>
  )
}

export default InputGenerate