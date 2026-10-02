# Supabase Setup Guide

## Important: You MUST set up Supabase tables to sync data across devices

## Step-by-Step Supabase Setup

### 1. Get Supabase API Key
1. Go to your Supabase project: https://supabase.com/dashboard/project/vmcnpjqrlqmmsaeygbny
2. Click "Settings" (gear icon) in left sidebar
3. Click "API" in the submenu
4. Copy the "anon public" key
5. Paste it in `supabase-config.js` file (replace `YOUR_SUPABASE_ANON_KEY`)

### 2. Create Tables in Supabase

#### Table 1: workers
1. Click "Table Editor" in left sidebar
2. Click "Create a new table"
3. Table name: `workers`
4. Click "Save"

#### Add Columns to workers table:
1. Click on `workers` table
2. Click "Add column"
3. Add these columns:

| Column Name | Type | Default | Description |
|-------------|------|---------|-------------|
| id | text | - | Worker ID (primary key) |
| name | text | - | Worker name |
| mobile | text | - | Mobile number |
| whatsapp | text | - | WhatsApp number |
| department | text | - | Department |
| details | text | - | Additional details |
| avatar | text | - | Profile photo (base64) |
| cardColor | text | #667eea | Card background color |
| dailyWork | jsonb | [] | Daily work array |
| monthlyWork | jsonb | [] | Monthly work array |
| yearlyWork | jsonb | [] | Yearly work array |
| createdAt | timestamptz | now() | Creation timestamp |
| status | text | active | Worker status |

5. Set `id` as Primary Key
6. Click "Save"

#### Table 2: activities
1. Create new table: `activities`
2. Add columns:

| Column Name | Type | Default | Description |
|-------------|------|---------|-------------|
| id | text | - | Activity ID (primary key) |
| title | text | - | Activity title |
| description | text | - | Activity description |
| timestamp | timestamptz | now() | Timestamp |
| type | text | system | Activity type |

3. Set `id` as Primary Key
4. Click "Save"

#### Table 3: notes
1. Create new table: `notes`
2. Add columns:

| Column Name | Type | Default | Description |
|-------------|------|---------|-------------|
| id | text | - | Note ID (primary key) |
| title | text | - | Note title |
| text | text | - | Note content |
| color | text | yellow | Note color |
| rotate | number | 0 | Rotation angle |

3. Set `id` as Primary Key
4. Click "Save"

#### Table 4: settings
1. Create new table: `settings`
2. Add columns:

| Column Name | Type | Default | Description |
|-------------|------|---------|-------------|
| id | text | - | Settings ID (primary key) |
| data | jsonb | {} | Settings data |

3. Set `id` as Primary Key
4. Click "Save"

### 3. Create Storage Bucket for Avatars (IMPORTANT)
For worker profile photos to sync across devices, you need to create a storage bucket:

1. Click "Storage" in left sidebar
2. Click "Create a new bucket"
3. Bucket name: `worker-avatars`
4. Click "Create bucket"
5. Click on the `worker-avatars` bucket
6. Click "Policies" → "New policy"
7. Policy type: "Full access"
8. Policy name: "Public Access"
9. Check "Read" and "Upload" permissions
10. Click "Save"

**This enables public read and upload access for worker avatars.**

### 4. Update Row Level Security (RLS)
For development, disable RLS to allow public access:

1. Click "Authentication" in left sidebar
2. Click "Policies" → "Disable RLS"
3. Confirm by clicking "Disable"

**Note:** For production, you should enable RLS and implement proper authentication.

### 5. Update supabase-config.js
Open `supabase-config.js` and replace `YOUR_SUPABASE_ANON_KEY` with your actual API key from step 1.

```javascript
const supabaseUrl = 'https://vmcnpjqrlqmmsaeygbny.supabase.co';
const supabaseKey = 'YOUR_ACTUAL_ANON_KEY_HERE'; // Replace this
```

### 6. Test the Integration
1. Refresh your browser
2. Check browser console (F12) for errors
3. If you see "All data loaded from Supabase", it's working!
4. Add a worker and check if it syncs

## Features After Supabase Setup

✅ **Real-time Sync**: Data syncs instantly across all devices
✅ **Cloud Storage**: All data stored in Supabase cloud
✅ **PostgreSQL Database**: Professional-grade database
✅ **Cross-Device**: PC and phone will show same data
✅ **Automatic Backup**: Data automatically backed up
✅ **No MFA Required**: Easy setup without multi-factor authentication

## What Gets Synced

- ✅ Workers data (name, mobile, whatsapp, department, etc.)
- ✅ Worker photos (stored in Supabase Storage - syncs across devices!)
- ✅ Worker card colors
- ✅ Activities/Logs
- ✅ Sticky notes
- ✅ Input styling settings

## Troubleshooting

### Error: "supabase is not defined"
- Make sure `supabase-config.js` is loaded before `script.js`
- Check if Supabase SDK script is properly loaded in index.html

### Error: "Permission denied"
- Check RLS policies in Supabase
- Make sure RLS is disabled for development

### Data not syncing
- Check browser console for errors
- Verify supabase-config.js has correct API key
- Make sure tables are created correctly
- Check if RLS is disabled

### Error: "Table does not exist"
- Make sure you created all 4 tables (workers, activities, notes, settings)
- Check table names are exactly as specified

## Current Fallback

If Supabase is not set up or fails, the app automatically falls back to localStorage. This means:
- Data will be stored locally on each device
- No sync between devices
- Each device will have its own data

## Quick Start Checklist

- [ ] Get API key from Supabase Settings → API
- [ ] Update supabase-config.js with API key
- [ ] Create workers table with all columns
- [ ] Create activities table with all columns
- [ ] Create notes table with all columns
- [ ] Create settings table with all columns
- [ ] Create storage bucket: `worker-avatars` with public read/upload access
- [ ] Disable RLS for development
- [ ] Refresh browser and test
- [ ] Add a worker with photo and verify sync

## Deployment Note

When deploying to Vercel, make sure:
1. Supabase config is updated with correct API key
2. All tables are created in Supabase
3. RLS is properly configured (disabled for dev, proper for prod)
4. Test thoroughly before going live
