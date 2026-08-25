# 🛡️ MONEA Production Security Guide (ការណែនាំសុវត្ថិភាពសម្រាប់ Production)

ឯកសារនេះរៀបរាប់អំពីគោលការណ៍ និងវិធានការការពារសុវត្ថិភាពកម្រិតខ្ពស់ (Enterprise-Grade Security) សម្រាប់ដំណើរការប្រព័ន្ធ MONEA លើ Production។

---

## 🏛️ សសរស្តម្ភសុវត្ថិភាពទាំង ៣ (The 3 Core Security Pillars)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Dedicated Master Account (គណនីដាច់ដោយឡែក)                               │
│    - ប្រើប្រាស់ Email ផ្ទាល់ខ្លួនដាច់ដោយឡែក (ឧ. admin-master@monea.co)         │
│    - មិនប្រើគណនី Admin នេះសម្រាប់បង្កើត Wedding ឬធ្វើតេស្តទូទៅឡើយ            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Mandatory MFA / 2FA (បង្ខំប្រើប្រាស់ការផ្ទៀងផ្ទាត់ ២ ជាន់)               │
│    - បើកដំណើរការ Google Authenticator (TOTP) ឬ Hardware Passkey ជាដាច់ខាត   │
│    - ទោះបីបែកធ្លាយ Password ក៏ជនអនាមិកមិនអាច Login ចូលបានឡើយ                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Network Isolation & IP Restriction / Cloudflare Zero Trust               │
│    - កំណត់ឱ្យចូលបានតែពី IP Address ដែលអនុញ្ញាត (Whitelisted IPs)            │
│    - ឬប្រើប្រាស់ Cloudflare Access / Tunnels / Tailscale VPN                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 ការរៀបចំជាក់ស្តែង (Practical Configuration)

### ១. Dedicated Master Account
- បង្កើត ឬប្តូរ Email ទៅជាគណនីផ្លូវការរបស់ស្ថាប័ន ដូចជា `admin-master@monea.co` តាមរយៈផ្ទាំង **[System Settings -> Security & Account](http://localhost:3001/admin/master/settings)**។
- ប្រើប្រាស់ពាក្យសម្ងាត់ខ្លាំង (Strong Password) ដែលមានយ៉ាងតិច **១៦ តួអក្សរ** រួមបញ្ចូលទាំង អក្សរធំ-តូច លេខ និងនិមិត្តសញ្ញាពិសេស។

### ២. ការបើកដំណើរការ 2FA (Two-Factor Authentication)
1. ចូលទៅកាន់ `/admin/master/settings` រួចជ្រើសរើស **សុវត្ថិភាព & គណនី**។
2. ចុច **"ចាប់ផ្តើមរៀបចំប្រព័ន្ធ 2FA"** និងបញ្ចូល Password បច្ចុប្បន្ន។
3. បើក **Google Authenticator** ឬ **1Password** លើទូរស័ព្ទដៃ រួចស្កេន QR Code។
4. បញ្ចូលលេខកូដ ៦ ខ្ទង់ដើម្បីផ្ទៀងផ្ទាត់ និងបើកដំណើរការជោគជ័យ។

### ៣. ការរឹតបន្តឹង IP Address & Firewall
- ប្រើប្រាស់ផ្ទាំង **[Security & Firewall](http://localhost:3001/admin/master/security)** ក្នុងការត្រួតពិនិត្យ IP Address ដែលព្យាយាម Login ខុស និងទម្លាក់ចូល Blacklist។
- នៅលើ **Cloudflare Dashboard**:
  - បង្កើត **WAF Custom Rule** សម្រាប់ផ្លូវ `/admin/*` និង `/api/admin/*`។
  - អនុញ្ញាត (Allow) តែ IP Addresses ជាក់លាក់របស់ Admin និង Challenge / Block IP ផ្សេងទៀត។

---

## 🔒 យន្តការការពារស្វ័យប្រវត្តិក្នុង MONEA (Built-in Automated Defenses)

1. **Brute-force Shield:** ប្រសិនបើវាយ Password ខុស ៥ ដង ប្រព័ន្ធនឹងចាក់សោរគណនីរយៈពេល ១៥ នាទី និងរារាំង IP នោះដោយស្វ័យប្រវត្តិ។
2. **Bot Protection:** ទំព័រ Admin Login ត្រូវបានការពារដោយ **Cloudflare Turnstile CAPTCHA** ដើម្បីកម្ចាត់ Automated Bot Scripts។
3. **Session Revocation:** Super Admin អាចចុច **"ផ្តាច់ឧបករណ៍ទាំងអស់ (Revoke All Sessions)"** ពេលសង្ស័យមានការលួចចូល។
4. **Audit Logging:** រាល់ការកែប្រែទិន្នន័យសំខាន់ៗ ត្រូវបានកត់ត្រាក្នុង **System Audit Logs** ជាមួយ IP, ម៉ោង និង User-Agent។
