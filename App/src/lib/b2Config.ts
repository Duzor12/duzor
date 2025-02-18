import B2 from 'backblaze-b2';

const b2 = new B2({
    applicationKeyId: import.meta.env.VITE_B2_APPLICATION_KEY_ID,
    applicationKey: import.meta.env.VITE_B2_APPLICATION_KEY
});

let authResponse: any = null;
let bucketName = import.meta.env.VITE_B2_BUCKET_NAME;
let cdnUrl = import.meta.env.VITE_B2_CDN_URL;
const endpoint = 'https://s3.us-east-005.backblazeb2.com';

async function ensureAuthorized() {
    if (!authResponse) {
        authResponse = await b2.authorize();
    }
    return authResponse;
}

export function getAssetUrl(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.replace(/^\//, '');
    
    // If CDN URL is configured, use it
    if (cdnUrl) {
        return `${cdnUrl.replace(/\/$/, '')}/${cleanPath}`;
    }
    
    // Use direct S3-style URL
    return `${endpoint}/${bucketName}/${cleanPath}`;
}

// Initialize B2 on module load
ensureAuthorized().catch(console.error); 