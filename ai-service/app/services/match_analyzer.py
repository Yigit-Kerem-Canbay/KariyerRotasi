import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def analyze_job_match_with_gemini(user_profile: dict, job_details: dict) -> dict:
    prompt = f"""
    Sen uzman bir İK uzmanı ve kariyer danışmanısın.
    Adayın profil bilgilerini (yetenekler, eğitim, deneyim, maaş beklentisi, konum tercihleri vb.) ve iş ilanının gereksinimlerini (istenilen yetenekler, çalışma modeli, konum, maaş aralığı vb.) detaylıca karşılaştırıp bir UYUM ANALİZİ yap.
    
    Adayın Yetenekleri/Profili:
    {user_profile}

    İş İlanının Detayları:
    {job_details}

    Aşağıdaki JSON formatında yanıt ver:
    {{
        "matchedSkills": ["Eşleşen Yetenek 1", "Eşleşen Yetenek 2"],
        "missingSkills": ["Eksik Yetenek 1", "Eksik Yetenek 2"],
        "recommendation": "1-2 paragraflık samimi ve profesyonel tavsiye yazısı. (Örn: Yetenekleriniz bu pozisyonla büyük ölçüde uyuşuyor. Çalışma şekli ve konum beklentileriniz ilana uygun. Ancak maaş beklentiniz ilanın biraz üzerinde kalabilir. Ayrıca React bilginiz harika ancak istenen AWS deneyimini güçlendirmeniz önerilir...)"
    }}
    
    Sadece JSON çıktısı ver.
    """

    if not client:
        return {"error": "Gemini API key is missing. Please set GEMINI_API_KEY."}

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        result = response.text.strip()
        if result.startswith("```json"):
            result = result[7:]
        if result.endswith("```"):
            result = result[:-3]
            
        import json
        data = json.loads(result)
        return data
    except Exception as e:
        print("Match Analysis Error:", e)
        return {"error": "Could not analyze match with Gemini"}
