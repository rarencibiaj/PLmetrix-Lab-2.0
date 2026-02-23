"use client";

import React, { useState } from "react";
import { Upload, FileText, FileSpreadsheet, AlertCircle } from "lucide-react";
import { analyzeLotka, analyzeBradford, analyzeZipf, analyzePrice, analyzeGrowth } from "../lib/api";

interface FileUploadProps {
    module: "lotka" | "bradford" | "zipf" | "price" | "growth";
    onResult: (data: any) => void;
    onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ module, onResult, onError }) => {
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = async (file: File) => {
        setLoading(true);
        onError("");
        try {
            let result;
            switch (module) {
                case "lotka":
                    result = await analyzeLotka(file);
                    break;
                case "bradford":
                    result = await analyzeBradford(file);
                    break;
                case "zipf":
                    result = await analyzeZipf(file);
                    break;
                case "price":
                    result = await analyzePrice(file);
                    break;
                case "growth":
                    result = await analyzeGrowth(file);
                    break;
            }
            onResult(result);
        } catch (err: any) {
            console.error(err);
            onError(err.response?.data?.detail || "An error occurred during analysis.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    return (
        <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
        ${dragActive ? "border-blue-500 bg-blue-50" : "border-zinc-300 hover:border-blue-400 hover:bg-zinc-50"}
        ${loading ? "opacity-50 pointer-events-none" : ""}
      `}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
        >
            <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleChange}
                accept={module === "zipf" || module === "price" ? ".txt,.docx,.pdf" : (module === "lotka" || module === "bradford" || module === "growth") ? ".xlsx,.csv,.txt" : ".xlsx,.csv"}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                    <Upload size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-zinc-900">
                        {loading ? "Analyzing..." : "Click or Drag file to upload"}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                        {module === "zipf" || module === "price"
                            ? "Supported: .docx, .pdf, .txt"
                            : (module === "lotka" || module === "bradford" || module === "growth") ? "Supported: .xlsx, .csv, .txt (Web of Science)"
                                : "Supported: .xlsx, .csv"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
