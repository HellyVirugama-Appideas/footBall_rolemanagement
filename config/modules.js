/**
 * Central registry of permission-controlled modules.
 * Used to build:
 *   - the Role create/edit permission matrix (view/add/edit/delete per module)
 *   - the sidebar menu (a menu item only shows if the logged-in admin can "view" it)
 *   - route-level authorization checks
 *
 * key    -> stored on Role.permissions[].module, must never change once used in DB
 * label  -> shown in UI
 * path   -> base path used to highlight sidebar / for reference (not required by middleware)
 * countryScoped -> if true, a Sub Admin's data for this module is restricted to
 *                   their assignedCountries, and delete/export is Super-Admin-only
 *                   regardless of role permission (hardcoded business rule)
 */
module.exports = [
  { key: 'roles', label: 'Role Management', path: '/roles' },
  { key: 'admins', label: 'Admin / Sub Admin Management', path: '/admins' },
  { key: 'users', label: 'User Management', path: '/user', countryScoped: true },
  { key: 'cvUpload', label: 'CV Upload', path: '/cv-upload', countryScoped: true },
  { key: 'cvSearch', label: 'CV Search', path: '/cv-search', countryScoped: true },
  { key: 'jobs', label: 'Vacancies', path: '/job' },
  { key: 'categories', label: 'Categories', path: '/category' },
  { key: 'recruiters', label: 'Recruiter', path: '/recruiter' },
  { key: 'jobTitles', label: 'Job Title', path: '/title' },
  { key: 'jobSkills', label: 'Job Skill', path: '/skill' },
  { key: 'cms', label: 'Content Pages', path: '/cms' },
  { key: 'banners', label: 'Banners', path: '/banner' },
  { key: 'newsletter', label: 'Newsletter', path: '/newsletter' },
  { key: 'testimonials', label: 'Testimonial', path: '/testimonial' },
  { key: 'messages', label: 'User Messages', path: '/message' },
];
