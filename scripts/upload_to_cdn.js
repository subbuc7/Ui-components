const cloudinary = require('cloudinary').v2;

// Hardcoded string path — guarantees no Array type errors
const filePath = 'output.mp4';

cloudinary.config();

cloudinary.uploader.upload(filePath, {
  resource_type: 'video',
  folder: 'instagram_reels'
})
.then(result => {
  if (!result.secure_url) {
    console.error('Upload failed, no secure_url returned:', result);
    process.exit(1);
  }
  console.log(result.secure_url);
})
.catch(err => {
  console.error('Cloudinary upload error:', err);
  process.exit(1);
});
