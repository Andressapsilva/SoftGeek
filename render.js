// RENDER.JS FUNÇÃO DE INTERFACE E RENDERIZAÇÃO

const areaResultados = document.getElementById('areaResultados');
const tempoBuscaElement = document.getElementById('tempoBusca');

const destaquesContainer = document.getElementById('destaquesContainer');

//Cria e retorna HTML para um card de mangá//

function criarCard(manga, tempoBusca = null) {
    const card = document.createElement('div'); //Classes Tailwind para alto constraste
    card.classList.add('bg-gray-800', 'rounded-lg', 'shadow-lg', 'p-3', 'hover:shadow-blue-500/50', 'transition', 'duration-300', 'transform', 'hove:scale-105');

    // Formata o Tempo de Busca
    const tempoHTML = tempoBusca ?
        `<p class="text-sm font-bold text-yellow-400 mt-2"> Tempo: ${tempoBusca.toFixed(4)} ms </p>` :
        '';

    // Link para mais informações sobre o mangá
    const linkDetalhes = manga.page_url ?
        `<a href="${manga.page_url}" target="_blank" class="block mt-3 text-center bg-blue-600 text-white text-xs font-semibold py-1 rounded hover:bg-blue-700 transition">
             Ver Detalhes
         </a>` : '';

    card.innerHTML = `
        <img src="${manga.image_url}" alt="${manga.Titulo}"
            class="w-full h-48 object-cover rounded-md mb-3 border border-gray-700">
        <p class="text-sm text-gray-400 font-medium"> ${manga.Categoria || 'N/A'}</p>
        <h4 class="text-white text-md font-bold truncate"> ${manga.Titulo}</h4>
        <p class="text-xs text-gray-500"> ID: ${manga.ID}</p>
        ${tempoHTML}
        ${linkDetalhes}
    `;
    return card;
}

// Exibe os resultados e o tempo na interface//

function exibirResultados(resultados, mensagem, tempo){
    areaResultados.innerHTML = '';
    tempoBuscaElement.textContent = `${mensagem} Tempo de execução: ${tempo.toFixed(4)} milissegundos.`;

    if (resultados && resultados.length > 0){
        // Cria um container especial para a instrução de cópia do ID
        const instrucaoContainer = document.createElement('div');
        instrucaoContainer.classList.add('col-span-full', 'p-4', 'bg-blue-900/50', 'border', 'border-blue-500', 'rounded-lg', 'mb-4', 'flex', 'justify-between', 'items-center', 'text-white');
        
        const resultadosParaExibir = resultados.slice(0, 50);
        
        // Verifica se o primeiro resultado tem a instrução de cópia do ID (para busca O(log n))
        if (resultadosParaExibir[0] && resultadosParaExibir[0].instrucao) {
            const manga = resultadosParaExibir[0];
            
            const instrucaoTexto = document.createElement('span');
            instrucaoTexto.textContent = manga.instrucao.replace(' (Clique para Copiar)', '');
            
            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copiar ID';
            copyBtn.className = 'px-3 py-1 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(manga.ID);
                copyBtn.textContent = 'ID Copiado!';
                setTimeout(() => copyBtn.textContent = 'Copiar ID', 1000);
            };

            instrucaoContainer.appendChild(instrucaoTexto);
            instrucaoContainer.appendChild(copyBtn);
            areaResultados.appendChild(instrucaoContainer);
        }

        // Exibe os cards de mangá
        resultadosParaExibir.forEach(manga => {
            if (manga) {
                areaResultados.appendChild(criarCard(manga, tempo));
            }
        });
    } else if (resultados && resultados.length == 0) {
        areaResultados.innerHTML = `<p class="text-gray-400 col-span-full">Nenhum resultado encontrado para a busca em ${tempo.toFixed(4)}ms. </p>`; 
    } else {
        areaResultados.innerHTML = `<p class="text-red-500 col-span-full"> Item não encontrado ou erro na busca. </p>`;
    }
}

//Exporta as funções do script.js para serem usadas

window.criarCard = criarCard;
window.exibirResultados = exibirResultados;