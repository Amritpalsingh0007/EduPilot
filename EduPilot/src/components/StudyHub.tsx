import { useEffect, useRef, useState } from "react";
import { getUserFiles, uploadFile } from "../service/AIServices";
import useAuth from "../context/authContext";
import { useNavigate } from "react-router-dom";

export default function StudyHub() {
  const { token } = useAuth();
  const [userFiles, setUserFiles] = useState<{ id: string; title: string }[]>(
    []
  );

  useEffect(() => {
    if (!token) return;
    async function fetchFiles() {
      try {
        const files = await getUserFiles(token);
        setUserFiles(files);
      } catch (error) {
        console.error("Failed to fetch user files:", error);
      }
    }

    fetchFiles();
  }, [token]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

const goToRoadmap = (fileId: string) => {
  console.log(`Navigating to roadmap for file ID: ${fileId}`);
  navigate(`/roadmap/${fileId}`);
};


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setUploadMessage("");
    } else {
      setSelectedFile(null);
      setUploadMessage("Please select a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage("Please select a PDF file first");
      return;
    }

    setIsUploading(true);
    setUploadMessage("Uploading...");

    try {
      const formData = new FormData();
      formData.append("pdfFile", selectedFile);

      const result = await uploadFile(token, selectedFile);
      console.log("Upload result:", result);
      console.log("Upload success:", result);

      setUploadMessage("File uploaded successfully!");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-2xl text-white mb-8 p-4 rounded-lg shadow-lg">
        Study Hub
      </div>
      <div className="mb-10">
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Study Material</h2>
    
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 transition w-full sm:w-auto"
      />

      <button
        onClick={handleUpload}
        disabled={isUploading || !selectedFile}
        className={`px-6 py-2 text-sm font-medium text-white rounded-md transition 
          ${isUploading || !selectedFile
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          }`}
      >
        {isUploading ? "Uploading..." : "Upload PDF"}
      </button>
    </div>

    {uploadMessage && (
      <p className="mt-2 text-sm text-gray-600">{uploadMessage}</p>
    )}
    {selectedFile && (
      <p className="text-sm text-gray-500 mt-1">
        Selected file: {selectedFile.name}
      </p>
    )}
  </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {userFiles.length > 0 ? (
          userFiles.map((file) => (
            <div
              key={file.id}
              className="rounded-xl bg-white shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              onClick={() => goToRoadmap(file.id)}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-3">📚</div>
                  <h3 className="font-bold text-xl text-gray-800">
                    {file.title.replace(".pdf", "")}
                  </h3>
                </div>
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium transition-colors duration-200 hover:from-indigo-600 hover:to-purple-600">
                    Explore
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center mt-12">
            <div className="inline-block bg-white p-6 rounded-xl shadow-lg">
              <div className="text-5xl mb-2">😶</div>
              <h2 className="text-lg font-semibold text-gray-700">
                No Study Materials Yet
              </h2>
              <p className="text-sm text-gray-500">
                Start by uploading a PDF file above to see your resources here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
