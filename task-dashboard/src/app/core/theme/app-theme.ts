import { definePreset } from '@primeuix/themes';
import Material from '@primeuix/themes/material';

/**
 * Brand palette pulled from the Figma file's color styles (sampled directly
 * from the design, not eyeballed) — a standard Material Design blue ramp.
 * `700` (#1976D2) is the brand primary shown throughout the design.
 */
export const AppTheme = definePreset(Material, {
  semantic: {
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
      950: '#0B3C8C',
      color: '{primary.700}',
      contrastColor: '#ffffff',
      hoverColor: '{primary.800}',
      activeColor: '{primary.900}',
    },
  },
});
