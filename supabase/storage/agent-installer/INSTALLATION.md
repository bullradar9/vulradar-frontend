# VulnRadar Agent — Installation Guide

This guide walks you through installing the VulnRadar agent on a Windows machine. The agent reads the list of software installed on the system, sends it to VulnRadar for analysis, and the device shows up in your dashboard with any vulnerabilities detected.

Initial setup takes about 10 minutes and requires administrator rights. Once installed, the agent runs as a normal user, and each scan completes in under 2 minutes.

---

## What you'll need

- A Windows 10 or Windows 11 machine (x64 or arm64).
- The `vulnradar-agent.zip` file you downloaded from your VulnRadar account.
- Outbound HTTPS (port 443) access. The agent only talks to our processor in the EU.
- **Administrator rights** for the initial copy and for granting write permissions. After setup, the agent runs without admin.

---

## What's in the ZIP

When you unzip `vulnradar-agent.zip` you'll see three files:

| File | Purpose |
|---|---|
| `agent.exe` | The scanner itself. ~10 MB. |
| `config.yaml` | Your account configuration. **Don't edit it.** |
| `INSTALLATION.md` | This document. |

The `config.yaml` is personalized for your account. If someone else gets hold of it, they could install the agent on their machine and you'd see it as a device in your dashboard. They **cannot** read your data — but they can clutter it. Treat the file as private.

---

## Installation steps

### 1. Copy the files to ProgramData (requires admin)

Place the agent in the standard Windows location for shared application data:

```
C:\ProgramData\VulnRadar\
```

`ProgramData` is hidden by default in File Explorer. To see it: **View → Show hidden items**. You can also paste the full path into the address bar.

Two ways to copy:

**Option A — File Explorer:**

