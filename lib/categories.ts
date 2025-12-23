// Complete category list for Dezapegão

export type CategoryType =
    | 'agro_industria'
    | 'animais'
    | 'artigos_infantis'
    | 'audio'
    | 'autos'
    | 'autopecas'
    | 'cameras_drones'
    | 'casa_decoracao'
    | 'celulares'
    | 'comercio'
    | 'eletro'
    | 'esportes'
    | 'escritorio'
    | 'games'
    | 'imoveis'
    | 'informatica'
    | 'construcao'
    | 'moda_beleza'
    | 'moveis'
    | 'musica_hobbies'
    | 'servicos'
    | 'tvs_video'
    | 'vagas_emprego'

export const ALL_CATEGORIES = [
    { value: 'agro_industria', label: 'Agro e indústria', icon: '🚜' },
    { value: 'animais', label: 'Animais de estimação', icon: '🐾' },
    { value: 'artigos_infantis', label: 'Artigos Infantis', icon: '👶' },
    { value: 'audio', label: 'Áudio', icon: '🎧' },
    { value: 'autos', label: 'Autos', icon: '🚗' },
    { value: 'autopecas', label: 'Autopeças', icon: '🔧' },
    { value: 'cameras_drones', label: 'Câmeras e drones', icon: '📷' },
    { value: 'casa_decoracao', label: 'Casa, Decoração e Utensílios', icon: '🏠' },
    { value: 'celulares', label: 'Celulares e telefonia', icon: '📱' },
    { value: 'comercio', label: 'Comércio', icon: '🏪' },
    { value: 'eletro', label: 'Eletro', icon: '🔌' },
    { value: 'esportes', label: 'Esportes e fitness', icon: '⚽' },
    { value: 'escritorio', label: 'Escritório e Home Office', icon: '💼' },
    { value: 'games', label: 'Games', icon: '🎮' },
    { value: 'imoveis', label: 'Imóveis', icon: '🏢' },
    { value: 'informatica', label: 'Informática', icon: '💻' },
    { value: 'construcao', label: 'Materiais de construção', icon: '🏗️' },
    { value: 'moda_beleza', label: 'Moda e beleza', icon: '👗' },
    { value: 'moveis', label: 'Móveis', icon: '🛋️' },
    { value: 'musica_hobbies', label: 'Música e hobbies', icon: '🎸' },
    { value: 'servicos', label: 'Serviços', icon: '🛠️' },
    { value: 'tvs_video', label: 'TVs e vídeo', icon: '📺' },
    { value: 'vagas_emprego', label: 'Vagas de emprego', icon: '💼' },
] as const

// Top 8 categories shown by default
export const DEFAULT_CATEGORIES = [
    'celulares',
    'moveis',
    'eletro',
    'autos',
    'moda_beleza',
    'esportes',
    'informatica',
    'casa_decoracao',
] as const

export function getCategoryIcon(category: string): string {
    const cat = ALL_CATEGORIES.find(c => c.value === category)
    return cat?.icon || '📦'
}

export function getCategoryLabel(category: string): string {
    const cat = ALL_CATEGORIES.find(c => c.value === category)
    return cat?.label || 'Outros'
}
