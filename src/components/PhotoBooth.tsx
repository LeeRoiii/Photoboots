import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, Download, RefreshCw, Sparkles, X, Trash2, ZoomIn, ZoomOut, Edit } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const PhotoBooth: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [images, setImages] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [flashMode, setFlashMode] = useState<boolean>(false);
  const [numberOfShots, setNumberOfShots] = useState<number>(1);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [borderText, setBorderText] = useState<string>("Instax Photo"); // Text for the border
  const [isEditingBorder, setIsEditingBorder] = useState<boolean>(false); // Edit mode for border text

  // Load images from localStorage on component mount
  useEffect(() => {
    const savedImages = localStorage.getItem("capturedImages");
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
  }, []);

  // Save images to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("capturedImages", JSON.stringify(images));
  }, [images]);

  // Zoom in function
  const handleZoomIn = (): void => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3)); // Limit zoom to 3x
  };

  // Zoom out function
  const handleZoomOut = (): void => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 1)); // Limit zoom to 1x
  };

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

        // Countdown from 3 to 1
        for (let j = 3; j > 0; j--) {
          setCountdown(j);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
        }

        // Capture the image
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          setImages((prev) => [...prev, imageSrc]);
          toast.success(`Photo ${i + 1} captured!`);
        }

        // Reset countdown
        setCountdown(null);

        // Add a 1-second delay between shots (if not the last shot)
        if (i < numberOfShots - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      setIsCapturing(false);
    }
  };

  const downloadImage = (img: string): void => {
    const link = document.createElement("a");
    link.href = img;
    link.download = `photo-booth-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  const toggleCamera = (): void => {
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"));
    toast("Camera switched!");
  };

  const handleSelectImage = (img: string): void => {
    setSelectedImage(img); // Set the selected image for preview
  };

  const handleClosePreview = (): void => {
    setSelectedImage(null); // Close the preview
  };

  const deleteImage = (index: number, e: React.MouseEvent): void => {
    e.stopPropagation(); // Prevent selecting the image when deleting
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    toast.success("Image deleted!");
  };

  // Instax Border Component
  const InstaxBorder: React.FC<{ image: string }> = ({ image }) => {
    return (
      <div className="relative w-64 h-80 bg-white rounded-lg shadow-lg p-4 flex flex-col items-center justify-center">
        {/* Image */}
        <img
          src={image}
          alt="Captured"
          className="w-full h-48 object-cover rounded-lg"
        />
        {/* Border Text */}
        <div className="mt-4 text-center text-gray-800 font-semibold">
          {borderText}
        </div>
        {/* Edit Button */}
        <button
          onClick={() => setIsEditingBorder(true)}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          title="Edit Border Text"
          aria-label="Edit Border Text"
        >
          <Edit size={16} className="text-white" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white font-poppins">
      {/* Toast Notifications */}
      <Toaster position="bottom-center" />

      <div className="w-full max-w-6xl flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* Camera Preview */}
        <div className="w-full sm:w-1/2 relative">
          <div className="relative w-full h-[300px] sm:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-800/50">
            {/* Flash effect overlay */}
            <div id="camera-flash" className="absolute inset-0 bg-white opacity-0 transition-opacity z-20 pointer-events-none"></div>

            {/* Webcam with zoom applied */}
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/png"
              videoConstraints={{ facingMode: cameraFacing }}
              className="w-full h-full object-cover"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center" }}
            />

            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                <div className="text-6xl sm:text-8xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse">
                  {countdown}
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
            <div className="flex gap-4">
              <button
                onClick={toggleCamera}
                className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:scale-110"
                title="Switch Camera"
                aria-label="Switch Camera"
              >
                <RefreshCw size={24} className="text-white" />
              </button>
              <button
                onClick={() => setFlashMode(!flashMode)}
                className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  flashMode ? "bg-yellow-600 shadow-lg shadow-yellow-500/50" : "bg-gray-800"
                }`}
                title="Camera Flash"
                aria-label="Toggle Flash"
              >
                <Sparkles size={24} className={flashMode ? "text-white" : "text-gray-300"} />
              </button>
              {/* Zoom In Button */}
              <button
                onClick={handleZoomIn}
                className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:scale-110"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn size={24} className="text-white" />
              </button>
              {/* Zoom Out Button */}
              <button
                onClick={handleZoomOut}
                className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:scale-110"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut size={24} className="text-white" />
              </button>
            </div>
            <button
              onClick={capture}
              disabled={isCapturing}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              aria-label="Capture Photo"
            >
              <Camera size={20} />
              <span>{isCapturing ? "Capturing..." : "Capture"}</span>
            </button>

            {/* Number of Shots Input */}
            <div className="flex items-center gap-2">
              {/* Label with Icon */}
              <label htmlFor="shots" className="text-sm text-gray-300 flex items-center gap-2">
                <Camera size={16} className="text-blue-400" />
                <span>Shots:</span>
              </label>

              {/* Custom Styled Input */}
              <div className="relative group">
                <input
                  type="number"
                  id="shots"
                  value={numberOfShots}
                  onChange={(e) => setNumberOfShots(Number(e.target.value))}
                  min="1"
                  max="10"
                  className="w-16 p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  aria-label="Number of Shots"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Gallery */}
        <div className="w-full sm:w-1/2">
          <h2 className="text-xl font-semibold text-white mb-4">Captured Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative group cursor-pointer transform hover:scale-105 transition-transform duration-300"
                onClick={() => handleSelectImage(img)}
                aria-label="View Image"
              >
                <InstaxBorder image={img} />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(img);
                    }}
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    title="Download"
                    aria-label="Download Image"
                  >
                    <Download size={16} className="text-white" />
                  </button>
                  <button
                    onClick={(e) => deleteImage(index, e)}
                    className="p-2 rounded-full bg-gray-800 hover:bg-red-600 transition-colors"
                    title="Delete"
                    aria-label="Delete Image"
                  >
                    <Trash2 size={16} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-Size Image Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClosePreview}
        >
          <div className="relative max-w-4xl max-h-[80vh] w-full" onClick={(e) => e.stopPropagation()}>
            <InstaxBorder image={selectedImage} />
            <button
              onClick={handleClosePreview}
              className="absolute top-4 right-4 p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors hover:scale-110"
              title="Close Preview"
              aria-label="Close Preview"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Border Text Modal */}
      {isEditingBorder && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-white mb-4">Edit Border Text</h2>
            <input
              type="text"
              value={borderText}
              onChange={(e) => setBorderText(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter border text"
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsEditingBorder(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditingBorder(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flash Effect Animation */}
      <style>{`
        .flash-active {
          opacity: 1;
          animation: flash 0.5s;
        }

        @keyframes flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PhotoBooth;
