"use client";

import dynamic from "next/dynamic";
import React from "react";
import { PlotParams } from "react-plotly.js";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ChartComponentProps {
    data: PlotParams["data"];
    layout?: PlotParams["layout"];
    title?: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, layout, title }) => {
    return (
        <div className="w-full h-full min-h-[500px] bg-white rounded-lg shadow-sm border border-zinc-200 p-4">
            {title && <h3 className="text-lg font-semibold mb-4 text-zinc-800">{title}</h3>}
            <div className="w-full h-[460px]">
                <Plot
                    data={data}
                    layout={{
                        autosize: true,
                        margin: { l: 80, r: 30, t: 30, b: 70 },
                        showlegend: true,
                        ...layout,
                    }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%" }}
                    config={{ responsive: true, displayModeBar: true }}
                />
            </div>
        </div>
    );
};

export default ChartComponent;
