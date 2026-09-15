const fs = require('fs');

async function main() {
  const filePath = 'output.mp4';
  let publicUrl = null;

  // 1. Try Cloudinary
  let rawUrl = (process.env.CLOUDINARY_URL || '').replace(/^CLOUDINARY_URL=/, '').trim();
  if (rawUrl.startsWith('cloudinary://')) {
    try {
      const cloudinary = require('cloudinary').v2;
      const match = rawUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        cloudinary.config({
          api_key: match,
          api_secret: match,
          cloud_name: match
        });
      }
      const res = await cloudinary.uploader.upload(filePath, {
        resource_type: 'video'
      });
      if (res && res.secure_url) {
        publicUrl = res.secure_url;
      }
    } catch (err) {
      console.error('Cloudinary notice, falling back to CDN:', err.message || err);
    }
  }

  // 2. Fallback to Uguu (tested & working in your news bot)
  if (!publicUrl) {
    try {
      const formData = new FormData();
      const fileBlob = new Blob([fs.readFileSync(filePath)]);
      formData.append('files[]', fileBlob, 'output.mp4');

      const res = await fetch('https://uguu.se/upload.php', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.files && data.files.length > 0) {
        publicUrl = data.files[0].url;
      }
    } catch (err) {
      console.error('Uguu fallback notice:', err.message || err);
    }
  }

  // 3. Fallback to Catbox
  if (!publicUrl) {
    try {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      const fileBlob = new Blob([fs.readFileSync(filePath)]);
      formData.append('fileToUpload', fileBlob, 'output.mp4');

      const res = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      });
      const text = await res.text();
      if (text.startsWith('http')) {
        publicUrl = text.trim();
      }
    } catch (err) {
      console.error('Catbox fallback notice:', err.message || err);
    }
  }

  if (publicUrl) {
    // Only print the clean URL to stdout so GitHub Actions captures it
    console.log(publicUrl);
  } else {
    console.error('Error: All CDN upload providers failed.');
    process.exit(1);
  }
}

main();
