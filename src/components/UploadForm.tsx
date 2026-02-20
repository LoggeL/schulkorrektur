"use client";

import { useState, useRef } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadForm({
  onUpload,
}: {
  onUpload: (file: File) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = (file: File) => {
    setFileError("");
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Bitte nur JPG, PNG oder WebP Dateien hochladen.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError("Die Datei ist zu groß. Maximal 10 MB erlaubt.");
      return;
    }
    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <div className="text-5xl mb-4">📄</div>
        <p className="text-lg font-medium text-gray-700">
          Datei hierher ziehen oder klicken
        </p>
        <p className="text-sm text-gray-400 mt-1">
          JPG, PNG oder WebP &bull; Maximal 10 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {fileError && (
        <p className="text-red-500 text-sm text-center">{fileError}</p>
      )}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">So funktioniert&apos;s:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-600">
          <li>Fotografiere deine Hausaufgabe oder lade ein Bild hoch</li>
          <li>Die KI analysiert deine Arbeit</li>
          <li>Du erhältst Feedback mit Verbesserungsvorschlägen</li>
        </ol>
      </div>
    </div>
  );
}
