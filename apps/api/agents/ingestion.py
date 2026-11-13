import re
from typing import Dict, Any, List

class IngestionAgent:
    """
    Ingests raw text, markdown, or documents, calculates character spans,
    segments content, and creates sanitized versions for LLM processing.
    """
    def process(self, content_text: str, content_type: str = "text") -> Dict[str, Any]:
        cleaned_text = content_text.strip()
        
        # Segment into sentences with exact character offsets
        sentence_spans = []
        pattern = r'[^.!?]+[.!?]?'
        for match in re.finditer(pattern, cleaned_text):
            span_text = match.group(0).strip()
            if span_text:
                sentence_spans.append({
                    "start": match.start(),
                    "end": match.end(),
                    "text": span_text
                })
                
        # Word count, char count
        words = re.findall(r'\b\w+\b', cleaned_text)
        word_count = len(words)
        char_count = len(cleaned_text)

        return {
            "raw_text": cleaned_text,
            "char_count": char_count,
            "word_count": word_count,
            "sentence_spans": sentence_spans,
            "has_images": False,
            "ocr_applied": False
        }

ingestion_agent = IngestionAgent()