1. Create the folder `C:\ProgramData\VulnRadar\` (you'll get a UAC prompt).
2. Copy `agent.exe`, `config.yaml`, and `INSTALLATION.md` into it (UAC again).

**Option B — PowerShell as administrator (recommended):**

Open PowerShell as administrator (Windows key → type "powershell" → right-click → **Run as administrator**), then run:

```powershell
$src = "<path-to-extracted-folder>\*"
$dst = "C:\ProgramData\VulnRadar"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Path $src -Destination $dst -Recurse -Force
```

Replace `<path-to-extracted-folder>` with the location where you unzipped the file.

### 2. Grant write permission to users (requires admin)

The agent writes its identity file (`agent_id.txt`) and updates `config.yaml` on each scan. By default, `ProgramData` subfolders only allow administrators to write. Grant Modify rights to all users so the agent can run without admin from now on.

In the same admin PowerShell:

```powershell
icacls "C:\ProgramData\VulnRadar" /grant Users:(OI)(CI)M /T
```

You should see `Successfully processed N files`. This is a one-time step.

### 3. Run the agent

Now any user on the machine can run it. Open `C:\ProgramData\VulnRadar\` and double-click `agent.exe`. A console window opens.

### 4. Handle the Windows SmartScreen warning

The first time you run the agent, Windows will likely show a blue "Windows protected your PC" screen. This happens because the binary is not yet digitally signed (we are working on it).

To proceed:

1. Click **More info**.
2. Click **Run anyway**.

Windows remembers your choice and won't ask again on subsequent runs.

### 5. Wait for the first scan

The agent will:

1. Detect your hardware (hostname, OS, architecture).
2. Register itself with VulnRadar (creates a device entry in your account).
3. Read the list of installed software from the Windows registry.
4. Send everything to the processor.
5. Show a summary and wait for you to press Enter to close.

Total time: typically under 2 minutes on a normal PC.

### 6. Verify it worked

Open your VulnRadar dashboard. The device should appear under **Devices** with the hostname of this machine. Alerts (if any were detected) appear within seconds of the scan completing.

If the device doesn't appear, check **Troubleshooting** below.

---

## Scheduled scans — weekly

For ongoing protection, schedule the agent to run weekly. NIS2 doesn't require daily scans, and weekly is enough for typical SMB software inventory drift; you can tighten it later if you need to.

1. Open **Task Scheduler** (Windows key → type "task scheduler").
2. **Create Basic Task**.
3. Name: `VulnRadar Weekly Scan`.
4. Trigger: **Weekly**. Pick a day and time when the machine is on but not in heavy use.
5. Action: **Start a program**.
6. Program: `C:\ProgramData\VulnRadar\agent.exe`.
7. (Optional) In the task's **Settings** tab, enable **Run task as soon as possible after a scheduled start is missed** so a scan still happens if the PC was off.

The agent is safe to run repeatedly. Each run refreshes the inventory and updates alerts.

---

## Troubleshooting

### The device doesn't appear in my dashboard

- Check that the agent finished without errors. Read the console output before pressing Enter.
- Verify outbound HTTPS works: open `https://www.google.com` from the same machine.
- Confirm `agent.exe`, `config.yaml`, and any newly created `agent_id.txt` are all in `C:\ProgramData\VulnRadar\`.
- If the problem persists, contact us at `bullradar9@gmail.com` with the console output.

### The agent says "Permission denied" or fails to write `agent_id.txt`

You probably skipped step 2 (the `icacls` command). Re-run it from an admin PowerShell.

### SmartScreen blocks the agent every time

Windows should remember your decision. If it keeps blocking:

1. Right-click `agent.exe` → **Properties**.
2. At the bottom of the **General** tab, tick **Unblock**.
3. Click **OK**.

### The agent says "tenant mismatch" or HTTP 403

This means the `agent_id.txt` in the folder was generated for a different VulnRadar account. Usually happens when the folder was copied from another machine or another customer's install.

Fix: delete `C:\ProgramData\VulnRadar\agent_id.txt`. The agent will generate a new one on the next run.

### The console window closes immediately

The agent waits for Enter before closing, so a quick close means an error during startup. Open a Command Prompt, navigate to `C:\ProgramData\VulnRadar\`, and run `agent.exe` from there to see the error message.

---

## Files the agent creates

After the first run you'll see two new files in `C:\ProgramData\VulnRadar\`:

| File | Purpose |
|---|---|
| `agent_id.txt` | Unique ID for this machine. Keep it. |
| `config.yaml` | Now also contains `device_id`, filled in by the processor. |

To "reset" this device and re-register from scratch, delete both files. The next run will register a new device on your account; the old one will remain in your dashboard until you remove it manually.

---

## Updating the agent

When a new version of `agent.exe` is released, you'll get a notice and a fresh download from VulnRadar. To update:

1. Download the new `vulnradar-agent.zip`.
2. Copy **only** the new `agent.exe` into `C:\ProgramData\VulnRadar\`, replacing the old one. Keep your existing `config.yaml` and `agent_id.txt` intact.
3. Run the new `agent.exe` to verify.

Updating does **not** require admin: step 2 of the initial install (`icacls`) granted Modify rights to all users on the folder and its files, so any user can overwrite `agent.exe`.

Replacing the config files would cause the agent to register as a new device, leaving the old one orphaned in your dashboard.

---

## Uninstalling

The agent doesn't install in the traditional sense — it's a standalone executable. To remove it:

1. As administrator, delete `C:\ProgramData\VulnRadar\` and everything inside it.
2. Remove the scheduled task from Task Scheduler if you set one up.
3. (Optional) Remove the device from your VulnRadar dashboard if you don't want it to remain in your inventory history.

---

## Privacy

The agent collects:

- The list of installed software from the Windows registry: name, version, publisher.
- Basic hardware info: hostname, OS version, architecture.

It does **not** collect:

- Personal files, documents, browsing history, or running processes.
- Network traffic.
- User credentials.

All data is processed in the EU: the database in Frankfurt and the processor in Amsterdam.

---

## Support

Questions or issues: `bullradar9@gmail.com`.
