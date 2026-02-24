"use client";

import React, { useState } from "react";

import FileUpload from "../components/FileUpload";
import ResultsView from "../components/ResultsView";
import { BookOpen, BarChart2, FileText, Activity, ArrowLeft, ChevronRight, Info, X, Users, Code, Layout, Database, Server, Monitor, Globe, CheckCircle, Upload, Download, BarChart, TrendingUp } from "lucide-react";

// Prefix for public static assets — required when Next.js basePath is set
const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH || '';

// ── Translations ──────────────────────────────────────────────────────────────
const translations = {
  es: {
    subtitle: "Analizador Cienciométrico",
    about: "Acerca de",
    modulesTitle: "Módulos de Análisis Cienciométrico",
    modulesSubtitle: "Selecciona un módulo para comenzar tu análisis",
    runAnalysis: "Ejecutar Análisis",
    backToModules: "Volver a los módulos",
    analysis: "Análisis",
    clearResults: "Limpiar Resultados",
    footer: "Diseñado para investigación cienciométrica avanzada.",
    lotka: {
      name: "Ley de Lotka",
      description: "Distribución de productividad de autores (Ley del Cuadrado Inverso).",
      longDescription: "Analiza la distribución de frecuencia de la productividad científica. La mayoría de los autores publican pocos artículos, mientras que pocos autores publican muchos.",
    },
    bradford: {
      name: "Ley de Bradford",
      description: "Dispersión de revistas en zonas.",
      longDescription: "Describe cómo los artículos sobre un tema se distribuyen entre revistas. Un pequeño núcleo de revistas produce los artículos más relevantes.",
    },
    zipf: {
      name: "Ley de Zipf",
      description: "Distribución rango-frecuencia de palabras en texto.",
      longDescription: "La frecuencia de una palabra es inversamente proporcional a su rango en la tabla de frecuencias. La palabra más común aparece aproximadamente el doble de veces que la segunda.",
    },
    price: {
      name: "Índice de Price",
      description: "Recencia y obsolescencia de referencias.",
      longDescription: "Mide la proporción de referencias recientes en un trabajo, indicando la velocidad de crecimiento del conocimiento y la obsolescencia en un campo.",
    },
    growth: {
      name: "Crecimiento Exponencial",
      description: "Ley del Crecimiento Exponencial de la Literatura Científica.",
      longDescription: "Analiza el comportamiento anual de la producción científica y determina si se cumple la Ley de Price: N = N₀ × e^(b×t). Identifica las fases precientífica, exponencial y de estabilización.",
    },
    // About modal
    aboutTitle: "Acerca de PLmetrix Lab",
    workingGroup: "Grupo de Trabajo",
    workingGroupName: "Complejidad, Cienciometría y Ciencia de la Ciencia",
    programming: "Programación",
    designDev: "Diseño y Desarrollo",
    aiAssistance: "Asistencia de IA",
    systemDiagram: "Diagrama General del Sistema",
    userBrowser: "Usuario (Navegador Web)",
    interactiveUI: "UI Interactiva",
    mainPage: "Página Principal",
    fileUpload: "Subida de Archivos",
    plotlyCharts: "Gráficos Plotly",
    componentDesc: "Descripción Detallada de los Componentes",
    // Component descriptions
    pageDesc: "Página principal con tarjetas de selección de módulos, retratos de los científicos fundadores y navegación entre módulos.",
    fileUploadDesc: "Componente de carga de archivos con soporte para arrastrar y soltar. Acepta .xlsx, .csv y .txt (Web of Science) para Lotka y Bradford; .txt, .docx y .pdf para Zipf y Price.",
    resultsViewDesc: "Renderiza los resultados de análisis con tablas estadísticas, gráficos interactivos Plotly.js y exportación a PDF.",
    chartComponentDesc: "Wrapper de Plotly.js con carga dinámica (SSR-safe), diseño responsivo y ejes configurables.",
    apiTsDesc: "Capa de comunicación HTTP con Axios para enviar archivos al backend y recibir resultados tipados.",
    apiPyDesc: "Router principal con endpoints REST para cada módulo (/analyze/lotka, /analyze/bradford, /analyze/zipf, /analyze/price). Incluye detección inteligente de columnas con soporte para nombres en español e inglés, y lectura de archivos tabulados de Web of Science.",
    mainPyDesc: "Punto de entrada de la aplicación FastAPI con configuración CORS para comunicación con el frontend.",
    scientometricModules: "Módulos de Análisis Cienciométrico",
    lotkaDesc: "Analiza la distribución de productividad de autores usando la Ley del Cuadrado Inverso. Calcula el exponente c mediante regresión logarítmica, coeficiente R², y genera datos observados vs. teóricos para visualización comparativa.",
    bradfordDesc: "Implementa la dispersión de artículos en zonas de Bradford. Divide las revistas en 3 zonas con aproximadamente el mismo número de artículos, calcula el multiplicador k, e identifica las revistas del núcleo (Zona 1). Gráfico con puntos coloreados por zona.",
    zipfDesc: "Analiza la distribución rango-frecuencia de palabras en textos. Calcula el exponente s de Zipf, coeficiente R², y genera el gráfico log-log de frecuencia vs. rango. Soporta .txt, .docx y .pdf.",
    priceDesc: "Calcula el Índice de Price como el porcentaje de referencias recientes (≤ 5 años) respecto al total. Genera un histograma de distribución temporal y proporciona interpretación automática sobre la obsolescencia del campo.",
    utilities: "Utilidades",
    utilsPyDesc: "Extracción de texto desde múltiples formatos (.txt, .docx, .pdf) para los módulos de Zipf y Price.",
    startBatDesc: "Script de inicio rápido que lanza ambos servidores (backend y frontend) con un solo clic.",
    modalFooter: "Diseñado para investigación cienciométrica avanzada",
    // User Manual
    userManual: "Manual de Usuario",
    manualTitle: "Manual de Usuario — PLmetrix Lab",
    manualIntro: "PLmetrix Lab es una plataforma de análisis cienciométrico que permite aplicar cuatro leyes clásicas de la bibliometría a conjuntos de datos cargados por el usuario.",
    manualWorkflow: "Flujo de Trabajo General",
    manualStep1: "Selecciona un módulo desde la página principal haciendo clic en la tarjeta del científico correspondiente.",
    manualStep2: "Carga tu archivo de datos en el formato aceptado (arrastra y suelta o haz clic para seleccionar).",
    manualStep3: "El sistema procesará automáticamente los datos y mostrará los resultados con tablas estadísticas y gráficos interactivos.",
    manualStep4: "Exporta los resultados en formato PDF usando el botón \"Descargar PDF\".",
    manualStep5: "Haz clic en \"Limpiar Resultados\" para cargar un nuevo archivo o \"Volver a los módulos\" para cambiar de módulo.",
    manualFormats: "Formatos de Archivo Aceptados",
    manualLotkaTitle: "Módulo Lotka — Ley de Lotka",
    manualLotkaFormats: "Acepta archivos .xlsx, .csv o .txt (exportación Web of Science).",
    manualLotkaData: "El archivo debe contener una tabla con al menos dos columnas: una para el número de publicaciones (n) y otra para el número de autores con esas publicaciones (An). El sistema detecta automáticamente nombres de columnas en español e inglés.",
    manualLotkaResults: "Resultados: tabla de distribución observada vs. teórica, exponente c de Lotka, coeficiente R², y gráfico comparativo en escala logarítmica.",
    manualBradfordTitle: "Módulo Bradford — Ley de Bradford",
    manualBradfordFormats: "Acepta archivos .xlsx, .csv o .txt (exportación Web of Science).",
    manualBradfordData: "El archivo debe contener una tabla con al menos dos columnas: nombre de la revista (journal) y número de artículos. El sistema detecta automáticamente nombres de columnas como \"journal\", \"source_title\", \"publication_titles\", etc.",
    manualBradfordResults: "Resultados: dispersión de revistas en 3 zonas de Bradford, multiplicador k, lista de revistas del núcleo (Zona 1), y gráfico acumulativo con puntos coloreados por zona (rojo, azul, gris).",
    manualZipfTitle: "Módulo Zipf — Ley de Zipf",
    manualZipfFormats: "Acepta archivos .txt, .docx o .pdf con texto libre.",
    manualZipfData: "Cargue un documento de texto. El sistema extraerá automáticamente todas las palabras, calculará sus frecuencias y generará la distribución rango-frecuencia.",
    manualZipfResults: "Resultados: tabla de las 50 palabras más frecuentes, exponente s de Zipf, coeficiente R², total de palabras, palabras únicas, y gráfico log-log de frecuencia vs. rango.",
    manualPriceTitle: "Módulo Price — Índice de Price",
    manualPriceFormats: "Acepta archivos .txt, .docx o .pdf con referencias bibliográficas.",
    manualPriceData: "Cargue un documento que contenga referencias bibliográficas con años. El sistema detectará automáticamente las fechas y calculará el Índice de Price.",
    manualPriceResults: "Resultados: Índice de Price (porcentaje de refs. recientes ≤ 5 años), total de referencias, interpretación automática del nivel de obsolescencia, y histograma de distribución temporal.",
    manualGrowthTitle: "Módulo Crecimiento Exponencial — Ley de Price",
    manualGrowthFormats: "Acepta archivos .xlsx, .csv o .txt (exportación Web of Science).",
    manualGrowthData: "El archivo debe contener al menos dos columnas: año de publicación (Publication Years / Final Publication Year) y conteo de registros (Record Count). El sistema detecta automáticamente los nombres de columnas.",
    manualGrowthResults: "Resultados: parámetros del modelo exponencial (N₀, b, tiempo de duplicación), R² de los modelos exponencial y logístico, clasificación en las tres fases de Price (precientífica, exponencial, estabilización), fase del campo (emergencia o madurez estructural), año de inflexión, y gráfico comparativo de datos reales vs. modelos teóricos.",
    manualPdfExport: "Exportación a PDF",
    manualPdfDesc: "Todos los módulos incluyen un botón \"Descargar PDF\" que genera un informe profesional con el encabezado PLmetrix Lab Report, los resultados estadísticos, las tablas de datos y los gráficos del análisis.",
  },
  en: {
    subtitle: "Scientometric Analyzer",
    about: "About",
    modulesTitle: "Scientometric Analysis Modules",
    modulesSubtitle: "Select a module to begin your analysis",
    runAnalysis: "Run Analysis",
    backToModules: "Back to modules",
    analysis: "Analysis",
    clearResults: "Clear Results",
    footer: "Designed for advanced scientometric research.",
    lotka: {
      name: "Lotka's Law",
      description: "Author productivity distribution (Inverse Square Law).",
      longDescription: "Analyzes the frequency distribution of scientific productivity. Most authors publish few papers, while few authors publish many.",
    },
    bradford: {
      name: "Bradford's Law",
      description: "Journal scattering across zones.",
      longDescription: "Describes how articles on a subject are distributed across journals. A small core of journals produces the most relevant articles.",
    },
    zipf: {
      name: "Zipf's Law",
      description: "Word frequency ranking in text.",
      longDescription: "The frequency of a word is inversely proportional to its rank in the frequency table. The most common word occurs roughly twice as often as the second.",
    },
    price: {
      name: "Price Index",
      description: "Reference recency and obsolescence.",
      longDescription: "Measures the proportion of recent references in a work, indicating the speed of knowledge growth and obsolescence in a field.",
    },
    growth: {
      name: "Exponential Growth",
      description: "Law of Exponential Growth of Scientific Literature.",
      longDescription: "Analyzes the annual behavior of scientific production and determines whether Price's Law holds: N = N₀ × e^(b×t). Identifies pre-scientific, exponential, and stabilization phases.",
    },
    // About modal
    aboutTitle: "About PLmetrix Lab",
    workingGroup: "Working Group",
    workingGroupName: "Complexity, Scientometrics and Science of Science",
    programming: "Programming",
    designDev: "Design & Development",
    aiAssistance: "AI Assistance",
    systemDiagram: "System Architecture Diagram",
    userBrowser: "User (Web Browser)",
    interactiveUI: "Interactive UI",
    mainPage: "Main Page",
    fileUpload: "File Upload",
    plotlyCharts: "Plotly Charts",
    componentDesc: "Detailed Component Descriptions",
    // Component descriptions
    pageDesc: "Main page with module selection cards, portraits of founding scientists, and module navigation.",
    fileUploadDesc: "Drag-and-drop file upload component. Accepts .xlsx, .csv and .txt (Web of Science) for Lotka and Bradford; .txt, .docx and .pdf for Zipf and Price.",
    resultsViewDesc: "Renders analysis results with statistical tables, interactive Plotly.js charts, and PDF export.",
    chartComponentDesc: "Plotly.js wrapper with dynamic loading (SSR-safe), responsive design, and configurable axes.",
    apiTsDesc: "HTTP communication layer with Axios for sending files to the backend and receiving typed results.",
    apiPyDesc: "Main router with REST endpoints for each module (/analyze/lotka, /analyze/bradford, /analyze/zipf, /analyze/price). Includes intelligent column detection with support for Spanish and English column names, and Web of Science tab-delimited file reading.",
    mainPyDesc: "FastAPI application entry point with CORS configuration for frontend communication.",
    scientometricModules: "Scientometric Analysis Modules",
    lotkaDesc: "Analyzes author productivity distribution using the Inverse Square Law. Computes exponent c via log regression, R² coefficient, and generates observed vs. theoretical data for comparative visualization.",
    bradfordDesc: "Implements article scattering across Bradford zones. Divides journals into 3 zones with approximately equal articles, computes Bradford multiplier k, and identifies core journals (Zone 1). Chart with zone-colored points.",
    zipfDesc: "Analyzes word rank-frequency distribution in texts. Computes Zipf exponent s, R² coefficient, and generates log-log frequency vs. rank chart. Supports .txt, .docx and .pdf.",
    priceDesc: "Computes the Price Index as the percentage of recent references (≤ 5 years) relative to total. Generates a temporal distribution histogram and provides automatic interpretation of field obsolescence.",
    utilities: "Utilities",
    utilsPyDesc: "Text extraction from multiple formats (.txt, .docx, .pdf) for Zipf and Price modules.",
    startBatDesc: "Quick-start script that launches both servers (backend and frontend) with a single click.",
    modalFooter: "Designed for advanced scientometric research",
    // User Manual
    userManual: "User Manual",
    manualTitle: "User Manual — PLmetrix Lab",
    manualIntro: "PLmetrix Lab is a scientometric analysis platform that allows applying four classic bibliometric laws to user-uploaded datasets.",
    manualWorkflow: "General Workflow",
    manualStep1: "Select a module from the main page by clicking on the corresponding scientist's card.",
    manualStep2: "Upload your data file in the accepted format (drag & drop or click to select).",
    manualStep3: "The system will automatically process the data and display results with statistical tables and interactive charts.",
    manualStep4: "Export results as PDF using the \"Download PDF\" button.",
    manualStep5: "Click \"Clear Results\" to upload a new file or \"Back to modules\" to switch modules.",
    manualFormats: "Accepted File Formats",
    manualLotkaTitle: "Lotka Module — Lotka's Law",
    manualLotkaFormats: "Accepts .xlsx, .csv, or .txt (Web of Science export) files.",
    manualLotkaData: "The file must contain a table with at least two columns: one for the number of publications (n) and one for the number of authors with that many publications (An). The system automatically detects column names in Spanish and English.",
    manualLotkaResults: "Results: observed vs. theoretical distribution table, Lotka exponent c, R² coefficient, and comparative log-scale chart.",
    manualBradfordTitle: "Bradford Module — Bradford's Law",
    manualBradfordFormats: "Accepts .xlsx, .csv, or .txt (Web of Science export) files.",
    manualBradfordData: "The file must contain a table with at least two columns: journal name and article count. The system automatically detects column names like \"journal\", \"source_title\", \"publication_titles\", etc.",
    manualBradfordResults: "Results: journal scattering across 3 Bradford zones, k multiplier, core journal list (Zone 1), and cumulative chart with zone-colored points (red, blue, grey).",
    manualZipfTitle: "Zipf Module — Zipf's Law",
    manualZipfFormats: "Accepts .txt, .docx, or .pdf files with free text.",
    manualZipfData: "Upload a text document. The system will automatically extract all words, compute their frequencies, and generate the rank-frequency distribution.",
    manualZipfResults: "Results: table of top 50 most frequent words, Zipf exponent s, R² coefficient, total words, unique words, and log-log frequency vs. rank chart.",
    manualPriceTitle: "Price Module — Price Index",
    manualPriceFormats: "Accepts .txt, .docx, or .pdf files with bibliographic references.",
    manualPriceData: "Upload a document containing bibliographic references with years. The system will automatically detect dates and compute the Price Index.",
    manualPriceResults: "Results: Price Index (percentage of recent refs. ≤ 5 years), total references, automatic obsolescence interpretation, and temporal distribution histogram.",
    manualGrowthTitle: "Exponential Growth Module — Price's Law",
    manualGrowthFormats: "Accepts .xlsx, .csv, or .txt (Web of Science export) files.",
    manualGrowthData: "The file must contain at least two columns: publication year (Publication Years / Final Publication Year) and record count (Record Count). The system automatically detects column names.",
    manualGrowthResults: "Results: exponential model parameters (N₀, b, doubling time), R² for exponential and logistic models, classification into Price's three phases (pre-scientific, exponential, stabilization), field phase (emergence or structural maturity), inflection year, and comparative chart of real data vs. theoretical models.",
    manualPdfExport: "PDF Export",
    manualPdfDesc: "All modules include a \"Download PDF\" button that generates a professional report with the PLmetrix Lab Report header, statistical results, data tables, and analysis charts.",
  },
};

