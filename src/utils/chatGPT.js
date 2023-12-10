import axios from "axios";

export async function generateText(contentWords) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: `Hola, amigo. Ayúdame a darle semántica y coherencia a las palabras que se encuentran contenidas en al siguiente arreglo, son palabras traducidas de una persona sorda a través del lenguaje de señas, necesito que solo me respondas la frase generada a través de las palabras: ${contentWords}. Por favor solo responde la frase obtenida ya que lo imprimiré en el front directamente.`
          }
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
          'Content-Type': 'application/json',
          'Openai-Organization': import.meta.env.VITE_ORGANIZATION,
        },
      }
    );

    const generatedText = await response.data.choices[0].message.content;
    console.log(generatedText);
    return generatedText
  } catch (error) {
    console.error('Error al generar texto:', error);
  }
}