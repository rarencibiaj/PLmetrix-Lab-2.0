from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
import traceback
import logging
from .lotka import calculate_lotka
from .bradford import calculate_bradford
from .zipf import calculate_zipf
from .price import calculate_price_index
from .utils import read_file_content

logger = logging.getLogger(__name__)

router = APIRouter()


def read_dataframe(content: bytes, filename: str, drop_pct_columns: bool = False) -> pd.DataFrame:
    """Read uploaded file into a DataFrame. Supports .csv, .xlsx, and .txt (tab-separated)."""
    if filename.endswith('.csv'):
        df = pd.read_csv(io.BytesIO(content))
    elif filename.endswith('.txt'):
        # Web of Science exports are tab-separated
        text = content.decode('utf-8-sig')  # utf-8-sig handles BOM
        df = pd.read_csv(io.StringIO(text), sep='\t')
    else:
        df = pd.read_excel(io.BytesIO(content))

    if drop_pct_columns:
        # Drop columns like "% of 1234" from Web of Science exports
        pct_cols = [c for c in df.columns if str(c).strip().startswith('%')]
        if pct_cols:
            logger.info(f"Dropping percentage columns: {pct_cols}")
            df = df.drop(columns=pct_cols)

    return df


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize column names: strip whitespace and lowercase."""
    df.columns = [col.strip().lower().replace(' ', '_') for col in df.columns]
    return df


def detect_lotka_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Detect and prepare columns for Lotka analysis.
    
    Lotka's Law needs:
      - n_publications: number of publications (1, 2, 3, ...)
      - n_authors: number of authors with exactly n publications
    
    Handles two input formats:
    1. Pre-aggregated: two numeric columns (n_publications, n_authors)
    2. Raw data: author names + article counts -> auto-aggregates into Lotka format
    """
    import unicodedata

    df = normalize_columns(df)

    # Strip accents for matching (e.g., 'artículos' -> 'articulos')
    def strip_accents(s):
        return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

    col_map = {strip_accents(c): c for c in df.columns}

    # If exact columns exist and both are numeric, return as-is
    if 'n_publications' in df.columns and 'n_authors' in df.columns:
        return df

    numeric_cols = df.select_dtypes(include='number').columns.tolist()
    text_cols = df.select_dtypes(include=['object', 'string']).columns.tolist()

    logger.info(f"Lotka: numeric_cols={numeric_cols}, text_cols={text_cols}, all_cols={list(df.columns)}")

    # CASE 1: One text column + one numeric column = raw author data
    # This means: column of author/journal names + column of article counts
    # We need to AGGREGATE: count how many authors have 1 article, 2 articles, etc.
    if len(text_cols) >= 1 and len(numeric_cols) >= 1:
        # Find the best text and numeric columns
        name_col = text_cols[0]
        count_col = numeric_cols[0]

        # Check common name aliases to pick the right ones
        name_aliases = ['authors', 'author', 'autores', 'autor', 'name', 'nombre',
                        'journal', 'revista', 'source', 'fuente']
        count_aliases = ['articles', 'articulos', 'papers', 'publications', 'publicaciones',
                         'count', 'frequency', 'frecuencia', 'works', 'contributions',
                         'record_count', 'records', 'record count']

        for alias in name_aliases:
            actual = col_map.get(alias)
            if actual and actual in text_cols:
                name_col = actual
                break

        for alias in count_aliases:
            actual = col_map.get(alias)
            if actual and actual in numeric_cols:
                count_col = actual
                break

        logger.info(f"Lotka: Raw data detected. Aggregating '{name_col}' by '{count_col}'")

        # Aggregate: group by the count value, count how many authors have that count
        freq_dist = df[count_col].value_counts().sort_index().reset_index()
        freq_dist.columns = ['n_publications', 'n_authors']
        freq_dist = freq_dist[freq_dist['n_publications'] > 0].reset_index(drop=True)

        logger.info(f"Lotka: Aggregated into {len(freq_dist)} rows: {freq_dist.head().to_dict()}")
        return freq_dist

    # CASE 2: Two or more numeric columns = pre-aggregated Lotka data
    if len(numeric_cols) >= 2:
        pub_col = numeric_cols[0]
        auth_col = numeric_cols[1]

        # Try alias detection for better mapping
        pub_aliases = ['n_publications', 'publications', 'n', 'x', 'publicaciones',
                       'articles', 'articulos', 'papers', 'contributions']
        author_aliases_list = ['n_authors', 'authors', 'an', 'y', 'autores',
                               'frequency', 'frecuencia', 'count']

        for alias in pub_aliases:
            actual = col_map.get(alias)
            if actual and actual in numeric_cols:
                pub_col = actual
                break

        for alias in author_aliases_list:
            actual = col_map.get(alias)
            if actual and actual in numeric_cols and actual != pub_col:
                auth_col = actual
                break

        logger.info(f"Lotka: Pre-aggregated data. Mapping '{pub_col}' -> n_publications, '{auth_col}' -> n_authors")
        df = df.rename(columns={pub_col: 'n_publications', auth_col: 'n_authors'})
        return df[['n_publications', 'n_authors']].dropna()

    raise ValueError(
        f"Cannot process file for Lotka's Law. Found columns: {list(df.columns)}. "
        f"Your file should have either: (a) author names + article counts, "
        f"or (b) two numeric columns for n_publications and n_authors."
    )


