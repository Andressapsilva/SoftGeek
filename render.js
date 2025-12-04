// RENDER.JS FUNÇÃO DE INTERFACE E RENDERIZAÇÃO

const areaResultados = document.getElementById('areaResultados');
// tempoBuscaElement não é mais usado na busca unificada, mas mantemos o nome.
const tempoBuscaElement = document.getElementById('tempoBusca'); 

const destaquesContainer = document.getElementById('destaquesContainer');

//Cria e retorna HTML para um card de mangá (Com proporção otimizada)//

function criarCard(manga, tempoBusca = null) {
    const card = document.createElement('div'); 
    
    // Classes do Card: Ajustado para rounded-xl e hover com borda no topo
    card.classList.add(
        'bg-gradient-to-br', 'from-gray-800', 'to-gray-900', 'rounded-2xl', 'shadow-2xl', 'p-6', 'flex', 'flex-col', 
        'transition', 'duration-300', 
        'hover:border-t-4', 'hover:border-blue-400', 'hover:scale-105', 'hover:shadow-blue-500/50'
    );

    // Formata o Tempo de Busca
    const tempoHTML = tempoBusca ?
        `<p class="text-xs font-bold text-yellow-400 mt-2"> Tempo: ${tempoBusca.toFixed(4)} ms </p>` :
        '';

    // Link para mais informações sobre o mangá
    const linkDetalhes = manga.page_url ?
        `<a href="${manga.page_url}" target="_blank" class="block mt-4 text-center bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition shadow-lg">
             Ver Página
           </a>` : '';

    card.innerHTML = `
        <div class="h-72 w-full overflow-hidden rounded-xl mb-4 border-2 border-gray-700 flex justify-center items-center mx-auto hover:border-blue-500 transition">
            <img src="${manga.image_url}" alt="${manga.Título}"
                onerror="this.onerror=null;this.src='https://via.placeholder.com/160x224?text=Imagem+Ausente'"
                
                // object-cover: Faz a imagem cobrir todo o espaço com zoom
                class="object-cover h-full w-full hover:scale-110 transition duration-300"> 
        </div>
        
        <h4 class="text-white text-xl font-extrabold truncate w-full text-center mb-2 drop-shadow-lg"> ${manga.Título}</h4> 
        
        <p class="text-sm text-gray-200 font-medium text-center mb-3"> ${manga.Categoria || 'N/A'}</p>
        
        <div class="mt-auto"> 
            ${tempoHTML}
            ${linkDetalhes}
        </div>
    `;
    return card;
}

// Exibe os resultados e o tempo na interface//
// NOTA: Esta função não é mais usada para a Busca Unificada no HTML/script.js atual.
function exibirResultados(resultados, mensagem, tempo){
    areaResultados.innerHTML = '';
    tempoBuscaElement.textContent = `${mensagem} Tempo de execução: ${tempo.toFixed(4)} milissegundos.`;

        if (resultados && resultados.length > 0){
            const resultadosParaExibir = resultados.slice(0, 50);

            // Exibe os cards de mangá (sem exibir ID nem botões de cópia)
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