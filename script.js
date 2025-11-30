document.addEventListener("DOMContentLoaded", async () => {
  const destaquesContainer = document.getElementById("destaques-container");
  destaquesContainer.innerHTML = "Carregando destaques...";

  // 🔥 Seu Supabase
  const supabaseUrl = "https://dxwuiyeyvxqpgbxlxsiv.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTY3Mzg1NjUwMCwiZXhwIjoyOTU5NDMyNTAwLCJyb2xlIjoiYW5vbiJ9.VkF8y7Wwfd8urcmEJrcedfCgguwKtn4c94YsaXaf5-s";

  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  // 🛑 TODOS OS IDs DESTAQUE QUE VOCÊ PASSOU
  const destaquesIDs = [
    '11393',  // Gachiakuta
    '2456',   // Jujutsu Kaisen
    '5092',   // Kimetsu no Yaiba
    '80',     // Mashle
    '8371',   // Naruto
    '2435',   // Solo Leveling
    '15468',  // Nanatsu no Taizai
    '5883',   // Dr. Stone
    '7131',   // Chainsaw Man
    '4418',   // Tougen Anki
    '17821',  // Diarios de uma Apotecária

    // Séries principais corrigidas
    '2508',   // Shingeki no Kyojin
    '4085',   // Black Clover
    '4309'    // Fairy Tail
  ];

  try {
    // 🔍 Buscando tudo da tabela (com acentos!)
    const { data: allData, error } = await supabaseClient
      .from("produtos_mangás")
      .select("ID, Título, Categoria, image_url, page_url");

    if (error) {
      console.error("Erro ao buscar dados:", error);
      destaquesContainer.innerHTML = "Erro ao carregar os destaques.";
      return;
    }

    console.log("Dados recebidos do Supabase:", allData);

    // Transformar em índice: { "ID": {objeto} }
    let mangasPorId = {};
    allData.forEach((manga) => {
      mangasPorId[manga.ID.toString()] = manga;
    });

    console.log("Índice por ID:", mangasPorId);

    // Filtrar os destaques
    let listaDestaques = [];

    destaquesIDs.forEach((id) => {
      if (mangasPorId[id]) {
        listaDestaques.push(mangasPorId[id]);
      } else {
        console.warn("⚠ ID não encontrado no banco:", id);
      }
    });

    if (listaDestaques.length === 0) {
      destaquesContainer.innerHTML = "Nenhum destaque encontrado.";
      return;
    }

    // Exibir os destaques
    destaquesContainer.innerHTML = "";

    listaDestaques.forEach((manga) => {
      const card = document.createElement("div");
      card.classList.add("manga-card");

      card.innerHTML = `
        <img src="${manga.image_url}" alt="${manga.Título}">
        <h3>${manga.Título}</h3>
        <p>${manga.Categoria}</p>
        <a href="${manga.page_url}" target="_blank">Ver mais</a>
      `;

      destaquesContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Erro geral:", err);
    destaquesContainer.innerHTML = "Erro inesperado ao carregar destaques.";
  }
});
