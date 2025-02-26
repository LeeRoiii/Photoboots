import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, Download, RefreshCw, Sparkles, X, Trash2, ZoomIn, ZoomOut, Edit, Image } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const PhotoBooth: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [images, setImages] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [flashMode, setFlashMode] = useState<boolean>(false);
  const [numberOfShots, setNumberOfShots] = useState<number>(1);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [borderText, setBorderText] = useState<string>("Instax Photo");
  const [finalImage, setFinalImage] = useState<string | null>(null);

  useEffect(() => {
    const savedImages = localStorage.getItem("capturedImages");
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("capturedImages", JSON.stringify(images));
  }, [images]);

  const capture = async (): Promise<void> => {
    if (webcamRef.current && !isCapturing) {
      setIsCapturing(true);

      for (let i = 0; i < numberOfShots; i++) {
        if (flashMode) {
          const flashElement = document.getElementById("camera-flash");
          if (flashElement) {
            flashElement.classList.add("flash-active");
            setTimeout(() => flashElement.classList.remove("flash-active"), 500);
          }
        }

        for (let j = 3; j > 0; j--) {
          setCountdown(j);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          setImages((prev) => [...prev, imageSrc]);
          toast.success(`Photo ${i + 1} captured!`);
        }

        setCountdown(null);
        if (i < numberOfShots - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      setIsCapturing(false);
    }
  };

  const handleSelectImage = (img: string): void => {
    setSelectedImages((prev) =>
      prev.includes(img)
        ? prev.filter((image) => image !== img)
        : prev.length < 3
        ? [...prev, img]
        : prev
    );
  };

  const applyBorder = (): void => {
    if (selectedImages.length === 3) {
      setFinalImage(selectedImages.join("|")); // Placeholder for merging images logic
    } else {
      toast.error("Please select exactly 3 images.");
    }
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white font-poppins">
      <Toaster position="bottom-center" />

      <div className="w-full max-w-6xl flex flex-col sm:flex-row gap-6 sm:gap-8">
        <div className="w-full sm:w-1/2 relative">
          <div className="relative w-full h-[300px] sm:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-800/50">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/png"
              videoConstraints={{ facingMode: cameraFacing }}
              className="w-full h-full object-cover"
            />
          </div>
          <button onClick={capture} disabled={isCapturing} className="mt-4 p-3 bg-blue-600 rounded-lg">Capture</button>
        </div>

        <div className="w-full sm:w-1/2">
          <h2 className="text-xl font-semibold text-white mb-4">Captured Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((img, index) => (
              <div key={index} className="cursor-pointer" onClick={() => handleSelectImage(img)}>
                <img src={img} alt="Captured" className={`w-32 h-32 object-cover rounded-lg ${selectedImages.includes(img) ? 'border-4 border-green-500' : ''}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedImages.length === 3 && (
        <button onClick={applyBorder} className="mt-4 px-6 py-3 bg-green-600 rounded-lg">Apply Instax Border</button>
      )}

      {finalImage && (
        <div className="mt-4 relative w-64 h-80 bg-white rounded-lg shadow-lg p-4 flex flex-col items-center justify-center">
          <img src={finalImage} alt="With Border" className="w-full h-48 object-cover rounded-lg" />
          <div className="mt-4 text-center text-gray-800 font-semibold">{borderText}</div>
        </div>
      )}
    </div>
  );
};

export default PhotoBooth;
