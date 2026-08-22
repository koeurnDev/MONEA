# 🚀 ណែនាំដាក់ Environment Variables ទៅ Cloudflare Pages

## វិធីទី ១: ប្រើ PowerShell Script (ងាយបំផុត) ⭐

### ជំហានទី ១: Login ទៅ Cloudflare
```powershell
npx wrangler login
```

### ជំហានទី ២: ដំណើរការ Script
```powershell
cd monea-webapp
.\deploy-env.ps1
```

Script នេះនឹង:
- អាន variables ពី `cloudflare-env.json`
- ដាក់ទាំងអស់ (30 variables) ទៅ Cloudflare Pages
- បង្ហាញ progress bar

---

## វិធីទី ២: ប្រើ Script ពេញលេញ

```powershell
cd monea-webapp
.\setup-cloudflare-env.ps1
```

---

## វិធីទី ៣: ដាក់ម្តងមួយៗដោយដៃ

```powershell
cd monea-webapp

# Example: ដាក់ DATABASE_URL
echo "postgresql://..." | npx wrangler pages secret put DATABASE_URL --project-name=monea-webapp

# Example: ដាក់ API URL
echo "https://monea-api.seabkoeurn64.workers.dev" | npx wrangler pages secret put NEXT_PUBLIC_API_URL --project-name=monea-webapp
```

---

## វិធីទី ៤: ប្រើ Cloudflare Dashboard (GUI)

1. ទៅ https://dash.cloudflare.com
2. ចុច **Workers & Pages**
3. ជ្រើសរើស **monea-webapp**
4. ចុច **Settings** → **Environment variables**
5. ចុច **+ Add variable** ហើយបញ្ចូលតាម `cloudflare-env.json`

---

## ✅ បញ្ជាក់ថា Variables បានដាក់រួច

```powershell
# មើល list នៃ variables
npx wrangler pages secret list --project-name=monea-webapp
```

---

## 🔄 Update Variable ណាមួយ

```powershell
echo "new-value" | npx wrangler pages secret put VARIABLE_NAME --project-name=monea-webapp
```

---

## 🗑️ លុប Variable

```powershell
npx wrangler pages secret delete VARIABLE_NAME --project-name=monea-webapp
```

---

## 📝 សំខាន់! Important Notes

1. **Project Name**: ត្រូវប្តូរ `monea-webapp` ឱ្យត្រូវតាម project name របស់អ្នក
2. **App URL**: កែ `NEXT_PUBLIC_APP_URL` ក្នុង `cloudflare-env.json` ឱ្យត្រូវតាម domain ពិតប្រាកដ
3. **Auto Redeploy**: Cloudflare នឹង redeploy ដោយស្វ័យប្រវត្តិបន្ទាប់ពីដាក់ variables

---

## 🔐 Security

⚠️ **កុំ commit** files ទាំងនេះទៅ GitHub:
- `cloudflare-env.json` (មាន secrets)
- `.env` (មាន secrets)

Files ទាំងនេះត្រូវបានបញ្ចូលក្នុង `.gitignore` រួចហើយ។

---

## 🆘 ជំនួយបន្ថែម

ប្រសិនបើមានបញ្ហា:
```powershell
# ពិនិត្យ wrangler version
npx wrangler --version

# Login ម្តងទៀត
npx wrangler logout
npx wrangler login
```
