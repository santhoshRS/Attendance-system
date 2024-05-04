import React, { useState } from "react";
import QrReader from "react-qr-reader";
import '../index.css'

const Scan = () => {
  const [result, setResult] = useState("No result");
  let handleScan = data => {
    if (data) {
      setResult(data);
    }
  };

  let handleError = err => {
    alert(err);
  };


  return (
    <div>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: "250px" }}
        facingMode="environment"
      />
      <p>{result}</p>
    </div>
  );
}

export default Scan;