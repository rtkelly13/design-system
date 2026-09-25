/**
 * Attribution for the mdxcn source this docs graph family adapts.
 *
 * Keep the link in the component files too. This helper is for generated
 * documentation and Storybook captions, not a replacement for source credit.
 */
export const MDXCN_REPOSITORY = 'https://github.com/keshav-exe/mdxcn';
export const MDXCN_COMMIT = '2928126ba146ebbae9c2351deca27d27bb40e744';

export function mdxcnSourceUrl(componentPath: string): string {
  return `${MDXCN_REPOSITORY}/blob/${MDXCN_COMMIT}/${componentPath}`;
}

export function mdxcnAttribution(componentPath: string): string {
  return `Adapted from mdxcn (${mdxcnSourceUrl(componentPath)}), MIT licensed.`;
}
