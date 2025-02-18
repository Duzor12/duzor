import B2 from 'backblaze-b2';

const b2 = new B2({
    applicationKeyId: '005bcbcde84ebff0000000001',
    applicationKey: 'davidMediaKey'
});

let authResponse: any = null;
let bucketName = 'davidmedia';
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
    
    // Construct the URL using the endpoint and bucket name
    return `${endpoint}/${bucketName}/${cleanPath}`;
}

// Initialize B2 on module load
ensureAuthorized().catch(console.error); 