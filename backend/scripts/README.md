# Backend Model Test

This folder contains a small script to test the new separate models for `Car`, `OwnerDetail`, `Insurance`, `RCBook`, etc.

Run the test script:

```bash
# from repo root
node backend/scripts/test-models.js
```

Set `MONGO_URI` if your MongoDB is remote or requires credentials:

```bash
# Windows PowerShell
$env:MONGO_URI = 'mongodb://user:pass@host:port/dbname'; node backend/scripts/test-models.js
```

Notes:
- `RCBook` fields are marked `immutable: true` in the schema; attempting to update those fields via Mongoose will be ignored after creation.
- This script creates test documents — remove them manually if desired.