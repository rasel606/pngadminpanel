# ==============================================================================
# windows-deploy.ps1 — Windows PowerShell helper for tiger55.online deployment
#
# Run from PowerShell on your Windows machine:
#   .\scripts\windows-deploy.ps1
#
# This script helps you:
#   1. Check that SSH is available
#   2. Generate an SSH key pair (if you don't have one)
#   3. Copy your public key to the server
#   4. Open an SSH session so you can run server commands
# ==============================================================================

param(
    [string]$ServerIP   = "161.97.180.157",
    [string]$RootUser   = "root",
    [string]$DeployUser = "deploy"
)

$KeyPath = "$env:USERPROFILE\.ssh\id_ed25519"

function Write-Step([string]$Number, [string]$Message) {
    Write-Host ""
    Write-Host "[$Number] $Message" -ForegroundColor Cyan
    Write-Host ("-" * 60) -ForegroundColor DarkGray
}

function Write-OK([string]$Message) {
    Write-Host "  OK  $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
    Write-Host "  !!  $Message" -ForegroundColor Yellow
}

function Write-Err([string]$Message) {
    Write-Host "  XX  $Message" -ForegroundColor Red
}

# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host "   tiger55.online — Windows Deployment Helper" -ForegroundColor Magenta
Write-Host "   Server: $ServerIP" -ForegroundColor Magenta
Write-Host "================================================================" -ForegroundColor Magenta

# ------------------------------------------------------------------------------
Write-Step "1/4" "Checking for OpenSSH client"

$sshExe = Get-Command ssh -ErrorAction SilentlyContinue
if ($null -eq $sshExe) {
    Write-Err "OpenSSH client not found."
    Write-Host ""
    Write-Host "  Install it via: Settings -> Apps -> Optional Features -> OpenSSH Client"
    Write-Host "  Or run in PowerShell (as Administrator):"
    Write-Host "    Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0"
    exit 1
}
Write-OK "SSH found at: $($sshExe.Source)"

# ------------------------------------------------------------------------------
Write-Step "2/4" "Checking for SSH key pair"

if (Test-Path $KeyPath) {
    Write-OK "SSH key already exists: $KeyPath"
} else {
    Write-Warn "No SSH key found. Generating one now..."
    & ssh-keygen -t ed25519 -C "deploy-tiger55" -f $KeyPath
    if ($LASTEXITCODE -ne 0) {
        Write-Err "ssh-keygen failed. Check the output above."
        exit 1
    }
    Write-OK "SSH key generated: $KeyPath"
}

$PubKeyPath = "$KeyPath.pub"
if (-not (Test-Path $PubKeyPath)) {
    Write-Err "Public key not found at $PubKeyPath"
    exit 1
}

$PublicKey = Get-Content $PubKeyPath -Raw
$PublicKey = $PublicKey.Trim()
Write-OK "Public key loaded."
Write-Host ""
Write-Host "  Your public key (you may need this later):" -ForegroundColor DarkGray
Write-Host "  $PublicKey" -ForegroundColor DarkGray

# ------------------------------------------------------------------------------
Write-Step "3/4" "Installing public key on the server"

Write-Host ""
Write-Host "  You will be prompted for the ROOT password of $ServerIP." -ForegroundColor Yellow
Write-Host "  This copies your SSH public key to the server so future" -ForegroundColor Yellow
Write-Host "  logins do not require a password." -ForegroundColor Yellow
Write-Host ""

$AskInstall = Read-Host "  Install public key on $ServerIP now? [Y/n] (default: Y)"
if ($AskInstall -match "^[Yy]?$") {
    # Build the remote command to create authorized_keys for the deploy user
    $RemoteCmd = @"
mkdir -p /home/$DeployUser/.ssh && \
echo '$PublicKey' >> /home/$DeployUser/.ssh/authorized_keys && \
chown -R $DeployUser`:$DeployUser /home/$DeployUser/.ssh && \
chmod 700 /home/$DeployUser/.ssh && \
chmod 600 /home/$DeployUser/.ssh/authorized_keys && \
echo 'Key installed successfully.'
"@

    Write-Host ""
    Write-Host "  Connecting as root to install the key. Enter root password when prompted:" -ForegroundColor Yellow
    & ssh -o StrictHostKeyChecking=accept-new "$RootUser@$ServerIP" $RemoteCmd

    if ($LASTEXITCODE -eq 0) {
        Write-OK "Public key installed for user '$DeployUser' on $ServerIP"
    } else {
        Write-Warn "Key installation may have failed. You can add it manually:"
        Write-Host ""
        Write-Host "  1. SSH as root:  ssh root@$ServerIP"
        Write-Host "  2. Run:  mkdir -p /home/$DeployUser/.ssh"
        Write-Host "  3. Run:  echo '$PublicKey' >> /home/$DeployUser/.ssh/authorized_keys"
        Write-Host "  4. Run:  chmod 700 /home/$DeployUser/.ssh"
        Write-Host "  5. Run:  chmod 600 /home/$DeployUser/.ssh/authorized_keys"
    }
} else {
    Write-Warn "Skipping key installation. You can add your key manually (see CONTABO_VPS_SETUP.md Section 5)."
}

# ------------------------------------------------------------------------------
Write-Step "4/4" "Opening SSH session on the server"

Write-Host ""
Write-Host "  Opening an SSH session to $DeployUser@$ServerIP ..." -ForegroundColor Cyan
Write-Host "  Once connected, follow the steps in CONTABO_VPS_SETUP.md" -ForegroundColor Cyan
Write-Host "  starting from Section 6 (Install Node.js via NVM)." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Type 'exit' to close the session when done." -ForegroundColor DarkGray
Write-Host ""

$AskConnect = Read-Host "  Connect now? [Y/n] (default: Y)"
if ($AskConnect -match "^[Yy]?$") {
    & ssh -i $KeyPath "$DeployUser@$ServerIP"
} else {
    Write-Host ""
    Write-Host "  Connect manually with:" -ForegroundColor DarkGray
    Write-Host "    ssh -i $KeyPath $DeployUser@$ServerIP" -ForegroundColor White
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host "   Done! See CONTABO_VPS_SETUP.md for the full setup guide." -ForegroundColor Magenta
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host ""
