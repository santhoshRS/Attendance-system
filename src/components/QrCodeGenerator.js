import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import * as htmlToImage from "html-to-image";
import '../index.css'


const QrCodeGenerator = () => {
    const [url, setUrl] = useState("");
    const [qrIsVisible, setQrIsVisible] = useState(false);

    const handleQrCodeGenerator = () => {
        if (!url) {
            return;
        }

        setQrIsVisible(true);
    };

    const qrCodeRef = useRef(null);

    const downloadQRCode = () => {
        htmlToImage
            .toPng(qrCodeRef.current)
            .then(function (dataUrl) {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = "qr-code.png";
                //  link.click();
                const byteCharacters = atob(dataUrl.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/jpeg' }); // Adjust type accordingly

            })
            .catch(function (error) {
                console.error("Error generating QR code:", error);
            });
    };

    return (
        <div className="qrcode__container">
            <h1>QR Code Generator</h1>
            <div className="qrcode__container--parent">
                <div className="qrcode__input">
                    <input
                        type="text"
                        placeholder="Enter a URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />

                    <button onClick={handleQrCodeGenerator}>Generate QR Code</button>
                </div>

                {qrIsVisible && (
                    <div className="qrcode__download">
                        <div className="qrcode__image" ref={qrCodeRef}>
                            <QRCode value={url} size={300} />
                        </div>
                        <button onClick={downloadQRCode}>Download QR Code</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default QrCodeGenerator;