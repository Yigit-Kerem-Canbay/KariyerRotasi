import os
from sentence_transformers import SentenceTransformer

# Modeli belleğe yükle. İlk çalışmada indirecektir (yaklaşık 400-500MB)
# paraphrase-multilingual-MiniLM-L12-v2 modeli, Türkçe dahil 50+ dili destekler ve 384 boyutlu vektör döner.
print("Embedding modeli yükleniyor... Bu işlem ilk seferinde biraz zaman alabilir.")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
print("Embedding modeli başarıyla yüklendi!")

def generate_embedding(text: str) -> list[float]:
    """
    Verilen metin için 384 boyutlu bir embedding vektörü döndürür.
    """
    if not text or not text.strip():
        # Boş metin gelirse 0 vektörü dönebiliriz veya hata fırlatabiliriz
        return [0.0] * 384
        
    # Modeli çalıştırıp vektörü listeye çeviriyoruz
    vector = model.encode(text)
    return vector.tolist()
