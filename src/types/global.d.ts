// Allow dynamic CSS imports in client components (leaflet etc.)
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
