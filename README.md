# ZYRAXON Portal

এই ওয়েবসাইটে **অন্য কিছুই নেই** — পুরো পেজ জুড়ে শুধু আপনার চালু থাকা অ্যাপটাই রেন্ডার হয়।

অ্যাপের লিংক এক জায়গায় সেট করা:

```
config.js  →  window.PORTAL_CONFIG.appUrl
```

ডিফল্ট মান: `https://work-1-kkvugplujprcnldc.prod-runtime.all-hands.dev/`

## ফাইল

| ফাইল | কাজ |
| --- | --- |
| `index.html` | পুরো স্ক্রিন iframe + লোডিং স্প্ল্যাশ + অটো রিট্রাই + ফলবে "নতুন ট্যাবে খুলুন" |
| `404.html` | যেকোনো অচেনা পথে ঢুকলেও একই অ্যাপ খোলে |
| `config.js` | লিংক/টাইটেল/টাইমআউট — সব সেটিং এখানে |
| `assets/favicon.*` | ট্যাব আইকন |
| `site.webmanifest` | মোবাইলে অ্যাপের মতো ফুলস্ক্রিন ইনস্টল (Add to Home Screen) |
| `.github/workflows/pages.yml` | GitHub Pages ডিপ্লয় |
| `.github/workflows/validate.yml` | ফাইল/JSON/লিংক চেক |

## ডিপ্লয়

`main` ব্রাঞ্চে পুশ করলেই GitHub Actions নিজে থেকে GitHub Pages-এ পাবলিশ করে
(Settings → Pages → Source: **GitHub Actions** একবার সেট থাকতে হবে)।

## লোকালে টেস্ট

```bash
python3 -m http.server 8080
# ব্রাউজারে: http://localhost:8080
```

## নোট

- অ্যাপটা ইন্টারনেট থেকেই লোড হয়, তাই ওই ক্লাউড ইনস্ট্যান্সটা বন্ধ থাকলে পেজে লোডিং মেসেজ + রিট্রাই দেখাবে।
- নতুন ভিজিটর ঢুকলেই সরাসরি অ্যাপটাই পাবে — কোনো লগইন/সেটআপ লাগে না।