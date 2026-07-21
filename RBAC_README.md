# RBAC / Sub Admin System — What's New

Is codebase mein ab poora **Role-Based Access Control (RBAC)** system add kar diya gaya hai — Role Management, Sub Admin Management, aur Country-wise CV/Candidate access control.

## 1. Naye Concepts

- **Super Admin** — pehle se jo bhi admin account tha (ya jo bina role/createdBy ke DB mein already hai), woh automatically **Super Admin** ban jaata hai jab aap app restart karenge (`server.js` mein ek migration chalta hai). Super Admin ke paas hamesha **full access** hota hai — sab modules, sab actions, including Delete & Export.
- **Sub Admin** — Super Admin ke through create hota hai (`/admins/add`). Har Sub Admin ko ek **Role** assign hota hai (jisme decide hota hai ki wo kaunse modules dekh/add/edit kar sakta hai) aur (candidates/CV modules ke liye) **Assigned Countries** (jaise "France").
- **Role** — `/roles` page se Super Admin naye roles bana sakta hai, jisme har module ke liye **View / Add / Edit / Delete** checkboxes hain.

## 2. Hard Business Rule (Jo aapne bola)

> **Delete aur Export sirf Super Admin kar sakta hai — koi bhi Sub Admin nahi, chahe uska role kuch bhi ho.**

Yeh rule **route level par hardcoded** hai (role permissions se bhi upar), in jagah pe:
- `/user/delete/:id` (candidate delete)
- `/user/export` (bulk export)
- `/user/download-all-cvs`, `/user/download-selected-cvs` (bulk CV download)
- `/cv-delete/:id` (CV delete)

Role edit form mein bhi in modules (User Management, CV Upload, CV Search) ke liye "Delete" checkbox disabled dikhta hai, taaki confusion na ho.

## 3. Country-wise Access (aapka France wala example)

1. Super Admin `/roles` pe jaake ek Role banayega — jaise "Country Sub Admin" — jisme **User Management** aur **CV Search** module par View + Edit permission de (Delete off rahega, upar wajah bata di).
2. Super Admin `/admins/add` pe jaake naya Sub Admin banayega:
   - Role select karega (jo upar banaya)
   - **Assigned Countries** field mein likhega: `France`
3. Ab jab yeh Sub Admin login karke **User Management** ya **CV Search** page kholega, usse sirf **France** wale candidates/CVs dikhenge — automatically, DB query level par filter lagta hai.
4. Wo un candidates ko **View aur Edit** kar sakta hai, lekin **Delete** button use dikhega hi nahi (aur agar URL se try kare to bhi server block kar dega).
5. Country field bhi Sub Admin edit nahi kar sakta (locked) — taaki candidate ko apne assigned country se bahar move na kar sake.

## 4. Sidebar / Menu

Sidebar (left navigation) ab automatically wahi modules dikhata hai jinka Sub Admin ke role mein "View" permission hai. Baaki modules bilkul dikhte hi nahi. "Role Management" aur "Admin / Sub Admin" menu sirf Super Admin ko dikhta hai.

## 5. Naye Routes/Pages

| Page | Route | Kisko dikhega |
|---|---|---|
| Role list | `/roles` | jinke paas `roles.view` permission ho (default: Super Admin) |
| Add/Edit Role | `/roles/add`, `/roles/edit/:id` | `roles.add` / `roles.edit` |
| Admin/Sub Admin list | `/admins` | `admins.view` |
| Add/Edit Admin | `/admins/add`, `/admins/edit/:id` | `admins.add` / `admins.edit` |
| Candidate Edit (naya) | `/user/edit/:id` | `candidates.edit` |
| CV Edit (naya) | `/cv-edit/:id` | `cvSearch.edit` |

## 6. Pehli Baar Setup Karte Waqt

Agar aapke paas **already ek admin login hai** (jo aap use kar rahe the), toh kuch karna nahi hai — app restart hote hi wo automatically Super Admin ban jaayega (console mein "RBAC migration: promoted..." log dikhega).

Agar **bilkul fresh database** hai (koi admin nahi), toh yeh command chalayein:

```bash
node createSuperAdmin.js "Your Name" "you@example.com" "YourPassword123"
```

Isse ek Super Admin account create ho jaayega jisse aap login karke Roles aur Sub Admins banana shuru kar sakte hain.

## 7. Files Jo Add/Change Hui Hain

**Naye files:**
- `models/roleModel.js`
- `config/modules.js`
- `middleware/auth.js` (authentication + permission + country-scoping logic)
- `controllers/admin/roleController.js`
- `controllers/admin/adminUserController.js`
- `routes/admin/roleRoutes.js`
- `routes/admin/adminUserRoutes.js`
- `views/role.ejs`, `role_add.ejs`, `role_edit.ejs`
- `views/admin_user.ejs`, `admin_user_add.ejs`, `admin_user_edit.ejs`
- `views/user_edit.ejs` (candidate edit form)
- `views/cv_edit.ejs` (CV edit form)
- `createSuperAdmin.js`

**Modify hui files:**
- `models/adminModel.js` — `isSuperAdmin`, `role`, `assignedCountries`, `status`, `createdBy` fields add hue
- `app.js` — global authentication middleware + naye routers mount kiye
- `server.js` — legacy-admin-to-SuperAdmin migration
- `routes/admin/authRoutes.js` — shared authenticate middleware use karta hai ab
- `routes/admin/userRoutes.js`, `cvRoutes.js`, `categoryRoutes.js`, `jobRoutes.js`, `recruiterRoutes.js`, `jobTitleRoutes.js`, `jobSkillRoutes.js`, `cmsRoutes.js`, `otherRoutes.js` — sab jagah permission-gates lagaye
- `controllers/admin/userController.js` — country-scoped query + naya edit-candidate feature
- `controllers/admin/cvUploadController.js` — country-scoped query + naya edit-CV feature
- `views/_layouts/sidenavbar.ejs` — permission-based menu
- `views/user.ejs`, `user_view.ejs`, `cv_view.ejs`, `cv_search.ejs` — Edit/Delete/Export buttons ab permission ke hisaab se dikhte/chupte hain

## 8. Baaki Modules (Jobs, Categories, Recruiters, etc.)

Inn sab par bhi route-level permission-check lag chuka hai (View/Add/Edit/Delete), aur sidebar mein bhi permission ke hisaab se dikhte hain. Inke andar table ke individual Edit/Delete buttons abhi bhi hamesha dikhte hain (UI polish yahin tak scope mein rakha gaya hai) — lekin agar koi Sub Admin permission na hone ke bawajood URL se try kare, to server **redirect kar dega with error message**, koi unauthorized action nahi hone dega. Agar aap chahen to future mein inn views ke row-level buttons bhi easily `can('module','edit')` checks se gate ho sakte hain — pattern already `user.ejs`/`cv_search.ejs` mein establish kar diya gaya hai.

## 9. Environment Variables

Koi naya environment variable add nahi kiya gaya. `.env` file same rahegi jo pehle thi (DATABASE, JWT_SECRET, SESSION_SECRET, mail keys, etc.) — is zip mein `.env` include nahi hai (security ke liye), apni purani `.env` file wapas rakh dein root folder mein.
