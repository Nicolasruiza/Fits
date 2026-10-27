/* FITS shared data pipeline: the one ordered list of data steps every page runs.
   Each step builds or patches window.FITS_DATA (or a shared map/global), so order matters.
   Add, remove, reorder or cache-bump a data step here only, never in a page.

   Pages load it as the first script in <body>, then their own UI scripts:
     <script src="fits-pipeline.js?v=5"></script>
   Cloudflare caches it for 4 hours, so bump that ?v= in every page whenever this file changes.
   document.write keeps the steps parser-blocking and in order, before the page's own scripts
   and before DOMContentLoaded, exactly like the static <script> tags it replaces.

   scripts/audit-fits.mjs and scripts/validate-data.mjs read FITS_PIPELINE to run the same steps in Node. */
(()=>{
  const steps=[
    // Source data: edit records in data-catalog.js and bump its ?v= here
    'data-catalog.js?v=12',
    // Wardrobe cleanup
    'wardrobe-canonical-v2.js?v=5',
    'look-aliases.js?v=1',
    'wardrobe-normalize.js?v=1',
    'wardrobe-redundancy.js?v=5',
    'wardrobe-draft-prune.js?v=3',
    // Approved looks, families and ownership
    'approved-look-12.js?v=2',
    'loader-audit.js?v=3',
    'approved-photo-integrity.js?v=7',
    'family-variant-rules.js?v=3',
    'family-variant-merge.js?v=17',
    'wardrobe-explicit-state.js?v=16',
    // Climate and seasons
    'climate-rules.js?v=2',
    'winter-layers.js?v=3',
    'season-meta.js?v=27',
    // Look photos, final filtering and swaps
    'look-photo-overrides.js?v=2',
    'image-runtime-v2.js?v=14',
    'real-look-audit.js?v=5',
    'dataset-integrity.js?v=1',
    'closet-swaps.js?v=2',
    // Garment groups for the Wardrobe and Looks filters (FITS_KINDS)
    'garment-kinds.js?v=4',
    // Piece image maps (window.FITS_CATALOG_IMAGES)
    'catalog-images.js?v=2','catalog-batch2.js?v=2','catalog-batch3.js?v=2','catalog-v4.js?v=5'
  ];
  window.FITS_PIPELINE=steps;
  if(typeof document!=='undefined'&&typeof document.write==='function')
    steps.forEach(src=>document.write(`<script src="${src}"><\/script>`));
})();
