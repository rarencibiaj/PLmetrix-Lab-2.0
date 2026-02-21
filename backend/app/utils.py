import io
from fastapi import UploadFile
import pypdf
import docx

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extracts text from a PDF file."""
    try:
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise ValueError(f"Error reading PDF: {str(e)}")

def extract_text_from_docx(file_content: bytes) -> str:
    """Extracts text from a DOCX file."""
    try:
        doc = docx.Document(io.BytesIO(file_content))
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        raise ValueError(f"Error reading DOCX: {str(e)}")

async def read_file_content(file: UploadFile) -> str:
    """Reads file content and returns text based on extension."""
    content = await file.read()
    filename = file.filename.lower()
    
    if filename.endswith('.pdf'):
        return extract_text_from_pdf(content)
    elif filename.endswith('.docx'):
        return extract_text_from_docx(content)
    elif filename.endswith('.txt'):
        return content.decode('utf-8')
    else:
        raise ValueError("Unsupported file format. Please upload .pdf, .docx, or .txt")
