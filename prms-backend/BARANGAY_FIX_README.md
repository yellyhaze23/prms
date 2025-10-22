# Fix for Disease Tracker Showing Zero Data

## Problem
The Disease Tracker in the Staff Portal shows zero data (0 barangays, 0 patients) even though patients exist in the database.

## Root Cause
1. The heatmap query requires patients to have a `barangay_id` field set
2. The staff portal's "Add Patient" and "Update Patient" endpoints were not setting the `barangay_id` field
3. Existing patients in the database don't have `barangay_id` set, so they don't appear in the heatmap

## Solution

### Step 1: Fix Backend Endpoints (Already Done)
Updated the following files to support `barangay_id`:
- `prms-backend/api/staff/patients/add.php` - Now accepts and saves `barangay_id`
- `prms-backend/api/staff/patients/update.php` - Now accepts and updates `barangay_id`

### Step 2: Fix Existing Data
Run the PHP script to update existing patients with their barangay_id:

```bash
php prms-backend/fix_patient_barangay_ids.php
```

Or manually run the SQL script:
```bash
mysql -u your_username -p your_database < prms-backend/fix_patient_barangay_ids.sql
```

### Step 3: Update Frontend (Optional)
The frontend can now send `barangay_id` when adding/updating patients. If your patient forms already collect barangay information, you can add it to the API calls.

## How to Test
1. Run the fix script: `php prms-backend/fix_patient_barangay_ids.php`
2. Refresh the Disease Tracker page in the Staff Portal
3. You should now see:
   - Total Barangays count
   - Total Patients count
   - High Risk Areas
   - Overall Sick Rate
   - Markers on the map

## What the Fix Does
The script:
1. Reads all barangay names from the `barangays` table
2. For each patient without a `barangay_id`, it checks if their address contains a barangay name
3. If a match is found, it sets the patient's `barangay_id` to the matching barangay

## Example
If a patient has:
- Address: "123 Main Street, Baybayin, Los Baños, Laguna"
- barangay_id: NULL

The script will find "Baybayin" in the barangays table and set the patient's `barangay_id` to Baybayin's ID.

## Notes
- The script only updates patients where `barangay_id` is NULL
- It's safe to run multiple times
- If some patients' addresses don't match any barangay name, they will remain without a `barangay_id` and won't appear in the heatmap
- Future patients added through the staff portal will automatically have `barangay_id` set if the frontend sends it

