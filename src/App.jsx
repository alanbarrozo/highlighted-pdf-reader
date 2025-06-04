import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.entry";

export default function App() {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [wpm, setWpm] = useState(200);

  useEffect(() => {
    const url = "https://www.africau.edu/images/default/sample.pdf";

    const renderPDF = async () => {
      const pdf = await pdfjsLib.getDocument(url).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      const textContent = await page.getTextContent();
      const words = textContent.items;

      let i = 0;
      const interval = (60 * 1000) / wpm;

      const highlight = () => {
        if (i >= words.length) return;

        const word = words[i];
        context.fillStyle = "rgba(255, 255, 0, 0.5)";
        const tx = pdfjsLib.Util.transform(
          viewport.transform,
          word.transform
        );
        context.fillRect(tx[4], tx[5] - word.height, word.width, word.height);

        i++;
        setTimeout(highlight, interval);
      };

      highlight();
      setLoading(false);
    };

    renderPDF();
  }, [wpm]);

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>Leitor com Destaque de Palavras</h2>
      <label>Velocidade (WPM): {wpm}</label>
      <input
        type="range"
        min="50"
        max="600"
        step="10"
        value={wpm}
        onChange={(e) => setWpm(Number(e.target.value))}
      />
      <br />
      {loading && <p>Carregando PDF...</p>}
      <canvas ref={canvasRef} style={{ border: "1px solid #ccc", marginTop: 20 }} />
    </div>
  );
}
