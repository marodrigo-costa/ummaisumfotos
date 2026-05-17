# Registro de Alterações (Changelog)

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-05-16

### Adicionado
- **Fluxo de Galerias**: Criação da tabela `galleries` e funcionalidade "Disponibilizar Ensaio" atômica com notificação via WhatsApp integrada.
- **Painel do Cliente**: Nova aba "Minha Galeria" com link direto para o SmugMug e empty state encorajador.
- **Gestão de Clientes**: Interface reformulada com ícone oficial do WhatsApp, badge de Admin, e opções de contexto (⋮) incluindo exclusão segura de clientes.
- **Dashboard Financeiro (Admin)**: Resumo financeiro realocado para o rodapé do calendário com filtros de datas independentes, métricas (Previsto vs. Realizado) e barra de progresso visual.
- **Campos Financeiros**: Adição das colunas `scheduled_value` e `realized_value` nos agendamentos (bookings).

### Corrigido
- **Campos de Valor no Modal**: Resolvido o bug que impedia o usuário de apagar o valor "0" nos campos numéricos do modal de agendamento, removendo zeros à esquerda.
- **Consultas de Perfis**: Ajustes na query de usuários para permitir identificar corretamente os admins no frontend e carregar valores financeiros atrelados.

## [0.2.1] - 2026-05-14

### Adicionado
- **Segurança**: Implementação de Logs de Auditoria automáticos via PostgreSQL Triggers. Toda alteração em sessões, planos e conteúdos agora é rastreada na tabela `audit_logs`.
- **Documentação**: Criação do `DATABASE.md` detalhando o schema e políticas RLS.
- **Documentação**: Criação do `CONTRIBUTING.md` com guia de setup, padrões de commit e branching.

## [0.2.0] - 2026-05-14

### Adicionado
- **Lógica de upload multi-imagem**: Atualização do componente `ImageUploader` para lidar com legendas e limites dinâmicos baseados na prop `maxImages`.
- **Melhorias no Painel Admin**: Formulário de "Ensaios Temáticos" aprimorado com melhor UX para seleção de imagens.
- **Legendas Dinâmicas**: Textos de ajuda contextuais nos componentes de upload para evitar confusão do usuário.

### Corrigido
- **Erro de NaN em campos numéricos**: Correção do erro de React ao apagar campos numéricos (`total_slots`, `available_slots`, `price`, `photo_quantity`) através do tratamento de strings vazias nos handlers de `onChange`.
- **Redirecionamento de Login**: Ajuste no fluxo onde administradores eram redirecionados para dashboards de usuários comuns.
- **Banner de Instalação PWA**: Restauração do prompt persistente de instalação PWA no rodapé.

## [0.1.0] - 2026-05-10 (Funcionalidades Iniciais)

### Adicionado
- **Arquitetura Base**: Next.js 15+ (App Router) com integração nativa ao Supabase.
- **Autenticação via WhatsApp**: Sistema de login via OTP (One-Time Password) integrado ao WhatsApp.
- **Painel Administrativo**: CMS inicial para gestão de Ensaios Temáticos e Serviços.
- **Suporte a PWA**: Configuração de service workers e manifest para funcionalidade "Adicionar à Tela de Início".
- **Design System Premium**: Estética refinada com glassmorphism, tipografia Outfit/Inter e paletas de cores harmônicas.
- **Proteção de Middleware**: Guardas de rota para áreas de `admin` e `dashboard`.

---
*Gerado por @documentation-writer*
