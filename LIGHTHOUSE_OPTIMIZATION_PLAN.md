# Lighthouse Optimization Plan

## Executive Summary

**Current State:** All accessibility HUs (Skip Link, Reduced Motion, Connection Resilience) are ✅ **IMPLEMENTED**.

**Lighthouse Scores:** Performance (80-100), Accessibility (88-96), Best Practices (73-100), SEO (82-83)

**Goal:** Reach 90+ across all metrics on all pages.

---

## 🎯 Phase 1: Quick Wins (High Impact, Low Effort)

### 1.1 SEO: Meta Description (All Pages) - **Impact: SEO +8-10 points**

**Current Issue:** "El documento no tiene una metadescripción" on all pages

**Fix:**
```html
<!-- Add to index.html -->
<meta name="description" content="Agora - Plataforma de videoconferencias accesible y fácil de usar. Crea salas, comparte pantalla y conecta con tu equipo de forma segura.">
```

**Files to modify:**
- `index.html`

**Effort:** 2 minutes

---

### 1.2 SEO: robots.txt Fix - **Impact: SEO +5 points**

**Current Issue:** "robots.txt no es válido — Se encontraron 20 errores"

**Check current robots.txt:**
```bash
curl https://proyecto-integrador-frontend-psi.vercel.app/robots.txt
```

**Expected fix:**
```txt
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://proyecto-integrador-frontend-psi.vercel.app/sitemap.xml
```

**Files to modify:**
- `public/robots.txt` (create if missing)

**Effort:** 5 minutes

---

### 1.3 Accessibility: Main Landmark (Some Pages) - **Impact: A11y +2-4 points**

**Current Issue:** "El documento no tiene un punto de referencia principal" on Home, Login, Registro, Sala

**Current State:** 
- ✅ `<main id="main-content">` wrapper exists in `App.tsx`
- ❓ Some pages might be missing `<h1>` inside main

**Action:** Verify all pages have `<h1>` as first child of content:

```tsx
// Expected structure in each page:
<div className="...">
  <h1 className="...">Page Title</h1>
  {/* rest of content */}
</div>
```

**Pages to check:**
- `src/pages/Home.tsx`
- `src/pages/Login.tsx`
- `src/pages/Registro.tsx`
- `src/pages/Sala.tsx`

**Effort:** 10 minutes

---

### 1.4 Accessibility: Contrast Issues - **Impact: A11y +3-5 points**

**Current Issue:** "Los colores de fondo y de primer plano no tienen una relación de contraste adecuada" on all pages

**Known Patterns to Fix:**
- Change `text-slate-400` → `text-slate-600` (or darker)
- Change `text-slate-500` → `text-slate-600` (or darker)
- Check any `text-gray-400` or `text-gray-500` instances

**Files to audit (based on previous work):**
- `src/pages/Dashboard.tsx`
- `src/pages/Login.tsx`
- `src/pages/Registro.tsx`
- `src/pages/Perfil.tsx`
- `src/pages/Sala.tsx`
- `src/components/sala/*` (all sala components)

**Effort:** 20-30 minutes

---

### 1.5 Accessibility: Links Depend on Color (Login, Registro) - **Impact: A11y +2-3 points**

**Current Issue:** "Los vínculos dependen del color para distinguirse" on Login and Registro

**Fix Pattern:**
```tsx
// Before:
<Link to="/registro" className="text-blue-600 hover:text-blue-500">
  Regístrate
</Link>

// After:
<Link 
  to="/registro" 
  className="text-blue-600 underline decoration-1 underline-offset-2 hover:text-blue-500 focus-visible:outline-purple-500"
>
  Regístrate
</Link>
```

**Files to modify:**
- `src/pages/Login.tsx` (footer link)
- `src/pages/Registro.tsx` (footer link)
- `src/pages/Home.tsx` (if it has text links)

**Effort:** 10 minutes

---

### 1.6 Performance: Cumulative Layout Shift (Perfil) - **Impact: Performance +15-20 points**

**Current Issue:** CLS 0.39 on `/perfil` (very high!)

**Likely cause:** Images loading without dimensions

**Fix:**
```tsx
// Add explicit width/height to all images
<img 
  src={avatar} 
  alt="Avatar" 
  width="96"  // Add explicit dimensions
  height="96"
  className="h-24 w-24 rounded-full"
/>
```

**Files to check:**
- `src/pages/Perfil.tsx`
- Any components with dynamic images

**Effort:** 15 minutes

---

## 🔧 Phase 2: Medium Priority (Moderate Impact)

### 2.1 Best Practices: Third-Party Cookies - **Impact: Best Practices +5-8 points**

**Current Issue:** "Utiliza cookies de terceros — Se encontró 1 cookie" on Dashboard, Perfil, Sala

**Investigation needed:**
1. Check if cookie is from Firebase Auth
2. If Firebase, document as necessary for authentication
3. If avoidable, remove third-party cookie usage

**Files to check:**
- `src/services/firebase.ts`
- Network tab in DevTools (identify cookie source)

**Effort:** 20 minutes

---

### 2.2 Best Practices: Browser Console Errors - **Impact: Best Practices +3-5 points**

**Current Issue:** "Se registraron errores del navegador en la consola" on Login, Perfil, Registro, Sala

**Action:**
1. Open each page in DevTools
2. Document all console errors
3. Fix or suppress legitimate errors
4. Add error boundaries if needed

**Effort:** 30 minutes (investigation + fixes)

---

### 2.3 Performance: Unused JavaScript - **Impact: Performance +5-10 points (long-term)**

**Current Issue:** ~630-670 KiB of unused JavaScript on all pages

**Solutions:**
1. **Code Splitting:** Split route bundles
2. **Lazy Loading:** Dynamic imports for heavy components
3. **Tree Shaking:** Remove unused exports

