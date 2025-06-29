# 📧 CloudMailin Address Configuration

## Your Current Setup

**Your CloudMailin Address**: `38fab3b51608018af887@cloudmailin.net`

This is CloudMailin's default format - a unique identifier followed by `@cloudmailin.net`.

## How CloudMailin Addresses Work

### Option 1: Default Addresses (What You Have) ✅
- **Format**: `[random-id]@cloudmailin.net`
- **Example**: `38fab3b51608018af887@cloudmailin.net`
- **Cost**: Free
- **Limitation**: Can't customize the address format

### Option 2: Custom Domain (Premium Feature)
- **Format**: `[property-name]@yourdomain.com`
- **Example**: `sunset-tower@reports.yourcompany.com`
- **Cost**: Requires paid CloudMailin plan
- **Benefit**: Branded, memorable addresses

## Working with Default Addresses

Since you have default CloudMailin addresses, here's how to manage multiple properties:

### Strategy 1: One Address, Route by Subject/Sender
Use your single CloudMailin address for ALL properties and identify them by:
- Email subject line patterns
- Sender email address
- Custom headers

```typescript
// In CloudMailinHandler.ts
private async identifyProperty(payload: CloudMailinPayload): Promise<Property | null> {
  // First try by CloudMailin address
  let property = await this.getPropertyByEmail(payload.envelope.to);
  
  if (!property) {
    // Try to identify by subject pattern
    // E.g., "Financial Report - Sunset Tower"
    const match = payload.headers.subject?.match(/Financial Report - (.+)/);
    if (match) {
      const propertyName = match[1];
      property = await this.getPropertyByName(propertyName);
    }
  }
  
  return property;
}
```

### Strategy 2: Multiple CloudMailin Addresses
Create multiple free CloudMailin addresses (one per property):
1. Create new addresses in CloudMailin dashboard
2. Assign each to a property
3. Update database accordingly

### Strategy 3: Address Aliases (If Available)
Some CloudMailin plans support address aliases:
- `38fab3b51608018af887+sunset-tower@cloudmailin.net`
- `38fab3b51608018af887+downtown-plaza@cloudmailin.net`

## Update Your Database

Run this SQL to assign your CloudMailin address to a property:

```sql
-- Option 1: Update existing property
UPDATE properties 
SET cloudmailin_address = '38fab3b51608018af887@cloudmailin.net'
WHERE name = 'Demo Property';

-- Option 2: Create new property with this address
INSERT INTO properties (
  investor_id,
  name,
  property_type,
  address_line1,
  city,
  state,
  cloudmailin_address,
  status
) VALUES (
  (SELECT id FROM investors LIMIT 1),
  'Main Property',
  'residential',
  '456 Main St',
  'Los Angeles',
  'CA',
  '38fab3b51608018af887@cloudmailin.net',
  'active'
);
```

## Testing with Your Address

1. **Update CloudMailin Webhook**:
   - Go to CloudMailin dashboard
   - Find address: `38fab3b51608018af887@cloudmailin.net`
   - Set webhook URL to your server

2. **Send Test Email**:
   ```
   To: 38fab3b51608018af887@cloudmailin.net
   Subject: Financial Report - December 2024
   Attachment: Any Excel or PDF file
   ```

3. **Run Test**:
   ```bash
   # Start server
   npx ts-node test/test-server.ts
   
   # In another terminal
   npx ts-node test/test-email-flow.ts
   ```

## For Production: Property Identification

Since you're using one CloudMailin address, here are robust ways to identify properties:

### Method 1: Subject Line Convention
Require property managers to use specific subject formats:
```
"[Sunset Tower] December 2024 Financial Report"
"Financial Report - Downtown Plaza - Q4 2024"
```

### Method 2: Sender Mapping
Map sender emails to properties:
```sql
CREATE TABLE property_email_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(property_id, sender_email)
);
```

### Method 3: Email Body Tags
Look for property identifiers in email body:
```
Property: Sunset Tower
Property ID: ST-001
```

## Updated Test Flow

Your test files have been updated to use your actual CloudMailin address:
- `test/mock-cloudmailin-payload.json` - Uses your address
- `test/test-email-flow.ts` - Looks for your address

Now when you run the tests, they'll work with your real CloudMailin setup!

---

**Next Step**: Run the SQL update above to assign your CloudMailin address to a property, then test! 🚀