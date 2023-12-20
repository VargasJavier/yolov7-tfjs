import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "./components/loader";
import { Webcam } from "./utils/webcam";
import { renderBoxes } from "./utils/renderBox";
import { non_max_suppression } from "./utils/nonMaxSuppression";
import "./style/App.css";
import InputGenerate from "./components/InputGenerate";

/**
 * Function to detect image.
 * @param {HTMLCanvasElement} canvasRef canvas reference
 */

function shortenedCol(arrayofarray, indexlist) {
  return arrayofarray.map(function (array) {
      return indexlist.map(function (idx) {
          return array[idx];
      });
  });
}

const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const [recognizedWords, setRecognizedWords] = useState([])
  const [input, setInput] = useState('')
  const [showVideo, setShowVideo] = useState(true)
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const webcam = new Webcam();
  // configs
  const modelName = "yolov7";
  const threshold = 0.80;
  /**
   * Function to detect every frame loaded from webcam in video tag.
   * @param {tf.GraphModel} model loaded YOLOv7 tensorflow.js model
   */

  const handleRecognizedWords = (word) => {
    setRecognizedWords((prevRecognizedWords) => {
      const isInclude = prevRecognizedWords.includes(word);
  
      if (!isInclude) {
        const newRecognizedWords = [...prevRecognizedWords, word];
        setInput(newRecognizedWords.join(' '));
        return newRecognizedWords;
      }

      return prevRecognizedWords;
    });
  }

  const handleChangeShowVideo = (isReset = false) => {
    if (isReset) setInput('')
    setShowVideo(!showVideo)
  }

  const handleInputGenerate = (e) => {
    setInput(e.target.value)
  }

  const detectFrame = async (model) => {
    const model_dim = [640, 640];
    tf.engine().startScope();
    const input = tf.tidy(() => {
      const img = tf.image
                  .resizeBilinear(tf.browser.fromPixels(videoRef.current), model_dim)
                  .div(255.0)
                  .transpose([2, 0, 1])
                  .expandDims(0);
      return img
    });

    await model.executeAsync(input).then((res) => {

      res = res.arraySync()[0];

      var detections = non_max_suppression(res);
      const boxes =  shortenedCol(detections, [0,1,2,3]);
      const scores = shortenedCol(detections, [4]);
      const class_detect = shortenedCol(detections, [5]);

      renderBoxes(canvasRef, threshold, boxes, scores, class_detect, handleRecognizedWords);
      tf.dispose(res);
    });

    requestAnimationFrame(() => detectFrame(model)); // get another frame
    tf.engine().endScope();
  };

  useEffect(() => {
    tf.loadGraphModel(`${window.location.origin}/${modelName}_web_model/model.json`, {
      onProgress: (fractions) => {
        setLoading({ loading: true, progress: fractions });
      },
    }).then(async (yolov7) => {
      // Warmup the model before using real data.
      const dummyInput = tf.ones(yolov7.inputs[0].shape);
      await yolov7.executeAsync(dummyInput).then((warmupResult) => {
        tf.dispose(warmupResult);
        tf.dispose(dummyInput);

        setLoading({ loading: false, progress: 1 });
        webcam.open(videoRef, () => detectFrame(yolov7));
      });
    });
  }, [showVideo]);
  console.warn = () => {};

  useEffect(() => {
    console.log('PROCESS', import.meta.env.VITE_API_KEY)
    console.log('RECOGNIZED CHANGE', recognizedWords)
  }, [recognizedWords])

  return (
    <div className="App">
      {
        showVideo ? (
          <div className="container content">
            <h2>Traductor de lenguaje de señas a texto</h2>
            {loading.loading ? (
              <Loader>Loading model... {(loading.progress * 100).toFixed(2)}%</Loader>
            ) : (
              <p> </p>
            )}
            <div className="content">
              <video autoPlay playsInline muted ref={videoRef} id="frame"
              />
              <canvas width={640} height={640} ref={canvasRef}/>
            </div>
          </div>
        ) : null
      }
      <InputGenerate
        handleChangeShowVideo={handleChangeShowVideo}
        handleChange={handleInputGenerate}
        input={input}/>
      {
        !showVideo ? (
          <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSd5gnpMcdZsDHaNXqaBRG5vB0ap1F9Z8GMjDGiDEQPQm1j_iA/viewform?embedded=true" width="640" height="720" frameborder="0" marginheight="0" marginwidth="0">Cargando…</iframe>
        ) : null
      }
    </div>
  );
};

export default App;
