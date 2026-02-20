"use client";

import { useState, useEffect } from "react";
import PasswordGate from "@/components/PasswordGate";
import UploadForm from "@/components/UploadForm";
import ResultDisplay from "@/components/ResultDisplay";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("schulkorrektur_auth");
      if (stored === "true") setAuthenticated(true);
    }
  }, []);

  const handleLogin = async (password: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      sessionStorage.setItem("schulkorrektur_auth", "true");
    } else {
      throw new Error("Falsches Passwort");
    }
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler bei der Korrektur");
      setResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setPreview(null);
  };

  if (!authenticated) {
    return <PasswordGate onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">📝 SchulKorrektur</h1>
            <p className="text-sm text-gray-500">KI-gestützte Hausaufgaben-Korrektur</p>
          </div>
          {result && (
            <button
              onClick={handleReset}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Neue Korrektur
            </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!result && !loading && <UploadForm onUpload={handleUpload} />}

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="mt-4 text-lg text-gray-600">Arbeit wird analysiert...</p>
            <p className="text-sm text-gray-400">Das kann einen Moment dauern</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Fehler</p>
            <p>{error}</p>
            <button
              onClick={handleReset}
              className="mt-2 text-sm underline hover:text-red-900"
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {preview && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-sm font-medium text-gray-500 mb-2">Hochgeladenes Dokument</h2>
                <img
                  src={preview}
                  alt="Hochgeladenes Dokument"
                  className="max-h-64 mx-auto rounded border"
                />
              </div>
            )}
            <ResultDisplay result={result} />
          </div>
        )}
      </div>
    </main>
  );
}
