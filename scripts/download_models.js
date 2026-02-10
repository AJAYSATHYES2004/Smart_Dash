const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_URL_BASE = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');

const models = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1'
];

// Ensure models directory exists
if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✓ Downloaded: ${path.basename(dest)}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function downloadModels() {
    console.log('Downloading face-api.js models...\n');

    for (const model of models) {
        const url = `${MODEL_URL_BASE}/${model}`;
        const dest = path.join(MODELS_DIR, model);

        try {
            await downloadFile(url, dest);
        } catch (err) {
            console.error(`✗ Failed to download ${model}:`, err.message);
        }
    }

    console.log('\n✓ All models downloaded successfully!');
}

downloadModels();
