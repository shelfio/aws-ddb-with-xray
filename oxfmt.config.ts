import baseConfig, {recommendedIgnorePatterns} from '@shelf/prettier-config/oxfmt';

export default {
  ...baseConfig,
  ignorePatterns: [
    ...recommendedIgnorePatterns,
    'coverage/**',
    'lib/**',
    'renovate.json',
    'tsconfig.json',
  ],
};
