"use client";

import { useState } from "react";
import "./globals.css";

interface RedgifsResponse {
  gif: {
    urls: {
      hd: string;
      sd: string;
      poster: string;
    };
    tags: string[];
    createDate: number;
    duration: number;
    views: number;
    hasAudio: boolean;
  };
}

export default function Home() {
  const [redgifsId, setRedgifsId] = useState("");
  const [result, setResult] = useState<RedgifsResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/redgifs?id=${redgifsId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch data");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-center">RedGifs Data Fetcher</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="redgifsId" className="block text-sm font-medium mb-2">
              Enter RedGifs ID:
            </label>
            <input
              type="text"
              id="redgifsId"
              value={redgifsId}
              onChange={(e) => setRedgifsId(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter ID here"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded-md text-white ${
              loading
                ? "bg-gray-400"
                : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
            }`}
          >
            {loading ? "Loading..." : "Fetch Data"}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Result:</h2>
            <textarea
              value={JSON.stringify(result, null, 2)}
              readOnly
              className="w-full h-48 p-4 font-mono text-sm bg-gray-50 border rounded-md"
            />
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Video:</h2>
              <video 
                src={`/api/proxy-video?url=${encodeURIComponent(result.gif.urls.hd)}`}
                controls
                autoPlay
                loop
                className="w-full max-h-[70vh] rounded-lg"
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
