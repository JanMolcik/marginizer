# Product Margins Calculator

A web application for analyzing and optimizing product profit margins. Built for e-commerce businesses to track margin performance and simulate price adjustments.

## Features

- **File Import**: Upload product data from CSV or XLSX files
- **Margin Analysis**: View current margins with color-coded health indicators (low/medium/high)
- **Target Simulation**: Configure custom target margins (e.g., 70%, 75%) and see required price changes
- **Smart Filtering**:
  - Filter by product variants (color, size, etc.)
  - Filter by visibility status (variant/product visibility)
  - Filter by product type (Print/PDF) with automatic detection
- **Product Selection**: Select specific products for export
- **Dynamic Statistics**: Summary stats update based on filtered products
- **Multi-language Support**: Czech and English with number formatting
- **Persistent Storage**: Analyses saved to localStorage with export backup option
- **Storage Abstraction**: Easy to migrate to database backend in the future

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS |
| i18n | i18next + react-i18next |
| File Parsing | SheetJS (xlsx) |
| Build | Vite |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Product Type Detection

Products are automatically categorized as **Print** or **PDF** based on:

1. **Product code** (source of truth): Checks for `/TISK`, `-TISK`, `/PDF`, `-PDF` patterns
2. **Product name** (fallback): Checks for "TISK", "PRINT", or "PDF" in the name

## Margin Health Indicators

| Margin | Status | Color |
|--------|--------|-------|
| < 50% | Low | Red |
| 50-69% | Medium | Amber |
| ≥ 70% | High | Green |

## File Format

The application expects product files with the following columns:

- `code` - Product code
- `name` - Product name
- `price` - Current selling price
- `purchasePrice` - Cost/purchase price
- `relativeMargin` - Current margin percentage
- `variant:*` - Variant columns (Barva, Díl, PDF, TISK, Velikost, etc.)
- `variantVisibility` - Variant visibility status
- `productVisibility` - Product visibility status

## Deployment

Static site deployment to Netlify or Vercel:

```bash
npm run build
# Deploy the `dist` folder
```

## License

Private project for internal use.
