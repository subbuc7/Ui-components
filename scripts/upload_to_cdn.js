const cloudinary = require('cloudinary').v2;

const filePath = process.argv;
if (!filePath) {
  console.error('Error: Please provide a file path to upload.');
  process.exit(1);
}

cloudinary.config();

cloudinary.uploader.upload(filePath, {
  resource_type: 'video',
  folder: 'instagram_reels'
})
.then(result => {
  if (!result.secure_url) {
    console.error('Upload succeeded but no secure_url returned:', result);
    process.exit(1);
  }
  console.log(result.secure_url);
})
.catch(error => {
  console.error('Cloudinary Upload Error:', error);
  process.exit(1);
});
