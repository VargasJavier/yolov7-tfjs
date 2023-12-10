// Ejemplo de código en React utilizando fetch para enviar un video al backend
export const uploadVideo = async (video) => {
  const formData = new FormData();
  formData.append('video_path', video);

  try {
    const response = await fetch('http://127.0.0.1:5000/video', {
      method: 'POST',
      body: formData,
    });
    const results = await response.json();
    // Maneja los resultados recibidos del backend
    console.log('results', results)
  } catch (error) {
    console.error('Error:', error);
  }
};