**Example:**
```tsx
// src/App.tsx - Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sala = lazy(() => import('./pages/Sala'));
```

**Effort:** 1-2 hours (requires testing)

---

### 2.4 Performance: Non-Composited Animations (Sala) - **Impact: Performance +2-3 points**

**Current Issue:** "Evita las animaciones no compuestas — Se encontró 1 elemento animado"

**Current implementation:** PageTransition uses `transform: translateX()` which should be composited

**Investigation:**
1. Check if other animations exist in Sala components
2. Verify GPU acceleration hints (`will-change`, `transform3d`)

**Files to check:**
- `src/components/layout/PageTransition.tsx` (already optimized)
- `src/components/sala/*` (check for CSS animations)

**Effort:** 15-20 minutes

---

### 2.5 Accessibility: Video Captions (Sala) - **Impact: A11y +1-2 points (optional)**

**Current Issue:** "Los elementos `<video>` contienen un elemento `<track>` con [kind='captions']"

**Context:** This is for WebRTC video streams, which are user-generated and don't have pre-made captions.

**Options:**
1. **Skip:** Document as N/A for real-time video conferencing
2. **Implement:** Add live captioning via speech-to-text API (major feature)

**Recommendation:** Skip for now, document in accessibility statement

**Effort:** 0 minutes (if skipping) or 8+ hours (if implementing)

---

## 🚀 Phase 3: Advanced Optimizations (Lower Priority)

### 3.1 Security Headers (Best Practices) - **Impact: Best Practices +10-15 points**

**Current Issues:**
- "Asegúrate de que la CSP sea eficaz contra los ataques XSS"
- "Mitigar el clickjacking con XFO o CSP"
- "Mitiga el XSS basado en DOM con Trusted Types"

**Solution:** Add security headers in `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://proyecto-integrador-backend-production.up.railway.app wss://proyecto-integrador-backend-production.up.railway.app https://firebasestorage.googleapis.com;"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Warning:** CSP is complex and can break functionality. Test thoroughly.

**Effort:** 1-2 hours (with testing)

---

### 3.2 Source Maps in Production - **Impact: Best Practices +2 points**

**Current Issue:** "Faltan mapas de orígenes para el archivo JavaScript grande propio"

**Fix:** Enable source maps in `vite.config.ts`

```ts
export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps
  },
});
```

**Trade-off:** Larger bundle size vs. better debugging

**Effort:** 2 minutes + deploy test

---

### 3.3 Cache Headers - **Impact: Performance +2-5 points**

**Current Issue:** "Usa tiempos de almacenamiento en caché eficientes — Ahorro estimado de 1 KiB"

**Solution:** Add cache headers in `vercel.json`

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Effort:** 10 minutes

---

## 📋 Implementation Checklist

### Phase 1 (Target: 2-3 hours)

- [ ] **1.1** Add meta description to `index.html`
- [ ] **1.2** Fix or create `public/robots.txt`
- [ ] **1.3** Verify all pages have `<h1>` inside `<main>`
- [ ] **1.4** Fix all contrast issues (text-slate-400/500 → 600+)
- [ ] **1.5** Add underlines to text links in Login/Registro
- [ ] **1.6** Fix CLS in Perfil page (add image dimensions)

**Expected outcome:** SEO 90-95, A11y 92-98, Performance 85-100

---

### Phase 2 (Target: 3-4 hours)

- [ ] **2.1** Investigate third-party cookies
- [ ] **2.2** Fix console errors on all pages
- [ ] **2.3** Implement code splitting (optional, time permitting)
- [ ] **2.4** Verify no non-composited animations

**Expected outcome:** Best Practices 85-90, Performance 90+

---

### Phase 3 (Optional)

- [ ] **3.1** Add security headers (CSP, XFO, etc.)
- [ ] **3.2** Enable source maps
- [ ] **3.3** Add cache headers

**Expected outcome:** Best Practices 90-95

---

## 🎯 Expected Final Scores

| Page | Performance | A11y | Best Practices | SEO |
|------|-------------|------|----------------|-----|
| Home | 90-95 | 95-100 | 90-95 | 92-100 |
| Login | 95-100 | 95-100 | 90-95 | 92-100 |
| Dashboard | 95-100 | 95-100 | 85-90 | 92-100 |
| Perfil | 90-95 | 95-100 | 85-90 | 92-100 |
| Sala | 85-90 | 95-100 | 85-90 | 92-100 |
| Registro | 95-100 | 95-100 | 90-95 | 92-100 |

---

## 🔍 Testing Strategy

1. **Local Testing:**
   ```bash
   npm run build
   npx serve -s dist
   # Run Lighthouse on localhost:3000
   ```

2. **Staging Testing:**
   - Deploy to Vercel preview
   - Run Lighthouse on preview URL

3. **Production Validation:**
   - Run Lighthouse on production URL
   - Test with NVDA/VoiceOver for accessibility

---

## 📝 Notes

- `.cursor` folder is already in `.gitignore` and not tracked by Git ✅
- All accessibility HUs are implemented ✅
- Focus management works correctly ✅
- Reduced motion support is comprehensive ✅
- Connection resilience is robust ✅

---

## 🚦 Start Here

**Recommended order:**

1. Start with Phase 1.1-1.2 (SEO fixes - 10 min)
2. Move to Phase 1.4 (Contrast - 30 min)
3. Fix Phase 1.6 (CLS in Perfil - 15 min)
4. Complete Phase 1.3, 1.5 (Remaining A11y - 20 min)
5. Move to Phase 2 if time permits

**Total Phase 1 time:** ~2 hours

**Total estimated improvement:** +15-25 points across all metrics
