# Adyen Platform Scoping Questionnaire

A guided questionnaire app for Adyen platform integration scoping. Responses are automatically saved to your Google Sheet.

## Features

- ✅ Step-by-step wizard interface
- ✅ Auto-save progress (customers can exit and resume)
- ✅ Google Sheets integration
- ✅ Conditional sections (POS questions only show if relevant)
- ✅ Export to JSON/CSV
- ✅ Links to Adyen documentation
- ✅ Mobile-friendly

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Google Sheets (10 minutes)

**Create your Google Sheet:**

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it "Adyen Scoping Responses"

**Add the Apps Script:**

1. Go to **Extensions → Apps Script**
2. Delete existing code and paste this:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    if (headers[0] === '' || headers.length === 0) {
      headers = Object.keys(data);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    var row = headers.map(function(header) {
      var value = data[header];
      if (value === undefined || value === null) return '';
      if (Array.isArray(value)) return value.join(', ');
      return value;
    });
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click **Save**

**Deploy as Web App:**

1. Click **Deploy → New deployment**
2. Select **Web app**
3. Set "Who has access" to **Anyone**
4. Click **Deploy** and authorize
5. **Copy the Web app URL**

### 3. Add your Google Script URL

Open `app/page.js` and find this line near the top:

```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
```

Replace with your URL:

```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/ABC123.../exec';
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/adyen-questionnaire.git
git push -u origin main
```

Then go to [vercel.com](https://vercel.com), import your repo, and deploy.

## How It Works

```
Customer visits        Fills out           Clicks Submit      New row in
your-app.vercel.app → questionnaire   →   Responses     →   Google Sheet
                      (auto-saves)
```

## Your Google Sheet

| timestamp | contact_name | contact_email | platform_name | business_model | ... |
|-----------|--------------|---------------|---------------|----------------|-----|
| 2024-12-15T14:30:00Z | John Smith | john@acme.com | Acme Platform | payfac | ... |

## Optional: Email Notifications

Add this to your Apps Script to get notified on each submission:

```javascript
// Add after sheet.appendRow(row)
MailApp.sendEmail({
  to: 'your-email@company.com',
  subject: 'New Submission: ' + data.platform_name,
  body: 'New submission from ' + data.contact_name
});
```

## Customization

- Edit questions in `app/page.js` → `questionnaire` object
- Change colors: search for `emerald` and `slate` classes
- Add logo: place in `public/` folder and import

## Support

For issues with the questionnaire app, check the browser console for errors.
For Adyen integration questions, visit [docs.adyen.com](https://docs.adyen.com/platforms).
