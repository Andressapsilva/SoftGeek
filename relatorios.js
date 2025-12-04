function gerarRelatorio(entradaUsuario) {
    // 1. Buscar mangá pelo título (caso-insensível)
    const mangaEncontrado = mangas.find(m => 
        m.titulo.toLowerCase() === entradaUsuario.toLowerCase()
    );

    if (!mangaEncontrado) {
        alert("Mangá não encontrado!");
        return;
    }

    const id = mangaEncontrado.id;
    const titulo = mangaEncontrado.titulo;
    const categoria = mangaEncontrado.categoria;

    // 2. Medir tempo do Hashmap usando ID
    const inicioHash = performance.now();
    const resultadoHash = hashmap[id] || null;
    const tempoHash = performance.now() - inicioHash;

    // 3. Indexada usando TÍTULO
    const inicioIndexada = performance.now();
    const resultadoIndexada = indexPorTitulo[titulo] || null;
    const tempoIndexada = performance.now() - inicioIndexada;

    // 4. Sequencial usando título OU categoria
    const inicioSeq = performance.now();
    const resultadosSequencial = mangas.filter(
        m => m.titulo.includes(entradaUsuario) || m.categoria.includes(entradaUsuario)
    );
    const tempoSeq = performance.now() - inicioSeq;

    // 5. Enviar pro relatório
    mostrarRelatorio({
        tituloBusca: titulo,
        hash: { tempo: tempoHash, resultado: resultadoHash },
        indexada: { tempo: tempoIndexada, resultado: resultadoIndexada },
        sequencial: { tempo: tempoSeq, resultado: resultadosSequencial }
    });
}
