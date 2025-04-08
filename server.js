const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/pokemons', async (req, res) => {
  try {
    // Busca os primeiros 10 pokémons
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');
    const data = await response.json();

    const resultados = [];

    for (const item of data.results) {
      const pokemonDetalhes = await fetch(item.url).then(res => res.json());

      const nome = pokemonDetalhes.name;
      const habilidades = pokemonDetalhes.abilities.map(h => h.ability.name);
      const imagem = pokemonDetalhes.sprites.front_default;

      // Buscar evolução
      const speciesData = await fetch(pokemonDetalhes.species.url).then(res => res.json());
      const evolutionData = await fetch(speciesData.evolution_chain.url).then(res => res.json());

      const evolucao = [];
      let current = evolutionData.chain;
      do {
        evolucao.push(current.species.name);
        current = current.evolves_to[0];
      } while (current);

      resultados.push({
        nome,
        habilidades,
        imagem,
        evolucao: evolucao.join(' → ')
      });
    }

    res.json(resultados);
  } catch (err) {
    console.error('Erro ao buscar pokémons da PokéAPI:', err);
    res.status(500).json({ error: 'Erro ao buscar pokémons' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
