// =================================================================
// script.js: CÓDIGO FINAL E COMPLETO (Refatoração para Módulo Puro)
// =================================================================
import { createClient } from '@supabase/supabase-js'

// PREENCHA SUAS CHAVES AQUI
const SUPABASE_URL = 'https://gsitdhyairllasnjidfo.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaXRkaHlhaXJsbGFzbmppZGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjk5NzAsImV4cCI6MjA3ODkwNTk3MH0.cLM_H0iErtsR3Q3qPPIbPncPGBrX_Ull83kjrFMlP3E'; 
const TABELA_MANGAS = 'produtos_mangás'; 

// ✅ Cliente Supabase inicializado como um módulo.
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 

// 🚨 LISTA FINAL DE 14 IDS: VALIDADA PELO SQL
const mangasDestaqueIDs = [
    '11393',  // Gachiakuta
    '2456',   // Jujutsu Kaisen
    '5092',   // Kimetsu no Yaiba
    '80',     // Mashle
    '8371',   // Naruto
    '2435',   // Solo Leveling
    '15468',  // Nanatsu no Taizai
    '5883',   // Dr. Stone
    '7131',   // Chainsaw Man
    '4418',   // Tougen Anki
    '17821',  // Diarios de uma Apotecária
    '2508',   // Shingeki no Kyojin (ID Corrigido)
    '4085',   // Black Clover (ID Corrigido)
    '4309',   // Fairy Tail (ID Corrigido)
];

// Estruturas de Dados
let todosOsMangas = []; 
let mangasPorId = {};  

const destaquesContainer = document.getElementById('destaquesContainer');
const campoBusca = document.getElementById('campoBusca');
const sugestoesContainer = document.createElement('div');
sugestoesContainer.id = 'sugestoesBusca';
sugestoesContainer.className = 'absolute z-30 w-full bg-gray-700 shadow-lg rounded-lg mt-1 max-h-60 overflow-y-auto';


// =================================================================
// 1. FUNÇÃO PRINCIPAL DE CARREGAMENTO E INICIALIZAÇÃO
// =================================================================

async function carregarMangas() {
    destaquesContainer.innerHTML = '<p class="col-span-2 text-blue-400">Carregando os mais de 17 mil mangás. Aguarde...</p>';

    // ETAPA 1: Puxar TODOS os dados 
    const { data: allData, error: allError } = await supabase
        .from(TABELA_MANGAS)
        .select('ID, Título, Categoria, image_url, page_url') 
        .limit(20000); 

    if (allError) {
        destaquesContainer.innerHTML = `<p class="col-span-2 text-red-500">Erro ao carregar dados: ${allError.message}.</p>`;
        console.error('Erro Supabase (All Data):', allError);
        return;
    }

    todosOsMangas = allData;
    mangasPorId = {};

    // Cria o Hashmap (O(1)) na inicialização
    allData.forEach(manga => {
        mangasPorId[manga.ID.toString()] = manga; 
    });

    // ----------------------------------------------------
    // ETAPA 2: RENDERIZAÇÃO DOS DESTAQUES INICIAIS
    // ----------------------------------------------------
    destaquesContainer.innerHTML = ''; 
    
    const destaques = mangasDestaqueIDs
        .map(id => mangasPorId[id]) 
        .filter(manga => manga); 

    destaques.forEach(manga => {
        destaquesContainer.appendChild(criarCard(manga));
    });
    
    if (destaques.length === 0 && allData.length > 0) {
        destaquesContainer.innerHTML = '<p class="col-span-2 text-yellow-400">Dados carregados, mas nenhum dos IDs de Destaque foi encontrado. Verifique se os IDs na lista *mangasDestaqueIDs* existem no banco de dados.</p>';
    } else if (allData.length === 0) {
        destaquesContainer.innerHTML = '<p class="col-span-2 text-red-500">A tabela de mangás não retornou dados. Verifique o nome da tabela e as chaves API.</p>';
    } else {
         destaquesContainer.insertAdjacentHTML('afterbegin', `<h2 class="col-span-2 text-green-400 mb-4">✅ ${destaques.length} Mangás em Destaque Carregados!</h2>`);
    }

    campoBusca.parentNode.style.position = 'relative'; 
    campoBusca.parentNode.insertBefore(sugestoesContainer, campoBusca.nextSibling);
    
    // ✅ NOVO: Adiciona os event listeners dos botões após o DOM estar pronto
    adicionarListenersDosBotoes();
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
        <a href="${manga.page_url}" target="_blank" class="text-blue-400 hover:text-blue-300 text-xs font-semibold">Ver Página</a>
        <p class="text-green-500 text-xs">ID: ${manga.ID}</p>
    `;
    return card;
}

function exibirResultados(resultados, instrucao, tempo) {
    const areaResultados = document.getElementById('areaResultados'); // Mudando para a área de resultados abaixo

    areaResultados.innerHTML = ''; // Limpa a área de resultados
    
    const header = document.createElement('h2');
    header.className = 'col-span-full text-lg font-semibold text-blue-400 mb-4';
    header.innerHTML = `${instrucao} <span class="text-sm text-yellow-400">Tempo: ${tempo.toFixed(3)} ms</span>`;
    areaResultados.appendChild(header);

    if (!resultados || resultados.length === 0 || (resultados.length === 1 && !resultados[0])) {
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


// Função de busca 1: Busca por ID (Hashmap / O(1))
async function buscarHashmap() {
    const termo = campoBusca.value.trim();
    if (!termo) return alert('Por favor, insira um ID para a Busca O(1).');

    sugestoesContainer.innerHTML = '';

    const inicio = performance.now();
    const resultado = mangasPorId[termo]; 
    const fim = performance.now();
    const tempo = fim - inicio;

    exibirResultados([resultado], `Busca por ID (Hashmap - O(1)) concluída.`, tempo);
}

// Função de busca 2: Busca por Título (Indexada / O(log n))
async function buscarIndexada() {
    const termo = campoBusca.value.trim();
    if (!termo || !isNaN(termo)) return alert('Por favor, insira parte de um TÍTULO para a Busca O(log n).');

    sugestoesContainer.innerHTML = '';

    const inicio = performance.now();
    
    const { data: resultados, error } = await supabase
        .from(TABELA_MANGAS)
        .select('ID, Título, Categoria, image_url, page_url') 
        .ilike('Título', `%${termo}%`); 

    const fim = performance.now();
    const tempo = fim - inicio;

    if (error) {
        console.error(error);
        exibirResultados([], `Erro na Busca O(log n).`, tempo);
        return;
    }

    if (resultados && resultados.length > 0) {
        resultados[0].instrucao = `ID para Busca O(1): ${resultados[0].ID} (Clique para Copiar)`;
    }

    exibirResultados(resultados, `Busca por Título (Indexada/Supabase - O(log n)) concluída. Total de ${resultados.length} resultados.`, tempo);
}

// Função de busca 3: Busca por Tipo/Categoria (Sequencial / O(n))
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

    exibirResultados(resultados, `Busca por Tipo (Sequencial em Array - O(n)) concluída. Total de ${resultados.length} resultados.`, tempo);
}

// =================================================================
// 3. IMPLEMENTAÇÃO DO AUTOCOMPLETE (Pesquisa Dinâmica)
// =================================================================

// Função de busca O(log n) para o autocomplete
async function buscarSugestoes(termo) {
    if (termo.length < 2) {
        sugestoesContainer.innerHTML = '';
        return [];
    }
    
    const { data } = await supabase
        .from(TABELA_MANGAS)
        .select('ID, Título')
        .ilike('Título', `%${termo}%`)
        .limit(10); 

    return data || [];
}

// Função para renderizar as sugestões
function renderizarSugestoes(sugestoes) {
    sugestoesContainer.innerHTML = '';

    if (sugestoes.length === 0) {
        sugestoesContainer.innerHTML = '<div class="p-3 text-gray-400">Nenhuma sugestão encontrada.</div>';
        return;
    }

    sugestoes.forEach(manga => {
        const item = document.createElement('div');
        item.className = 'p-3 hover:bg-blue-600 cursor-pointer border-b border-gray-600 flex justify-between items-center';
        
        const nomeId = document.createElement('span');
        nomeId.innerHTML = `<strong>${manga.Título}</strong> (ID: ${manga.ID})`;
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copiar ID';
        copyBtn.className = 'ml-3 px-2 py-1 bg-green-500 text-xs rounded hover:bg-green-600 transition';
        copyBtn.onclick = (e) => {
            e.stopPropagation(); 
            navigator.clipboard.writeText(manga.ID);
            copyBtn.textContent = 'Copiado!';
            setTimeout(() => copyBtn.textContent = 'Copiar ID', 1000);
        };

        item.appendChild(nomeId);
        item.appendChild(copyBtn);
        
        item.onclick = () => {
            campoBusca.value = manga.ID; 
            sugestoesContainer.innerHTML = ''; 
            buscarHashmap(); 
        };

        sugestoesContainer.appendChild(item);
    });
}

// Listener principal do campo de busca para o Autocomplete
campoBusca.addEventListener('input', async (e) => {
    const termo = e.target.value.trim();
    if (termo.length >= 2) {
        const sugestoes = await buscarSugestoes(termo);
        renderizarSugestoes(sugestoes);
    } else {
        sugestoesContainer.innerHTML = '';
    }
});

// =================================================================
// 4. EXECUÇÃO INICIAL E ASSOCIAÇÃO DE EVENTOS
// =================================================================

/**
 * Funções que associam os listeners aos botões
 */
function adicionarListenersDosBotoes() {
    // 1. Busca por ID (Hashmap - O(1))
    const btnHashmap = document.querySelector('button[onclick="buscarHashmap()"]');
    if (btnHashmap) {
        btnHashmap.removeAttribute('onclick');
        btnHashmap.addEventListener('click', buscarHashmap);
    }

    // 2. Busca por Título (Indexada - O(log n))
    const btnIndexada = document.querySelector('button[onclick="buscarIndexada()"]');
    if (btnIndexada) {
        btnIndexada.removeAttribute('onclick');
        btnIndexada.addEventListener('click', buscarIndexada);
    }

    // 3. Busca por Tipo (Sequencial - O(n))
    const btnSequencial = document.querySelector('button[onclick="buscarSequencial()"]');
    if (btnSequencial) {
        btnSequencial.removeAttribute('onclick');
        btnSequencial.addEventListener('click', buscarSequencial);
    }
}

// Inicia o carregamento quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarMangas); 

// As chamadas para window.onload, window.buscarHashmap, etc., 
// foram removidas pois são desnecessárias em um módulo puro.