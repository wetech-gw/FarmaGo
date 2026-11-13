# Source ZIP for Hostinger's managed Node.js Web App (Windows 10+).
# Hostinger installs dependencies and runs npm run build on Linux.
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$archivePath = Join-Path $projectRoot 'hostinger-deploy.zip'
$temporaryArchive = Join-Path $projectRoot ('hostinger-deploy-' + [guid]::NewGuid().ToString('N') + '.zip')

Get-Command tar.exe -ErrorAction Stop | Out-Null

# Explicit inputs prevent backup copies, local databases and build output
# from entering the archive. New files inside these source folders are included.
$inputs = @(
    'app', 'components', 'data', 'lib', 'prisma', 'public', 'scripts', 'styles', 'types',
    'package.json', 'package-lock.json', 'next.config.ts', 'tsconfig.json',
    'prisma.config.ts', 'postcss.config.mjs', 'eslint.config.mjs', 'proxy.ts'
)
foreach ($item in $inputs) {
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $item))) {
        throw "Required project input missing: $item"
    }
}

$excludes = @(
    '--exclude=.env*', '--exclude=*.pem', '--exclude=*.key',
    '--exclude=*.pfx', '--exclude=*.p12', '--exclude=*.log',
    '--exclude=*.tsbuildinfo', '--exclude=node_modules', '--exclude=.next',
    '--exclude=.git', '--exclude=last-source', '--exclude=generated',
    '--exclude=*.zip', '--exclude=*.db', '--exclude=*.sqlite*',
    '--exclude=public/images/pharmacies', '--exclude=public/images/medications',
    '--exclude=prisma/create-admin.sql'
)

Push-Location $projectRoot
try {
    # bsdtar writes portable slash-separated paths and Unix file permissions.
    & tar.exe -a -c -f $temporaryArchive @excludes @inputs
    if ($LASTEXITCODE -ne 0) { throw 'ZIP creation failed.' }

    $entries = @(& tar.exe -t -f $temporaryArchive)
    if ($LASTEXITCODE -ne 0) { throw 'ZIP inspection failed.' }
    foreach ($required in @('package.json', 'package-lock.json', 'prisma/schema.prisma', 'app/layout.tsx')) {
        if ($entries -notcontains $required) { throw "ZIP missing: $required" }
    }
    $forbidden = @($entries | Where-Object {
        $_ -match '(^|/)(last-source|node_modules|\.next|\.git|generated)(/|$)' -or
        $_ -match '(^|/)\.env' -or $_ -match '\.(pem|key|pfx|p12|zip|tsbuildinfo)$' -or
        $_ -match '^public/images/(pharmacies|medications)/' -or
        $_ -eq 'prisma/create-admin.sql'
    })
    if ($forbidden.Count -gt 0) { throw 'ZIP contains excluded files; archive was not published.' }

    Move-Item -LiteralPath $temporaryArchive -Destination $archivePath -Force
    $archive = Get-Item -LiteralPath $archivePath
    Write-Host ("ZIP ready: {0} ({1:N2} MB; {2} entries)" -f $archive.FullName, ($archive.Length / 1MB), $entries.Count)
    Write-Host 'Upload in Hostinger > Deployments > Redeploy. Select Next.js and npm run build.'
    Write-Host 'Configure production environment variables in hPanel. No local build or database migration was run.'
}
finally {
    Pop-Location
    if (Test-Path -LiteralPath $temporaryArchive) {
        Remove-Item -LiteralPath $temporaryArchive
    }
}
