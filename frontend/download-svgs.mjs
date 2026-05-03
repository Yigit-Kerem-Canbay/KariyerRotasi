import fs from 'fs';
import path from 'path';
import https from 'https';

const logoUrls = {
    'aselsan.com': 'https://upload.wikimedia.org/wikipedia/commons/d/de/Aselsan_logo.svg',
    'ford.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Ford_Motor_Company_Logo.svg',
    'trendyol.com': 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Trendyol_logo.svg',
    'yemeksepeti.com': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Yemeksepeti_logo.svg',
    'getir.com': 'https://upload.wikimedia.org/wikipedia/commons/4/41/Getir_logo.svg',
    'sokmarket.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/a/aa/%C5%9Eok_Market_logo.svg',
    'bim.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/2/22/Bim_logo.svg',
    'migros.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Migros_logo.svg',
    'koc.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Koc_Holding_logo.svg',
    'sabanci.com': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Sabanc%C4%B1_Holding_logo.svg',
    'turkcell.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Turkcell_logo.svg',
    'turktelekom.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Turk_Telekom_Logo.svg',
    'vodafone.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Vodafone_icon.svg',
    'akbank.com': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Akbank_logo.svg',
    'garantibbva.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Garanti_BBVA_logo.svg',
    'yapikredi.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Yapi_Kredi_logo.svg',
    'turkishairlines.com': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Turkish_Airlines_logo.svg',
    'flypgs.com': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Pegasus_Airlines_logo.svg',
    'tusas.com': 'https://upload.wikimedia.org/wikipedia/commons/1/11/Turkish_Aerospace_Industries_logo.svg',
    'roketsan.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Roketsan_logo.svg',
    'havelsan.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Havelsan_logo.svg',
    'beko.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Beko_logo.svg',
    'arcelik.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Arcelik_Logo.svg',
    'vestel.com.tr': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Vestel_logo.svg',
    'lcwaikiki.com': 'https://upload.wikimedia.org/wikipedia/commons/1/19/LC_Waikiki_logo.svg',
    'defacto.com': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/DeFacto_logo.svg',
    'koton.com': 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Koton_logo.svg',
    'qnbfinansbank.com': 'https://upload.wikimedia.org/wikipedia/commons/1/14/QNB_Finansbank_logo.svg'
};

const dir = path.join(process.cwd(), 'public', 'logos');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Custom delay function
const sleep = ms => new Promise(r => setTimeout(r, ms));

const downloadSVG = (url, filepath) => {
    return new Promise((resolve, reject) => {
        // Wikipedia requires a valid user agent
        const options = {
            headers: { 
                'User-Agent': 'KariyerRotasiBot/1.0 (https://github.com; kariyer@example.com)' 
            }
        };
        
        https.get(url, options, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(true);
                });
                file.on('error', (err) => {
                    fs.unlink(filepath, () => reject(err));
                });
            } else if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) {
                downloadSVG(res.headers.location, filepath).then(resolve).catch(reject);
            } else {
                console.error(`Status ${res.statusCode} for ${url}`);
                resolve(false);
            }
        }).on('error', reject);
    });
};

async function main() {
    for (const [domain, url] of Object.entries(logoUrls)) {
        // Save as .png even though it's SVG data, because Next.js <Image> looks for .png in our current code
        // Wait, if we save SVG data into a .png file, it might not render properly in all browsers. 
        // Let's save it as .svg! I will update the react code to check for .svg first, or just use .svg directly.
        const filepath = path.join(dir, `${domain}.svg`);
        
        console.log(`Downloading SVG for ${domain}...`);
        try {
            let success = await downloadSVG(url, filepath);
            if (success) {
                console.log(`✓ Downloaded ${domain}.svg`);
            } else {
                console.log(`✗ Failed to download ${domain}.svg`);
            }
        } catch (e) {
            console.error(`Error downloading ${domain}.svg:`, e.message);
        }
        
        // Wait 1 second between requests to prevent 429 Too Many Requests
        await sleep(1000);
    }
    console.log('Finished downloading SVGs.');
}

main();
