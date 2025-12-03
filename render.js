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
        'bg-gray-800', 'rounded-xl', 'shadow-xl', 'p-4', 'flex', 'flex-col', 
        'transition', 'duration-300', 
        'hover:border-t-4', 'hover:border-blue-500', 'hover:scale-[1.03]'
    );

    // Formata o Tempo de Busca
    const tempoHTML = tempoBusca ?
        `<p class="text-xs font-bold text-yellow-400 mt-2"> Tempo: ${tempoBusca.toFixed(4)} ms </p>` :
        '';

    // Link para mais informações sobre o mangá
    const linkDetalhes = manga.page_url ?
        `<a href="${manga.page_url}" target="_blank" class="block mt-3 text-center bg-blue-600 text-white text-xs font-semibold py-1 rounded hover:bg-blue-700 transition">
             Ver Detalhes
           </a>` : '';

    card.innerHTML = `
        <div class="h-48 w-3/4 overflow-hidden rounded-md mb-3 border border-gray-700 flex justify-center items-center mx-auto">
            <img src="${manga.image_url}" alt="${manga.Título}"
                onerror="this.onerror=null;this.src='https://via.placeholder.com/160x224?text=Imagem+Ausente'"
                
                // object-contain: Garante que a imagem inteira caiba sem cortes.
                class="object-contain h-full w-full"> 
        </div>
        
        <h4 class="text-white text-lg font-extrabold truncate w-full text-center"> ${manga.Título}</h4> 
        
        <p class="text-xs text-gray-400 font-medium text-center"> ${manga.Categoria || 'N/A'}</p>
        
        <p class="text-xs text-blue-400 font-semibold mt-auto pt-2 border-t border-gray-700 text-center"> ID: ${manga.ID}</p>
        
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