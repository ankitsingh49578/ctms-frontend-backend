$env:PGPASSWORD="pgankit"
$DB_NAME="ctms_db"
$DB_USER="postgres"

Write-Host "Resetting database..."
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U $DB_USER -d $DB_NAME -f schema.sql
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error running schema.sql"
    exit $LASTEXITCODE
}

Write-Host "Seeding data..."
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U $DB_USER -d $DB_NAME -f sample_data.sql
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error running sample_data.sql"
    exit $LASTEXITCODE
}

Write-Host "Database reset complete."
