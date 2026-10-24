/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Standalone output mode bundles the Next.js server and its minimal
   * node_modules into .next/standalone so the Docker image only needs to
   * copy that directory – not the full node_modules tree.
   *
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/output
   */
  output: "standalone",
};

module.exports = nextConfig;
