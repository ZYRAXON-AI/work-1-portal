/* ------------------------------------------------------------------
   এক জায়গায় লিংক বদলাতে পারেন। বাকি সব এখান থেকেই চলবে।
   Single source of truth for the embedded app URL.
   ------------------------------------------------------------------ */
window.PORTAL_CONFIG = {
  appUrl: "https://work-1-kkvugplujprcnldc.prod-runtime.all-hands.dev/",
  title: "ZYRAXON",
  splashText: "ZYRAXON লোড হচ্ছে…",
  loadTimeoutMs: 45000, // এই সময়ের মধ্যে লোড না হলে retry দেখাবে
  probeTimeoutMs: 12000, // সার্ভার সাড়া দিচ্ছে কি না যাচাই
  retryDelayMs: 4000, // retry এর মধ্যে gap
  maxRetries: 3,
  cacheBust: true
};