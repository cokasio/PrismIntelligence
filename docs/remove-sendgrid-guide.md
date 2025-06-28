# Migration: Remove SendGrid Dependency

## Option 1: Use Your Existing Attachment Loop

Your `attachmentIntelligenceLoop.ts` already monitors a folder for new files. Just:

1. Have users upload files via web interface
2. Save to the `incoming` folder
3. Let your existing loop process them
4. Display results in console or web UI

No email needed!

## Option 2: Simple Upload API

```typescript
// Add to routes.ts
router.post('/api/reports/upload', upload.single('report'), async (req, res) => {
  try {
    const file = req.file;
    const userEmail = req.body.email;
    
    // Save to your incoming folder
    const filePath = path.join(config.paths.incoming, file.originalname);
    await fs.writeFile(filePath, file.buffer);
    
    // Your existing processing will pick it up
    res.json({ 
      message: 'Report received and queued for processing',
      reportId: generateReportId()
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Check status endpoint
router.get('/api/reports/:id/status', async (req, res) => {
  const status = await getReportStatus(req.params.id);
  res.json(status);
});
```

## Option 3: Use CloudMailin (Email Still Works)

1. Sign up at https://www.cloudmailin.com
2. Get your unique email address
3. Update webhook endpoint:

```typescript
router.post('/webhooks/cloudmailin', async (req, res) => {
  const { attachments, from, subject } = req.body;
  // Very similar to SendGrid format
  // Process the same way
});
```

## Removing SendGrid Code

```bash
# Remove SendGrid dependency
npm uninstall @sendgrid/mail

# Update .env.example
# Remove SENDGRID_API_KEY and SENDGRID_FROM_EMAIL

# Update these files:
# - src/services/email.ts (remove SendGrid, use nodemailer or nothing)
# - src/api/routes.ts (change webhook or remove)
# - src/config/index.ts (remove SendGrid config)
```

## For Testing/Development

Just use the file system approach:
1. Copy test files to `incoming/` folder
2. Watch the magic happen
3. Check `processed/` folder for results

No external services needed!
