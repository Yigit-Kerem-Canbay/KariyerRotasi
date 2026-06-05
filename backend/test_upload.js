const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function run() {
  try {
    const payload = {
      sub: "233de84b-4ef2-4852-9c9a-516f57a62ed6",
      role: "STUDENT"
    };
    const token = jwt.sign(payload, "dev_secret_change_me", { expiresIn: '1h' });

    const formData = new FormData();
    const buffer = fs.readFileSync('./uploads/cvs/f705402f-167a-4025-a351-b645011d9f6e.pdf');
    
    formData.append('file', buffer, {
      filename: 'Yiğit_Kerem_Canbay_CV (1).pdf',
      contentType: 'application/pdf',
    });

    console.log("Uploading with token:", token);
    const res = await axios.post(
      'http://localhost:4000/api/users/me/upload-cv',
      formData,
      { 
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        } 
      }
    );
    console.log("Success:", JSON.stringify(res.data).substring(0, 200));
  } catch (err) {
    if (err.response) {
      console.error("HTTP Error:", err.response.status, err.response.data);
    } else {
      console.error("Network/Other Error:", err.message);
    }
  }
}
run();
