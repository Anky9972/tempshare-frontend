import React, { useState } from 'react';
import { FiUpload, FiFile, FiVideo, FiMusic, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL;

const MultimediaUpload = ({ onFilesUploaded, disabled }) => {
  const [files, setFiles] = useState([]);
  const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
  const allowedFileTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'video/mp4',
    'audio/mpeg', // MP3
    'image/jpeg',
    'image/png',
  ];

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = [];
    let error = false;

    // Validate files
    for (const file of selectedFiles) {
      if (!allowedFileTypes.includes(file.type)) {
        toast.error(`File "${file.name}" has an unsupported type.`);
        error = true;
        continue;
      }
      if (file.size > maxFileSize) {
        toast.error(`File "${file.name}" exceeds 10MB limit.`);
        error = true;
        continue;
      }
      validFiles.push(file);
    }

    if (error) return;

    if (validFiles.length === 0) {
      toast.error('No valid files selected.');
      return;
    }

    const toastId = toast.loading('Uploading files...');
    try {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append('files', file); // Use 'files' as the field name
      });

      const response = await axios.post(`${API_URL}/upload-multimedia`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedFiles = response.data.files;
      setFiles((prev) => [...prev, ...uploadedFiles]);
      onFilesUploaded(uploadedFiles); // Pass file metadata to parent (HomePage)
      toast.success('Files uploaded successfully!', { id: toastId });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to upload files.';
      toast.error(errorMessage, { id: toastId });
      console.error(err);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    toast.success('File removed.');
  };

  const renderFilePreview = (file) => {
    const { url, name, type } = file;
    if (type.startsWith('image/')) {
      return (
        <img
          src={url}
          alt={name}
          className="w-24 h-24 object-cover rounded"
          loading="lazy"
        />
      );
    } else if (type.startsWith('video/')) {
      return (
        <video
          src={url}
          controls
          className="w-24 h-24 object-cover rounded"
        />
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <FiFile className="text-2xl text-blue-400" />
          <span className="text-sm truncate">{name}</span>
        </div>
      );
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 z-10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FiUpload className="text-blue-500" />
        Multimedia Upload (Beta)
      </h3>
      <div className="mb-4">
        <input
          type="file"
          multiple
          accept={allowedFileTypes.join(',')}
          onChange={handleFileChange}
          disabled={disabled}
          className="w-full p-3 bg-slate-700 text-slate-300 border border-slate-600 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 disabled:opacity-90"
          aria-label="Upload multimedia files"
          data-testid="multimedia-upload-input"
        />
        <p className="text-xs text-slate-400 mt-2">
          Supported formats: PDF, DOCX, XLSX, PPTX, MP4, MP3, JPEG, PNG (max 10MB each)
        </p>
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {renderFilePreview(file)}
              <button
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${file.name}`}
              >
                <FiX />
              </button>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 underline truncate block mt-1"
              >
                {file.url}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultimediaUpload;