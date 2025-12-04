// =================================================================
// script.js: VERSÃO FINAL COM JSON LOCAL E REPETIÇÃO PARA TEMPO (O(n))
// =================================================================

// 🚨 NOVO: Define o número de repetições para obter um tempo médio mensurável
const REPETICOES = 1000; 

// REMOVIDO: import { createClient } do Supabase
// REMOVIDO: As constantes SUPABASE_URL, SUPABASE_ANON_KEY e TABELA_MANGAS
// REMOVIDO: A inicialização const supabase = createClient(...)


// 🚨 LISTA FINAL DE 14 IDS: Mantida para RENDERIZAÇÃO DE EXEMPLO (se desejado)
const mangasDestaqueIDs = [
    '11393',    // Gachiakuta
    '2456',     // Jujutsu Kaisen
    '5092',     // Kimetsu no Yaiba
    '80',       // Mashle
    '8371',     // Naruto
    '2435',     // Solo Leveling
    '15468',    // Nanatsu no Taizai
    '5883',     // Dr. Stone
    '7131',     // Chainsaw Man
    '4418',     // Tougen Anki
    '17821',    // Diarios de uma Apotecária
    '2508',     // Shingeki no Kyojin (ID Corrigido)
    '4085',     // Black Clover (ID Corrigido)
    '4309',     // Fairy Tail (ID Corrigido)
];

// Estruturas de Dados
let todosOsMangas = []; 
let mangasPorId = {};   
let temposExecucao = { hashmap: 0, indexada: 0, sequencial: 0 };    

// Função simples de hash (djb2) que retorna hex sem sinal
function computeHash(str) {
    if (!str) return null;
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
        // Mantém em 32 bits
        hash = hash & 0xFFFFFFFF;
    }
    // Converte para valor positivo e hex
    return (hash >>> 0).toString(16);
}

const destaquesContainer = document.getElementById('destaquesContainer');
const campoBusca = document.getElementById('campoBusca');
const sugestoesContainer = document.createElement('div');
sugestoesContainer.id = 'sugestoesBusca';
sugestoesContainer.className = 'absolute z-30 w-full bg-gray-700 shadow-lg rounded-lg mt-1 max-h-60 overflow-y-auto left-0 right-0 box-border';


// =================================================================
// 1. FUNÇÃO PRINCIPAL DE CARREGAMENTO E INICIALIZAÇÃO
// =================================================================

async function carregarMangas() {
    destaquesContainer.innerHTML = '<p class="col-span-2 text-blue-400">Carregando dados locais do data.json...</p>';

    // ETAPA 1: Puxar TODOS os dados do arquivo JSON
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Erro de rede ao carregar data.json. Status: ${response.status}`);
        }
        const allData = await response.json();
        
        // Se o JSON estiver vazio, interrompe
        if (!allData || allData.length === 0) {
            destaquesContainer.innerHTML = '<p class="col-span-2 text-red-500">Erro: O arquivo data.json foi encontrado, mas está vazio. Execute o script Python novamente.</p>';
            return;
        }

        todosOsMangas = allData;
        mangasPorId = {};

        // Cria o Hashmap (O(1)) na inicialização
        allData.forEach(manga => {
            // Usa 'ID' (capitalizado) conforme exportado pelo Python
            mangasPorId[manga.ID.toString()] = manga; 
        });

        // ----------------------------------------------------
        // ETAPA 2: RENDERIZAÇÃO DOS DESTAQUES INICIAIS (agora deve funcionar)
        // ----------------------------------------------------
        destaquesContainer.innerHTML = ''; 
        
        const destaques = mangasDestaqueIDs
            .map(id => mangasPorId[id]) 
            .filter(manga => manga); 

        destaques.forEach(manga => {
            destaquesContainer.appendChild(criarCard(manga));
        });
        
        if (destaques.length === 0) {
            destaquesContainer.innerHTML = '<p class="col-span-2 text-yellow-400">✅ Dados carregados! A busca O(1) já está ativa. Para simplificar a entrega, o projeto focará apenas nas funcionalidades de busca.</p>';
        
            
        }

        campoBusca.parentNode.style.position = 'relative'; 
        campoBusca.parentNode.insertBefore(sugestoesContainer, campoBusca.nextSibling);
        
        adicionarListenersDosBotoes();

    } catch (error) {
        destaquesContainer.innerHTML = `<p class="col-span-2 text-red-500">Falha Crítica ao carregar data.json. Verifique o console. (${error.message})</p>`;
        console.error('Erro de carregamento JSON:', error);
    }
}


// =================================================================
// 2. IMPLEMENTAÇÕES DOS ALGORITMOS DE BUSCA
// =================================================================

function criarCard(manga) {
    const card = document.createElement('div');
    card.className = 'manga-card bg-gray-800 p-4 rounded-lg shadow-xl flex flex-col items-center space-y-3 transform hover:scale-[1.03] transition duration-300';
    
    card.innerHTML = `
        <div class="h-48 w-full overflow-hidden rounded-md flex justify-center items-center">
            <img src="${manga.image_url}" alt="${manga.Título}" onerror="this.onerror=null;this.src='https://via.placeholder.com/192x256?text=Imagem+Ausente'" class="object-cover h-full w-full">
        </div>
        <h3 class="text-white font-bold text-center text-sm truncate w-full">${manga.Título}</h3>
        <p class="text-gray-400 text-xs">${manga.Categoria}</p>
        <a href="${manga.page_url || '#'}" target="_blank" class="text-blue-400 hover:text-blue-300 text-xs font-semibold">Ver Página</a>
        
    `;
    return card;
}

function exibirResultados(resultados, instrucao, tempo) {
    const areaResultados = document.getElementById('areaResultados');

    areaResultados.innerHTML = '';
    // Não exibir a instrução de busca aqui — a tabela na página de relatórios
    // já apresentará tempos e detalhes. Apenas exibimos os resultados (cards).

    if (!resultados || resultados.length === 0 || (Array.isArray(resultados) && resultados.every(r => !r))) {
        const p = document.createElement('p');
        p.className = 'col-span-full text-red-400';
        p.textContent = 'Nenhum resultado encontrado para a busca.';
        areaResultados.appendChild(p);
        return;
    }

    (Array.isArray(resultados) ? resultados : [resultados]).filter(r => r).forEach(manga => {
        const card = criarCard(manga);
        
        if (manga.instrucao) {
              const instrucaoP = document.createElement('p');
              instrucaoP.className = 'text-xs text-yellow-300 mt-1 cursor-pointer hover:text-yellow-100 transition';
              instrucaoP.textContent = manga.instrucao;
              instrucaoP.onclick = (e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(manga.ID);
                  instrucaoP.textContent = 'ID Copiado!';
                  setTimeout(() => instrucaoP.textContent = manga.instrucao, 1000);
              };
              card.appendChild(instrucaoP);
        }
        areaResultados.appendChild(card);
    });
}


// Função de busca 1: Busca por ID (Hashmap / O(1)) - Permanece Intacta
async function buscarHashmap() {
    const termo = campoBusca.value.trim();
    if (!termo) return alert('Por favor, insira um ID para a Busca O(1).');

    sugestoesContainer.innerHTML = '';

    const inicio = performance.now();
    const resultado = mangasPorId[termo]; 
    const fim = performance.now();
    const tempo = fim - inicio;
    
    temposExecucao.hashmap = tempo;

    exibirResultados([resultado], `Busca por ID (Hashmap - O(1)) concluída.`, tempo);
}

// Função de busca 2: Busca por Título (AGORA O(n) Local)
async function buscarIndexada() {
    const termo = campoBusca.value.trim().toLowerCase();
    if (!termo || !isNaN(termo)) return alert('Por favor, insira parte de um TÍTULO para a Busca O(n) Local.');

    sugestoesContainer.innerHTML = '';

    const inicio = performance.now();
    
    // 🚨 ALTERAÇÃO: Filtra localmente no array (O(n)) pois Supabase foi removido
    const resultados = todosOsMangas.filter(manga => 
        manga.Título && manga.Título.toLowerCase().includes(termo)
    );

    const fim = performance.now();
    const tempo = fim - inicio;
    
    temposExecucao.indexada = tempo;

    if (resultados && resultados.length > 0) {
        // não inserir instrução com ID — mantemos apenas os resultados para exibição limpa
    }

    exibirResultados(resultados, `Busca por Título (Sequencial em Array - O(n)) concluída. Total de ${resultados.length} resultados.`, tempo);
}

// Função de busca 3: Busca por Tipo/Categoria (Sequencial / O(n)) - Permanece Intacta
async function buscarSequencial() {
    const termo = campoBusca.value.trim().toLowerCase();
    if (!termo || termo.length < 3) return alert('Por favor, insira um Tipo (ex: "Manga", "One-shot", "Manhwa") para a Busca O(n).');

    sugestoesContainer.innerHTML = '';

    const inicio = performance.now();
    
    const resultados = todosOsMangas.filter(manga => 
        manga.Categoria && manga.Categoria.toLowerCase().includes(termo)
    );

    const fim = performance.now();
    const tempo = fim - inicio;
    
    temposExecucao.sequencial = tempo;

    exibirResultados(resultados, `Busca por Tipo (Sequencial em Array - O(n)) concluída. Total de ${resultados.length} resultados.`, tempo);
}

// =================================================================
// FUNÇÃO PARA BUSCAR E COMPARAR TODOS OS ALGORITMOS
// =================================================================

async function buscarTudoEComparar() {
    const termo = campoBusca.value.trim();
    
    if (!termo) {
        alert('Por favor, digite algo para fazer a busca!');
        return;
    }

    sugestoesContainer.innerHTML = '';
    
    let resultadoHashmap = null;
    let resultadosIndexada = [];
    let resultadosSequencial = [];
    const termoLower = termo.toLowerCase();

    // 1. Busca: Hashmap (ID) - O(1) - SEM REPETIÇÃO
    const inicio1 = performance.now();
    if (!isNaN(termo) && termo.length > 0) { 
        resultadoHashmap = mangasPorId[termo];
    }
    const fim1 = performance.now();
    temposExecucao.hashmap = fim1 - inicio1;


    // 2. Busca: Indexada (Título) - O(n) Local - COM REPETIÇÃO
    const inicio2 = performance.now();
    for (let i = 0; i < REPETICOES; i++) {
        resultadosIndexada = todosOsMangas.filter(manga => 
            manga.Título && manga.Título.toLowerCase().includes(termoLower)
        );
    }
    const fim2 = performance.now();
    // 🚨 CALCULA A MÉDIA
    temposExecucao.indexada = (fim2 - inicio2) / REPETICOES;

    // 3. Busca: Sequencial (Categoria/Tipo) - O(n) Local - COM REPETIÇÃO
    const inicio3 = performance.now();
    for (let i = 0; i < REPETICOES; i++) {
        resultadosSequencial = todosOsMangas.filter(manga => 
            manga.Categoria && manga.Categoria.toLowerCase().includes(termoLower)
        );
    }
    const fim3 = performance.now();
    // 🚨 CALCULA A MÉDIA
    temposExecucao.sequencial = (fim3 - inicio3) / REPETICOES;


    // --- CRIAÇÃO DO RELATÓRIO PARA LOCALSTORAGE ---

    // Pega o ID para o Hash e o Link
    const repHashmapId = resultadoHashmap ? resultadoHashmap.ID.toString() : null;
    const repIndexadaId = (resultadosIndexada.length > 0) ? resultadosIndexada[0].ID.toString() : null;
    const repSequencialId = (resultadosSequencial.length > 0) ? resultadosSequencial[0].ID.toString() : null;

    const relatorio = {
        termo: termo,
        tempos: temposExecucao,
        counts: {
            hashmap: resultadoHashmap ? 1 : 0,
            indexada: resultadosIndexada.length,
            sequencial: resultadosSequencial.length
        },
        representatives: {
            // Garante que o Hash seja calculado apenas se houver um ID
            hashmap: repHashmapId ? { id: repHashmapId, hash: computeHash(repHashmapId) } : null,
            indexada: repIndexadaId ? { id: repIndexadaId, hash: computeHash(repIndexadaId) } : null,
            sequencial: repSequencialId ? { id: repSequencialId, hash: computeHash(repSequencialId) } : null
        },
        // Escolhe uma imagem representativa
        image_url: (resultadoHashmap && resultadoHashmap.image_url) ? resultadoHashmap.image_url :
                   (resultadosIndexada.length > 0 && resultadosIndexada[0].image_url) ? resultadosIndexada[0].image_url :
                   (resultadosSequencial.length > 0 && resultadosSequencial[0].image_url) ? resultadosSequencial[0].image_url : null,
        timestamp: Date.now()
    };

    try {
        localStorage.setItem('softgeek_relatorio', JSON.stringify(relatorio));
    } catch (e) {
        console.error('Erro ao salvar relatório no localStorage:', e);
    }

    // Redireciona para a página de relatórios
    window.location.href = 'relatorios.html';
}



// Função de busca Autocomplete (AGORA O(n) Local)
async function buscarSugestoes(termo) {
    if (termo.length < 2) {
        sugestoesContainer.innerHTML = '';
        return [];
    }
    
    const termoLower = termo.toLowerCase();

    // 🚨 ALTERAÇÃO: Filtra localmente os dados
    const data = todosOsMangas
        .filter(manga => manga.Título && manga.Título.toLowerCase().includes(termoLower))
        .slice(0, 10); // Limita os resultados a 10 (como era no Supabase)

    return data || [];
}

// Função para renderizar as sugestões (sem alterações)
function renderizarSugestoes(sugestoes) {
    sugestoesContainer.innerHTML = '';

    if (sugestoes.length === 0) {
        sugestoesContainer.innerHTML = '<div class="p-3 text-gray-400">Nenhuma sugestão encontrada.</div>';
        return;
    }

    sugestoes.forEach(manga => {
        const item = document.createElement('div');
        item.className = 'p-3 hover:bg-blue-600 cursor-pointer border-b border-gray-600 flex justify-between items-center';
        // Apenas o nome (sem ID) na sugestão
        const nomeSpan = document.createElement('span');
        nomeSpan.innerHTML = `<strong>${manga.Título}</strong>`;
        item.appendChild(nomeSpan);

        // Ao clicar, preenche o campo com o título e executa a busca por título
        item.onclick = () => {
            campoBusca.value = manga.Título;
            sugestoesContainer.innerHTML = '';
            buscarIndexada();
        };

        sugestoesContainer.appendChild(item);
    });
}

// Listener principal do campo de busca para o Autocomplete (sem alterações)
campoBusca.addEventListener('input', async (e) => {
    const termo = e.target.value.trim();
    if (termo.length >= 2) {
        const sugestoes = await buscarSugestoes(termo);
        renderizarSugestoes(sugestoes);
    } else {
        sugestoesContainer.innerHTML = '';
    }
});

// Ao pressionar Enter no campo de busca, executar buscarTudoEComparar()
campoBusca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        buscarTudoEComparar();
    }
});

// =================================================================
// 4. EXECUÇÃO INICIAL E ASSOCIAÇÃO DE EVENTOS
// =================================================================

/**
 * Funções que associam os listeners aos botões (sem alterações)
 */
function adicionarListenersDosBotoes() {
    // ... (lógica que associa os event listeners dos botões)
}

// Inicia o carregamento quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarMangas);