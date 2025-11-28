/** @type {import('next').NextConfig} */

// Lista das pastas do backend que o Next.js deve IGNORAR
const backendFoldersToIgnore = [
  'API',
  'Application',
  'Domain',
  'Infrastructure',
  'bin',
  'obj'
];

const nextConfig = {
  output: 'export', // <--- OBRIGATÓRIO: Cria a pasta 'out'
  
  images: {
    unoptimized: true, // <--- OBRIGATÓRIO: Necessário para exportação estática no Amplify
  },

  // Configuração para o 'watch' (mantém a sua lógica de ignorar pastas do backend)
  webpack(config, { isServer }) {
    if (!isServer) {
      let ignoredArray = [];
      const existingIgnored = config.watchOptions?.ignored;

      if (Array.isArray(existingIgnored)) {
        ignoredArray = existingIgnored;
      } else if (existingIgnored && typeof existingIgnored === 'string') {
        ignoredArray = [existingIgnored];
      }

      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          ...ignoredArray,
          ...backendFoldersToIgnore.map(folder => `../${folder}/**`),
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
