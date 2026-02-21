"use client";

import React from "react";
import { LotkaResult, BradfordResult, ZipfResult, PriceResult } from "../lib/api";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download } from "lucide-react";

const ChartComponent = dynamic(() => import("./ChartComponent"), { ssr: false });

interface ResultsViewProps {
    type: "lotka" | "bradford" | "zipf" | "price";
    data: LotkaResult | BradfordResult | ZipfResult | PriceResult | null;
}

const ResultsView: React.FC<ResultsViewProps> = ({ type, data }) => {
    if (!data) return null;

    const downloadPDF = async () => {
        const element = document.getElementById("results-content");
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`metrixina-report-${type}.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
        }
    };

    const renderContent = () => {
        switch (type) {
            case "lotka": return renderLotka(data as LotkaResult);
            case "bradford": return renderBradford(data as BradfordResult);
            case "zipf": return renderZipf(data as ZipfResult);
            case "price": return renderPrice(data as PriceResult);
            default: return null;
        }
    };

    const renderLotka = (result: LotkaResult) => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-zinc-200">
                    <h3 className="text-lg font-semibold mb-2">Statistics</h3>
                    <ul className="space-y-2 text-sm">
                        <li><strong>Exponent c:</strong> {result.exponent_c.toFixed(4)}</li>
                        <li><strong>Constant A1:</strong> {result.constant_A1.toFixed(4)}</li>
                        <li><strong>R² (Log-Log):</strong> {result.r_squared.toFixed(4)}</li>
                        <li><strong>KS Statistic:</strong> {result.ks_statistic.toFixed(4)}</li>
                        <li><strong>KS p-value:</strong> {result.ks_p_value.toFixed(4)}</li>
                        <li className={`font-bold ${result.fit_status.includes("Does not") ? "text-red-600" : "text-green-600"}`}>
                            {result.fit_status}
                        </li>
                    </ul>
                </div>
                <ChartComponent
                    title="Lotka's Law Distribution"
                    data={[
                        {
                            x: result.plot_data.n,
                            y: result.plot_data.An_empirical,
                            type: "scatter",
                            mode: "markers",
                            name: "Empirical",
                            marker: { color: "#2563eb" },
                        },
                        {
                            x: result.plot_data.n,
                            y: result.plot_data.An_theoretical,
                            type: "scatter",
                            mode: "lines",
                            name: "Theoretical",
                            line: { color: "#16a34a" },
                        },
                    ]}
                    layout={{
                        xaxis: { title: { text: "Number of publications (n)", font: { size: 14 }, standoff: 20 }, type: "log" },
                        yaxis: { title: { text: "Number of Authors (An)", font: { size: 14 }, standoff: 20 }, type: "log" },
                    }}
                />
            </div>
        </div>
    );

    const renderBradford = (result: BradfordResult) => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-zinc-200">
                    <h3 className="text-lg font-semibold mb-2">Bradford Zones</h3>
                    <p><strong>Multiplier k:</strong> {result.bradford_multiplier_k.toFixed(4)}</p>
                    <p><strong>Zones Count:</strong> {result.zones_count}</p>
                    <div className="mt-4">
                        <h4 className="font-medium">Core Journals (Zone 1)</h4>
                        <ul className="list-disc pl-5 max-h-40 overflow-y-auto text-sm">
                            {result.core_journals.map((j, i) => (
                                <li key={i}>{j}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <ChartComponent
                    title="Bradford's Law (Bibliography)"
                    data={(() => {
                        const zoneLabels = result.plot_data.zone_labels || [];
                        const zoneColors: Record<number, string> = { 1: "#dc2626", 2: "#2563eb", 3: "#9ca3af" };
                        const zoneNames: Record<number, string> = { 1: "Zone 1 (Core)", 2: "Zone 2", 3: "Zone 3" };
                        const zones = [1, 2, 3];
                        return zones.map(z => ({
                            x: result.plot_data.log_rank.filter((_: number, i: number) => zoneLabels[i] === z),
                            y: result.plot_data.cumulative_articles.filter((_: number, i: number) => zoneLabels[i] === z),
                            type: "scatter" as const,
                            mode: "markers" as const,
                            name: zoneNames[z],
                            marker: { color: zoneColors[z], size: 6 },
                        })).filter(trace => trace.x.length > 0);
                    })()}
                    layout={{
                        xaxis: { title: { text: "Log(n) Accumulated number of journals", font: { size: 14 }, standoff: 20 } },
                        yaxis: { title: { text: "Accumulated number of documents", font: { size: 14 }, standoff: 20 } },
                    }}
                />
            </div>
        </div>
    );

    const renderZipf = (result: ZipfResult) => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-zinc-200">
                    <h3 className="text-lg font-semibold mb-2">Zipf Statistics</h3>
                    <p><strong>Exponent s:</strong> {result.exponent_s.toFixed(4)}</p>
                    <p><strong>R²:</strong> {result.r_squared.toFixed(4)}</p>
                    <p><strong>Total Words:</strong> {result.total_words}</p>
                    <p><strong>Unique Words:</strong> {result.unique_words}</p>
                    <div className="mt-4">
                        <h4 className="font-medium">Top 10 Words</h4>
                        <table className="w-full text-sm text-left mt-2">
                            <thead>
                                <tr className="border-b">
                                    <th>Rank</th>
                                    <th>Word</th>
                                    <th>Freq</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.top_50_words.slice(0, 10).map((w) => (
                                    <tr key={w.rank}>
                                        <td>{w.rank}</td>
                                        <td>{w.word}</td>
                                        <td>{w.frequency}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <ChartComponent
                    title="Zipf's Law (Rank-Frequency)"
                    data={[
                        {
                            x: result.plot_data.log_rank,
                            y: result.plot_data.log_frequency,
                            type: "scatter",
                            mode: "markers",
                            name: "Data",
                            marker: { color: "#2563eb" },
                        },
                    ]}
                    layout={{
                        xaxis: { title: { text: "Log(Rank)", font: { size: 14 }, standoff: 20 } },
                        yaxis: { title: { text: "Log(Frequency)", font: { size: 14 }, standoff: 20 } },
                    }}
                />
            </div>
        </div>
    );

    const renderPrice = (result: PriceResult) => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-zinc-200">
                    <h3 className="text-lg font-semibold mb-2">Price Index</h3>
                    <div className="text-center py-4">
                        <span className="text-4xl font-bold text-blue-600">
                            {result.price_index_percent.toFixed(1)}%
                        </span>
                        <p className="text-zinc-600 mt-2">{result.interpretation}</p>
                    </div>
                    <ul className="text-sm space-y-2 mt-4">
                        <li><strong>Total References:</strong> {result.total_references}</li>
                        <li><strong>Recent References (≤ 5 years):</strong> {result.recent_references}</li>
                    </ul>
                </div>
                <ChartComponent
                    title="Reference Age Distribution"
                    data={[
                        {
                            x: result.plot_data.years,
                            y: result.plot_data.counts,
                            type: "bar",
                            name: "References",
                            marker: { color: "#16a34a" },
                        },
                    ]}
                    layout={{
                        xaxis: { title: { text: "Years", font: { size: 14 }, standoff: 20 } },
                        yaxis: { title: { text: "Number of References", font: { size: 14 }, standoff: 20 } },
                    }}
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                    <Download size={16} />
                    Download Report
                </button>
            </div>
            <div id="results-content" className="p-4 bg-white">
                <div className="mb-4 border-b pb-4">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">PLmetrix Lab Report</h2>
                    <p className="text-sm text-slate-500">Analysis Type: {type.charAt(0).toUpperCase() + type.slice(1)}</p>
                    <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default ResultsView;
