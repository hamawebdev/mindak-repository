Replace the existing pack description field with a flexible pack metadata structure.

Requirements:

Implement a metadata system for packs where the admin can create, edit, and remove any number of custom fields (text, numbers, options, etc.).

Remove the old description field from pack management.

Ensure full CRUD support for pack metadata in the admin API.

Update the client-side application to consume and display this metadata instead of the deprecated description field.

Guarantee backward compatibility or define a clean migration path.

Goal:
Provide a fully dynamic metadata-based pack configuration system that works consistently across admin and client interfaces.



npm run migration:generate
npm run migration:run