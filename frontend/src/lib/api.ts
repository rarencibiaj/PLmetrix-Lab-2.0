import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LotkaResult {
    exponent_c: number;
    constant_A1: number;
    r_squared: number;
    ks_statistic: number;
    ks_p_value: number;
    fit_status: string;
    plot_data: {
        n: number[];
        An_empirical: number[];
        An_theoretical: number[];
    };
}

export interface BradfordResult {
    zones_count: number;
    articles_per_zone: number[];
    journals_per_zone: number[];
    bradford_multiplier_k: number;
    core_journals: string[];
    plot_data: {
        rank: number[];
        cumulative_articles: number[];
        log_rank: number[];
        zone_labels?: number[];
    };
}

export interface ZipfResult {
    exponent_s: number;
    r_squared: number;
    top_50_words: { word: string; frequency: number; rank: number }[];
    total_words: number;
    unique_words: number;
    plot_data: {
        rank: number[];
        frequency: number[];
        log_rank: number[];
        log_frequency: number[];
    };
}

export interface PriceResult {
    price_index_percent: number;
    total_references: number;
    recent_references: number;
    interpretation: string;
    plot_data: {
        years: number[];
        counts: number[];
    };
}

export const analyzeLotka = async (file: File): Promise<LotkaResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/api/analyze/lotka`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const analyzeBradford = async (file: File): Promise<BradfordResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/api/analyze/bradford`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const analyzeZipf = async (file: File): Promise<ZipfResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/api/analyze/zipf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const analyzePrice = async (file: File): Promise<PriceResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/api/analyze/price`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export interface GrowthResult {
    N0: number;
    b_constant: number;
    doubling_time: number | null;
    r_squared_exp: number;
    r_squared_logistic: number;
    K_capacity: number;
    logistic_r: number;
    field_phase: string;
    inflection_year: number | null;
    phases: {
        pre_scientific: { start: number; end: number } | null;
        exponential: { start: number; end: number } | null;
        stabilization: { start: number; end: number } | null;
    };
    total_years: number;
    total_records: number;
    plot_data: {
        years: number[];
        observed: number[];
        fitted_exponential: number[];
        fitted_logistic: number[];
    };
}

export const analyzeGrowth = async (file: File): Promise<GrowthResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/api/analyze/growth`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
