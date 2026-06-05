const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function run() {
  try {
    const formData = new FormData();
    const buffer = fs.readFileSync('./backend/uploads/cvs/f705402f-167a-4025-a351-b645011d9f6e.pdf');
    
    formData.append('file', buffer, {
      filename: 'Yiğit_Kerem_Canbay_CV (1).pdf',
      contentType: 'application/pdf',
    });

    const aiResponse = await axios.post(
      'http://localhost:8000/parse-cv',
      formData,
      { headers: formData.getHeaders() }
    );
    console.log("Success:", aiResponse.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
run();
