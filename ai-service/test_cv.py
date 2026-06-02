import os
import asyncio
from app.services.cv_parser import extract_text_from_pdf, parse_cv_with_gemini

async def test():
    try:
        print("Creating dummy PDF...")
        import reportlab.pdfgen.canvas
        c = reportlab.pdfgen.canvas.Canvas("test.pdf")
        c.drawString(100, 750, "Mert Yılmaz - Yazılım Mühendisi. Java ve Python biliyorum. 2020'den beri Google'da çalışıyorum.")
        c.save()

        with open("test.pdf", "rb") as f:
            pdf_bytes = f.read()

        print("Extracting text...")
        text = extract_text_from_pdf(pdf_bytes)
        print("Text extracted:", text)

        print("Parsing with Gemini...")
        data = parse_cv_with_gemini(text)
        print("Gemini data:", data)
    except Exception as e:
        print("ERROR:", str(e))
    finally:
        if os.path.exists("test.pdf"):
            os.remove("test.pdf")

if __name__ == "__main__":
    asyncio.run(test())
