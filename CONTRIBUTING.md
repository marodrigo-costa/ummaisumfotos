# Guia de Desenvolvimento - Um Mais Um Fotos

Este guia descreve os padrões, processos e ferramentas necessários para contribuir com o projeto.

## 🚀 Como Começar

### Pré-requisitos
- Node.js (v20+)
- npm ou pnpm
- Conta no Supabase (para desenvolvimento local/staging)

### Configuração do Ambiente
1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   - Copie `.env.example` para `.env.local`.
   - Preencha as chaves do Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🛠️ Padrões de Desenvolvimento

### Commits (Conventional Commits)
Seguimos o padrão de mensagens de commit para manter um changelog limpo e automatizado:
- `feat:` Novas funcionalidades.
- `fix:` Correções de bugs.
- `docs:` Alterações na documentação.
- `style:` Alterações de formatação (CSS, lint).
- `refactor:` Alterações de código que não mudam comportamento.
- `perf:` Melhorias de performance.

### Branching Strategy
- **`main`**: Código em produção (estável).
- **`develop`**: Branch de integração (onde os novos recursos são testados).
- **`feat/nome-da-feature`**: Branch para desenvolvimento de novas funcionalidades.

## 🗃️ Banco de Dados (Supabase)

### Migrações
Todas as alterações no schema devem ser feitas via arquivos `.sql` no diretório `src/utils/supabase/migrations/`.
- Siga a numeração sequencial (ex: `009_nova_tabela.sql`).
- Aplique a migração no console do Supabase após validar localmente.

### Segurança (RLS)
NUNCA desabilite o RLS em uma tabela sem uma justificativa técnica aprovada. Sempre crie políticas de segurança granulares para Administradores e Clientes.

## 🎨 Interface e Design
- **Tailwind CSS**: Use utilitários do Tailwind para estilização.
- **Framer Motion**: Use para animações de entrada e micro-interações para manter o aspecto "premium".
- **Acessibilidade**: Garanta que todos os elementos interativos tenham labels adequadas e sejam navegáveis via teclado.

## 📦 Deploy
- **Vercel**: O deploy é feito automaticamente a cada push na branch `main`.
- **Ambiente de Homologação**: Deploys em branches de feature geram URLs de preview automáticas na Vercel.

---
*Mantido por @devops-engineer e @documentation-writer*
