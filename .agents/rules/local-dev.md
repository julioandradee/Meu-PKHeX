# Diretrizes do Projeto para o Desenvolvedor

1. **Execução Local do Projeto**:
   - Sempre que aplicar modificações solicitadas pelo usuário, certifique-se de compilar e rodar o projeto localmente para que ele possa visualizar e testar imediatamente no navegador (porta padrão: `http://localhost:5173/`).
   - No ambiente Windows, a sequência de inicialização é:
     - `dotnet build src/PKHeX.Everywhere.Engine.Host`
     - `npx vite --port 5173` no diretório `src/PKHeX.Web.React` (como processo em segundo plano/daemon).

2. **Nomes de Pokémon e Itens**:
   - **NUNCA traduzir** nomes de espécies de Pokémon (`p.species`), nomes de itens segurados (`heldItem`), itens da mochila (`item.name`) ou nomes de golpes (`move.name`). Eles devem sempre permanecer fiéis ao jogo original em inglês/original.