def detect_bradford_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Try to detect and rename columns for Bradford analysis.
    Expects: journal name and article count columns.
    """
    df = normalize_columns(df)

    if 'journal' in df.columns and 'articles' in df.columns:
        return df

    journal_aliases = ['journal', 'journal_name', 'revista', 'source', 'fuente',
                       'journal_title', 'title', 'nombre', 'publication_titles',
                       'publication_title', 'source_titles', 'source_title']
    article_aliases = ['articles', 'n_articles', 'article_count', 'articulos',
                       'count', 'frequency', 'frecuencia', 'papers', 'num_articles',
                       'record_count', 'records']

    journal_col = None
    article_col = None

    for alias in journal_aliases:
        if alias in df.columns:
            journal_col = alias
            break

    for alias in article_aliases:
        if alias in df.columns:
            article_col = alias
            break

    # Fallback: first string column = journal, first numeric column = articles
    if journal_col is None:
        str_cols = df.select_dtypes(include='object').columns.tolist()
        if str_cols:
            journal_col = str_cols[0]

    if article_col is None:
        num_cols = df.select_dtypes(include='number').columns.tolist()
        if num_cols:
            article_col = num_cols[0]

    if journal_col is None or article_col is None:
        raise ValueError(
            f"Cannot detect columns. Found: {list(df.columns)}. "
            f"Expected 'journal' and 'articles', or one text and one numeric column."
        )

    df = df.rename(columns={journal_col: 'journal', article_col: 'articles'})
    return df


@router.post("/analyze/lotka")
async def analyze_lotka(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.csv', '.txt')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload .xlsx, .csv, or .txt")

    try:
        content = await file.read()
        df = read_dataframe(content, file.filename, drop_pct_columns=True)
        logger.info(f"Lotka upload: columns={list(df.columns)}, shape={df.shape}")
        df = detect_lotka_columns(df)
        result = calculate_lotka(df)
        return result
    except ValueError as e:
        logger.warning(f"Lotka ValueError: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Lotka unexpected error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.post("/analyze/bradford")
async def analyze_bradford(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.csv', '.txt')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload .xlsx, .csv, or .txt")

    try:
        content = await file.read()
        df = read_dataframe(content, file.filename, drop_pct_columns=True)
        logger.info(f"Bradford upload: columns={list(df.columns)}, shape={df.shape}")
        df = detect_bradford_columns(df)
        result = calculate_bradford(df)
        return result
    except ValueError as e:
        logger.warning(f"Bradford ValueError: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Bradford unexpected error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.post("/analyze/zipf")
async def analyze_zipf(file: UploadFile = File(...)):
    try:
        text = await read_file_content(file)
        if not text or len(text.strip()) == 0:
            raise ValueError("The uploaded file is empty or could not be read.")
        result = calculate_zipf(text)
        return result
    except ValueError as e:
        logger.warning(f"Zipf ValueError: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Zipf unexpected error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.post("/analyze/price")
async def analyze_price(file: UploadFile = File(...)):
    try:
        text = await read_file_content(file)
        if not text or len(text.strip()) == 0:
            raise ValueError("The uploaded file is empty or could not be read.")
        result = calculate_price_index(text)
        return result
    except ValueError as e:
        logger.warning(f"Price ValueError: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Price unexpected error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
