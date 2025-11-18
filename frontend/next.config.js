/** @type {import('next').NextConfig} */

// Lista das pastas do backend que o Next.js deve IGNORAR
// Elas estão um nível ACIMA (../) da pasta 'frontend'
const backendFoldersToIgnore = [
  'API',
  'Application',
  'Domain',
  'Infrastructure',
  'bin',
  'obj'
];

const nextConfig = {
  // Configuração para o 'watch' (observador de ficheiros)
  webpack(config, { isServer }) {
    if (!isServer) {
      
      // --- CORREÇÃO APLICADA AQUI ---
      // Lógica mais segura para lidar com valores existentes
      
      let ignoredArray = [];
      const existingIgnored = config.watchOptions?.ignored;

      if (Array.isArray(existingIgnored)) {
        // Se já for um array, usa-o
        ignoredArray = existingIgnored;
      } else if (existingIgnored && typeof existingIgnored === 'string') {
        // Se for uma string NÃO VAZIA, coloca-a num array
        ignoredArray = [existingIgnored];
      }
      // Se for undefined, null, ou uma string vazia, ignoredArray fica `[]`
      // --- FIM DA CORREÇÃO ---

      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          ...ignoredArray, // Usa o array limpo
          
          // Mapeia as pastas para GLOBS (strings)
          ...backendFoldersToIgnore.map(folder => 
            `../${folder}/**`
          ),
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;