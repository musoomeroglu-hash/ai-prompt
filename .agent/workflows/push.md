---
description: Push code to GitHub
---
## Push to GitHub

// turbo-all

1. Refresh the PATH so new git installation is found:
```
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
```

2. Stage all changes:
```
cmd /c "cd /d C:\Users\Acer\.gemini\antigravity\scratch && git add ."
```

3. Commit with a descriptive message (replace MESSAGE with a real message):
```
cmd /c "cd /d C:\Users\Acer\.gemini\antigravity\scratch && git commit -m \"Update: latest changes\""
```

4. Push to GitHub:
```
cmd /c "cd /d C:\Users\Acer\.gemini\antigravity\scratch && git push"
```

## First-time setup (only needed once)

If this is the first push, run these steps first:

1. Initialize git repo:
```
cmd /c "cd /d C:\Users\Acer\.gemini\antigravity\scratch && git init"
```

2. Set git user info:
```
cmd /c "cd /d C:\Users\Acer\.gemini\antigravity\scratch && git config user.name \"YOUR_NAME\" && git config user.email \"YOUR_EMAIL\""
```

3. Add GitHub remote:
```
cmd /c "cd /d C:\Users\Acer\.gemini\antigravity\scratch && git remote add origin https://github.com/YOUR_USERNAME/antigravity.git"
```

4. Set main branch:
```
cmd /c "cd /d C:\Users\Acer\.gemini\antigravity\scratch && git branch -M main"
```

5. First push:
```
cmd /c "cd /d C:\Users\Acer\.gemini\antigravity\scratch && git push -u origin main"
```