type Lang = "es" | "en";

export default function Home() {
  const [activeModule, setActiveModule] = useState<"lotka" | "bradford" | "zipf" | "price" | "growth" | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [showAbout, setShowAbout] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [lang, setLang] = useState<Lang>("es");

  const t = translations[lang];

  const handleModuleChange = (module: "lotka" | "bradford" | "zipf" | "price" | "growth") => {
    setActiveModule(module);
    setResultData(null);
    setError("");
  };

  const handleResult = (data: any) => {
    setResultData(data);
    setError("");
  };

  const handleBack = () => {
    setActiveModule(null);
    setResultData(null);
    setError("");
  };

  const moduleIds = ["lotka", "bradford", "zipf", "price", "growth"] as const;
  const moduleIcons = {
    lotka: <BookOpen size={20} />,
    bradford: <BarChart2 size={20} />,
    zipf: <FileText size={20} />,
    price: <Activity size={20} />,
    growth: <TrendingUp size={20} />,
  };
  const moduleFullNames = {
    lotka: "Alfred J. Lotka",
    bradford: "Samuel C. Bradford",
    zipf: "George K. Zipf",
    price: "Derek J. de Solla Price",
    growth: "Derek J. de Solla Price",
  };
  const moduleYears = { lotka: "1926", bradford: "1934", zipf: "1949", price: "1963", growth: "1963" };
  const moduleImages = {
    lotka: `${assetPrefix}/images/lotka.jpg`,
    bradford: `${assetPrefix}/images/bradford.jpg`,
    zipf: `${assetPrefix}/images/zipf.jpg`,
    price: `${assetPrefix}/images/price.jpg`,
    growth: `${assetPrefix}/images/price.jpg`,
  };
  const moduleColors = { lotka: "emerald", bradford: "blue", zipf: "violet", price: "amber", growth: "rose" };

  const colorClasses: Record<string, { bg: string; border: string; text: string; ring: string; badge: string; hover: string }> = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-500", text: "text-emerald-700", ring: "ring-emerald-500", badge: "bg-emerald-100 text-emerald-700", hover: "hover:border-emerald-400 hover:shadow-lg" },
    blue: { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-700", ring: "ring-blue-500", badge: "bg-blue-100 text-blue-700", hover: "hover:border-blue-400 hover:shadow-lg" },
    violet: { bg: "bg-violet-50", border: "border-violet-500", text: "text-violet-700", ring: "ring-violet-500", badge: "bg-violet-100 text-violet-700", hover: "hover:border-violet-400 hover:shadow-lg" },
    amber: { bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-700", ring: "ring-amber-500", badge: "bg-amber-100 text-amber-700", hover: "hover:border-amber-400 hover:shadow-lg" },
    rose: { bg: "bg-rose-50", border: "border-rose-500", text: "text-rose-700", ring: "ring-rose-500", badge: "bg-rose-100 text-rose-700", hover: "hover:border-rose-400 hover:shadow-lg" },
  };

  const activeModuleData = activeModule ? {
    id: activeModule,
    name: t[activeModule].name,
    fullName: moduleFullNames[activeModule],
    year: moduleYears[activeModule],
    icon: moduleIcons[activeModule],
    color: moduleColors[activeModule],
  } : null;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={`${assetPrefix}/images/logo_fciencias.png`} alt="Facultad de Ciencias UNAM" className="h-10 bg-white rounded px-1" />
            <img src={`${assetPrefix}/images/logo_ldnl.png`} alt="Laboratorio de Dinámica No Lineal" className="h-10 bg-white rounded px-1" />
            <img src={`${assetPrefix}/images/logo_extra.png`} alt="Logo" className="h-10" />
            <button onClick={handleBack} className="flex items-center">
              <h1 className="text-xl font-bold tracking-tight">PLmetrix Lab <span className="text-slate-400 font-normal text-sm ml-2">{t.subtitle}</span></h1>
            </button>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
            >
              <Globe size={16} />
              {lang === "es" ? "EN" : "ES"}
            </button>
            {/* Manual Button */}
            <button
              onClick={() => setShowManual(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <CheckCircle size={16} />
              {t.userManual}
            </button>
            {/* About Button */}
            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Info size={16} />
              {t.about}
            </button>
            <div className="text-sm text-slate-400">v1.0.0</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HOME VIEW: Portrait Cards */}
        {activeModule === null && (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.modulesTitle}</h2>
              <p className="text-slate-500 text-lg">{t.modulesSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {moduleIds.map((id) => {
                const colors = colorClasses[moduleColors[id]];
                const mod = t[id];
                return (
                  <div
                    key={id}
                    className={`bg-white rounded-2xl border-2 border-zinc-200 shadow-sm overflow-hidden transition-all duration-300 cursor-pointer group ${colors.hover}`}
                    onClick={() => handleModuleChange(id)}
                  >
                    {/* Portrait */}
                    <div className="relative w-full h-64 overflow-hidden bg-zinc-100">
                      <img
                        src={moduleImages[id]}
                        alt={`Portrait of ${moduleFullNames[id]}`}
                        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white font-semibold text-sm">{moduleFullNames[id]}</p>
                        <p className="text-white/70 text-xs">{moduleYears[id]}</p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${colors.badge}`}>
                          {moduleIcons[id]}
                        </div>
                        <h3 className="font-bold text-slate-800">{mod.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">{mod.longDescription}</p>

                      {/* Execute Button */}
                      <button
                        className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${colors.badge} group-hover:shadow-md`}
                      >
                        {t.runAnalysis}
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* MODULE VIEW: Upload + Results */}
        {activeModule !== null && activeModuleData && (
          <>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">{t.backToModules}</span>
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden min-h-[600px]">
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses[activeModuleData.color].badge}`}>
                    {activeModuleData.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      {activeModuleData.name} — {t.analysis}
                    </h2>
                    <p className="text-sm text-slate-500">{activeModuleData.fullName} ({activeModuleData.year})</p>
                  </div>
                </div>
                {resultData && (
                  <button
                    onClick={() => setResultData(null)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {t.clearResults}
                  </button>
                )}
              </div>

              <div className="p-6">
                {!resultData ? (
                  <div className="max-w-xl mx-auto py-12">
                    <FileUpload
                      module={activeModule}
                      onResult={handleResult}
                      onError={setError}
                    />
                    {error && (
                      <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <ResultsView type={activeModule} data={resultData} />
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 mt-12 bg-white pb-8 pt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; 2026 PLmetrix Lab. {t.footer}</p>
          <div className="mt-2 space-x-4">
            <span>Lotka (1926)</span>
            <span>Bradford (1934)</span>
            <span>Zipf (1949)</span>
            <span>Price (1963)</span>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 text-white rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Info size={18} />
                </div>
                <h2 className="text-xl font-bold">{t.aboutTitle}</h2>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Working Group */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users size={22} className="text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-800">{t.workingGroup}</h3>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <h4 className="font-semibold text-emerald-800 mb-3">{t.workingGroupName}</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Dr. Humberto Andrés Carrillo Calvet
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Dr. Ricardo Arencibia Jorge
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Dr. José Luis Jiménez Andrade
                    </li>
                  </ul>
                </div>
              </section>

              {/* Programming */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Code size={22} className="text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-800">{t.programming}</h3>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">{t.designDev}</h4>
                    <p className="text-slate-700">Ricardo Arencibia Jorge y José Luis Jiménez Andrade</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">{t.aiAssistance}</h4>
                    <p className="text-slate-700">Antigravity con Gemini 3 Pro, Claude Sonnet 4.5</p>
                  </div>
                </div>
              </section>

              {/* Architecture Diagram */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Layout size={22} className="text-violet-600" />
                  <h3 className="text-lg font-bold text-slate-800">{t.systemDiagram}</h3>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* User Layer */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-amber-100 border-2 border-amber-400 rounded-xl px-6 py-3 text-center">
                        <Monitor size={20} className="mx-auto text-amber-600 mb-1" />
                        <p className="font-bold text-amber-800 text-sm">{t.userBrowser}</p>
                        <p className="text-xs text-amber-600">Opera / Chrome / Firefox</p>
                      </div>
                    </div>
                    <div className="flex justify-center mb-4">
                      <div className="w-0.5 h-6 bg-slate-400"></div>
                    </div>

                    {/* Frontend */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-blue-100 border-2 border-blue-400 rounded-xl px-8 py-3 text-center w-80">
                        <p className="font-bold text-blue-800 text-sm">Frontend (Next.js + React)</p>
                        <p className="text-xs text-blue-600">Puerto 3000 · {t.interactiveUI}</p>
                        <div className="flex gap-2 justify-center mt-2">
                          <span className="bg-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded">{t.mainPage}</span>
                          <span className="bg-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded">{t.fileUpload}</span>
                          <span className="bg-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded">{t.plotlyCharts}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center mb-4">
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-4 bg-slate-400"></div>
                        <span className="text-xs text-slate-500 bg-white px-2 border border-slate-300 rounded">HTTP / REST API</span>
                        <div className="w-0.5 h-4 bg-slate-400"></div>
                      </div>
                    </div>

                    {/* Backend */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-green-100 border-2 border-green-400 rounded-xl px-8 py-3 text-center w-80">
                        <Server size={18} className="mx-auto text-green-600 mb-1" />
                        <p className="font-bold text-green-800 text-sm">Backend (FastAPI + Uvicorn)</p>
                        <p className="text-xs text-green-600">Puerto 8000 · API REST</p>
                      </div>
                    </div>
                    <div className="flex justify-center mb-4">
                      <div className="w-0.5 h-6 bg-slate-400"></div>
                    </div>

                    {/* Modules */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-center">
                        <Database size={16} className="mx-auto text-emerald-600 mb-1" />
                        <p className="font-bold text-emerald-800 text-xs">Lotka</p>
                        <p className="text-[10px] text-emerald-600">lotka.py</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-center">
                        <Database size={16} className="mx-auto text-blue-600 mb-1" />
                        <p className="font-bold text-blue-800 text-xs">Bradford</p>
                        <p className="text-[10px] text-blue-600">bradford.py</p>
                      </div>
                      <div className="bg-violet-50 border border-violet-300 rounded-lg p-3 text-center">
                        <Database size={16} className="mx-auto text-violet-600 mb-1" />
                        <p className="font-bold text-violet-800 text-xs">Zipf</p>
                        <p className="text-[10px] text-violet-600">zipf.py</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-center">
                        <Database size={16} className="mx-auto text-amber-600 mb-1" />
                        <p className="font-bold text-amber-800 text-xs">Price</p>
                        <p className="text-[10px] text-amber-600">price.py</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Component Descriptions */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Server size={22} className="text-slate-600" />
                  <h3 className="text-lg font-bold text-slate-800">{t.componentDesc}</h3>
                </div>
                <div className="space-y-4">
                  {/* Frontend */}
                  <div className="border border-blue-200 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-5 py-3 border-b border-blue-200">
                      <h4 className="font-bold text-blue-800">Frontend — Next.js 16 + React + TypeScript</h4>
                    </div>
                    <div className="px-5 py-4 text-sm text-slate-700 space-y-2">
                      <p><strong>page.tsx</strong> — {t.pageDesc}</p>
                      <p><strong>FileUpload.tsx</strong> — {t.fileUploadDesc}</p>
                      <p><strong>ResultsView.tsx</strong> — {t.resultsViewDesc}</p>
                      <p><strong>ChartComponent.tsx</strong> — {t.chartComponentDesc}</p>
                      <p><strong>api.ts</strong> — {t.apiTsDesc}</p>
                    </div>
                  </div>

                  {/* Backend */}
                  <div className="border border-green-200 rounded-xl overflow-hidden">
                    <div className="bg-green-50 px-5 py-3 border-b border-green-200">
                      <h4 className="font-bold text-green-800">Backend — FastAPI + Uvicorn + Python</h4>
                    </div>
                    <div className="px-5 py-4 text-sm text-slate-700 space-y-2">
                      <p><strong>api.py</strong> — {t.apiPyDesc}</p>
                      <p><strong>main.py</strong> — {t.mainPyDesc}</p>
                    </div>
                  </div>

                  {/* Analysis Modules */}
                  <div className="border border-emerald-200 rounded-xl overflow-hidden">
                    <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-200">
                      <h4 className="font-bold text-emerald-800">{t.scientometricModules}</h4>
                    </div>
                    <div className="px-5 py-4 text-sm text-slate-700 space-y-3">
                      <div>
                        <p className="font-semibold text-emerald-700">lotka.py — {t.lotka.name} (1926)</p>
                        <p>{t.lotkaDesc}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-700">bradford.py — {t.bradford.name} (1934)</p>
                        <p>{t.bradfordDesc}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-violet-700">zipf.py — {t.zipf.name} (1949)</p>
                        <p>{t.zipfDesc}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-amber-700">price.py — {t.price.name} (1963)</p>
                        <p>{t.priceDesc}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-rose-700">growth.py — {t.growth.name} (1963)</p>
                        <p>{lang === 'es' ? 'Analiza el crecimiento exponencial de la producción científica según la Ley de Price. Ajusta modelos exponencial y logístico, identifica las tres fases clásicas y calcula el tiempo de duplicación y año de inflexión.' : 'Analyzes exponential growth of scientific production according to Price\'s Law. Fits exponential and logistic models, identifies the three classical phases, and computes doubling time and inflection year.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Utilities */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                      <h4 className="font-bold text-slate-800">{t.utilities}</h4>
                    </div>
                    <div className="px-5 py-4 text-sm text-slate-700 space-y-2">
                      <p><strong>utils.py</strong> — {t.utilsPyDesc}</p>
                      <p><strong>start_metrixina.bat</strong> — {t.startBatDesc}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl text-center">
              <p className="text-xs text-slate-400">PLmetrix Lab v1.0.0 — {t.modalFooter}</p>
            </div>
          </div>
        </div>
      )}

      {/* User Manual Modal */}
      {showManual && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 text-white rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle size={18} />
                </div>
                <h2 className="text-xl font-bold">{t.manualTitle}</h2>
              </div>
              <button
                onClick={() => setShowManual(false)}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Introduction */}
              <section>
                <p className="text-slate-600 text-base leading-relaxed">{t.manualIntro}</p>
              </section>

              {/* General Workflow */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={22} className="text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-800">{t.manualWorkflow}</h3>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
                    <div className="flex items-start gap-3 pt-1">
                      <BookOpen size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700">{t.manualStep1}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <div className="flex items-start gap-3 pt-1">
                      <Upload size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700">{t.manualStep2}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
                    <div className="flex items-start gap-3 pt-1">
                      <BarChart size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700">{t.manualStep3}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">4</div>
                    <div className="flex items-start gap-3 pt-1">
                      <Download size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700">{t.manualStep4}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">5</div>
                    <div className="flex items-start gap-3 pt-1">
                      <ArrowLeft size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700">{t.manualStep5}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Module Details */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={22} className="text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-800">{t.manualFormats}</h3>
                </div>
                <div className="space-y-4">
                  {/* Lotka */}
                  <div className="border border-emerald-200 rounded-xl overflow-hidden">
                    <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-200 flex items-center gap-2">
                      <BookOpen size={18} className="text-emerald-600" />
                      <h4 className="font-bold text-emerald-800">{t.manualLotkaTitle}</h4>
                    </div>
                    <div className="px-5 py-4 text-sm text-slate-700 space-y-2">
                      <p><strong className="text-emerald-700">{t.manualFormats}:</strong> {t.manualLotkaFormats}</p>
                      <p>{t.manualLotkaData}</p>
                      <p className="bg-emerald-50 p-3 rounded-lg border border-emerald-100"><strong>📊 </strong>{t.manualLotkaResults}</p>
                    </div>
                  </div>

                  {/* Bradford */}
                  <div className="border border-blue-200 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-5 py-3 border-b border-blue-200 flex items-center gap-2">
                      <BarChart2 size={18} className="text-blue-600" />
                      <h4 className="font-bold text-blue-800">{t.manualBradfordTitle}</h4>
                    </div>
                    <div className="px-5 py-4 text-sm text-slate-700 space-y-2">
                      <p><strong className="text-blue-700">{t.manualFormats}:</strong> {t.manualBradfordFormats}</p>
                      <p>{t.manualBradfordData}</p>
                      <p className="bg-blue-50 p-3 rounded-lg border border-blue-100"><strong>📊 </strong>{t.manualBradfordResults}</p>
                    </div>
                  </div>

                  {/* Zipf */}
                  <div className="border border-violet-200 rounded-xl overflow-hidden">
                    <div className="bg-violet-50 px-5 py-3 border-b border-violet-200 flex items-center gap-2">
                      <FileText size={18} className="text-violet-600" />
                      <h4 className="font-bold text-violet-800">{t.manualZipfTitle}</h4>
                    </div>
                    <div className="px-5 py-4 text-sm text-slate-700 space-y-2">
                      <p><strong className="text-violet-700">{t.manualFormats}:</strong> {t.manualZipfFormats}</p>
                      <p>{t.manualZipfData}</p>
                      <p className="bg-violet-50 p-3 rounded-lg border border-violet-100"><strong>📊 </strong>{t.manualZipfResults}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="border border-amber-200 rounded-xl overflow-hidden">
                    <div className="bg-amber-50 px-5 py-3 border-b border-amber-200 flex items-center gap-2">
                      <Activity size={18} className="text-amber-600" />
                      <h4 className="font-bold text-amber-800">{t.manualPriceTitle}</h4>
                    </div>
                    <div className="px-5 py-4 text-sm text-slate-700 space-y-2">
                      <p><strong className="text-amber-700">{t.manualFormats}:</strong> {t.manualPriceFormats}</p>
                      <p>{t.manualPriceData}</p>
                      <p className="bg-amber-50 p-3 rounded-lg border border-amber-100"><strong>📊 </strong>{t.manualPriceResults}</p>
                    </div>
                  </div>

                  {/* Growth */}
                  <div className="border border-rose-200 rounded-xl overflow-hidden">
                    <div className="bg-rose-50 px-5 py-3 border-b border-rose-200 flex items-center gap-2">
                      <TrendingUp size={18} className="text-rose-600" />
                      <h4 className="font-bold text-rose-800">{t.manualGrowthTitle}</h4>
                    </div>
                    <div className="px-5 py-4 text-sm text-slate-700 space-y-2">
                      <p><strong className="text-rose-700">{t.manualFormats}:</strong> {t.manualGrowthFormats}</p>
                      <p>{t.manualGrowthData}</p>
                      <p className="bg-rose-50 p-3 rounded-lg border border-rose-100"><strong>📊 </strong>{t.manualGrowthResults}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* PDF Export */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Download size={22} className="text-slate-600" />
                  <h3 className="text-lg font-bold text-slate-800">{t.manualPdfExport}</h3>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-slate-700 text-sm">{t.manualPdfDesc}</p>
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl text-center">
              <p className="text-xs text-slate-400">PLmetrix Lab v1.0.0 — {t.modalFooter}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
