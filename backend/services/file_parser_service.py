import io
import pdfplumber
from docx import Document


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extract_text(file_bytes: bytes, content_type: str) -> str:
    if "pdf" in content_type.lower():
        return extract_text_from_pdf(file_bytes)
    elif "docx" in content_type.lower() or "word" in content_type.lower() or "openxmlformats" in content_type.lower():
        return extract_text_from_docx(file_bytes)
    raise ValueError("Unsupported file type. Only PDF and DOCX are accepted.")
