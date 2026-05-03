import https from 'https';

https.get('https://logo.clearbit.com/koc.com.tr', (res) => {
  console.log('Status:', res.statusCode);
}).on('error', (e) => {
  console.error('Error:', e.message);
});
