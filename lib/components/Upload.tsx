import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Alert, Spinner } from "@heroui/react";

const Upload: React.FC = () => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    // Reset state for fresh upload
    setUploading(true);
    setError(null);
    setSuccess(false);

    fetch("http://localhost:9000/input/upload-upi", {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.detail || "Server returned an error");
        }
        // eslint-disable-next-line no-console
        console.log("Upload success:", data);
        setSuccess(true);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Upload failed:", err);
        setError("Upload failed: " + err.message);
        setSuccess(false);
      })
      .finally(() => {
        setUploading(false);
      });
  }, []);

  // Optional: Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "text/plain": [".txt"] },
  });

  return (
    <div className="flex flex-col gap-2">
      {!uploading && success && (
        <Alert color="success" title="Upload success" />
      )}
      {!uploading && error && (
        <Alert color="danger" description={error} title="Upload error" />
      )}

      <div className="relative">
        <div
          className="relative border-2 border-gray-500 border-dashed p-8 text-center rounded-md cursor-pointer"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the file here ...</p>
          ) : (
            <p>Drag and Drop a file here, or click to select</p>
          )}
        </div>
        {uploading == true && (
          <Alert
            className="absolute top-0 left-0 flex justify-center items-center w-full h-full backdrop-blur-sm"
            color="success"
            hideIcon={true}
            title={
              <div className="flex justify-center items-center gap-8">
                <Spinner color="success" />
                <span className="text-lg">Uploading...</span>
              </div>
            }
            variant="faded"
          />
        )}
      </div>
    </div>
  );
};

export default Upload;
