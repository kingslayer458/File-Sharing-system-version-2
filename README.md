# File-Sharing-system-version-2
A simple online file-sharing system that supports various file types and generates shareable links via tmpfiles.org

## Limits:
- **Max File Size**: 100MB
- **Time Limit**: 1 Hour


## Installation

Clone the repository:
```sh
git clone https://github.com/kingslayer458/File-Sharing-system-version-2.git
cd file-sharing-system
```



## API Endpoints

### Upload File
```
POST /upload
```
**Request:**
- Form-data with a file field (`file`)

**Response:**
```json
{
  "status": "success",
  "url": "https://tmpfile.org/xyz123"
}
```

### Download File
Simply open the provided URL in the response to download the file.
## Usage
1. Open `index.html` in a browser.
2. Upload files via drag & drop or file selection.
3. Click "Share Files" to generate a link.
4. Share the link or QR code for downloads.


Built by Manoj Kumar
