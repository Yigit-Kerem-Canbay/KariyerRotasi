from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.cv_parser import extract_text_from_pdf, parse_cv_with_gemini

app = FastAPI(title="Kariyer Rotası AI Service")

# Allow backend and frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "AI Service v2"}

@app.post("/parse-cv")
async def parse_cv(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        content = await file.read()
        
        # 1. Extract raw text from PDF
        text = extract_text_from_pdf(content)
        
        if len(text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF. It might be an image-based PDF.")

        # 2. Send text to Gemini API for HR parsing
        parsed_data = parse_cv_with_gemini(text)
        
        if "error" in parsed_data:
            raise HTTPException(status_code=500, detail="Failed to parse CV with AI")
            
        return {"success": True, "data": parsed_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class MatchRequest(BaseModel):
    user_profile: dict
    job_details: dict

@app.post("/analyze-match")
async def analyze_match(req: MatchRequest):
    try:
        from app.services.match_analyzer import analyze_job_match_with_gemini
        result = analyze_job_match_with_gemini(req.user_profile, req.job_details)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
