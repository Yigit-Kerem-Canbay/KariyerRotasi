import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public', 'logos');
const files = fs.readdirSync(dir);

for (const file of files) {
    if (file.endsWith('.png')) {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.size < 2500) {
            console.log(`Deleting blurry/small icon: ${file} (${stats.size} bytes)`);
            fs.unlinkSync(filepath);
        }
    }
}
console.log("Cleanup complete.");
