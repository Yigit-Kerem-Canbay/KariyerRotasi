import fs from 'fs';
import path from 'path';
import https from 'https';

const domains = [
    'aselsan.com', 'ford.com.tr', 'trendyol.com', 'yemeksepeti.com', 'getir.com', 
    'a101.com.tr', 'sokmarket.com.tr', 'bim.com.tr', 'migros.com.tr', 'koc.com.tr', 
    'sabanci.com', 'turkcell.com.tr', 'turktelekom.com.tr', 'vodafone.com.tr', 
    'akbank.com', 'garantibbva.com.tr', 'yapikredi.com.tr', 'qnbfinansbank.com', 
    'turkishairlines.com', 'flypgs.com', 'tusas.com', 'roketsan.com.tr', 'havelsan.com.tr', 
    'beko.com.tr', 'arcelik.com.tr', 'vestel.com.tr', 'lcwaikiki.com', 'defacto.com', 'koton.com', 'misas.com.tr'
];

const dir = path.join(process.cwd(), 'public', 'logos');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(true));
            } else if (res.statusCode === 301 || res.statusCode === 302) {
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            } else {
                resolve(false);
            }
        }).on('error', reject);
    });
};

async function main() {
    for (const domain of domains) {
        const filepath = path.join(dir, `${domain}.png`);
        if (fs.existsSync(filepath)) {
            console.log(`Skipping ${domain}, already exists.`);
            continue;
        }

        console.log(`Downloading ${domain}...`);
        try {
            // Try Google Favicons first
            let success = await downloadImage(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`, filepath);
            if (success) {
                console.log(`✓ Downloaded ${domain}`);
            } else {
                console.log(`✗ Failed to download ${domain}`);
            }
        } catch (e) {
            console.error(`Error downloading ${domain}:`, e.message);
        }
    }
    console.log('Finished downloading logos.');
}

main();
