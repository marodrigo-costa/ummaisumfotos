# Arquitetura do Projeto - Um Mais Um Fotos

Este documento descreve as decisões arquiteturais e a estrutura técnica do projeto.

## 🏗️ Visão Geral

O projeto utiliza **Next.js 15+** com o **App Router**, focado em performance, SEO e uma experiência de usuário (UX) premium. A persistência de dados e autenticação são gerenciadas pelo **Supabase**.

## 🧩 Camadas do Sistema

### 1. Frontend (Next.js)
- **App Router**: Organização de rotas baseada em diretórios.
  - `(auth)`: Fluxo de login e registro.
  - `(admin)`: Dashboard de gestão protegido.
  - `(public)`: Landing page e páginas de visualização.
  - `(dashboard)`: Área logada do cliente.
- **Componentes**: Divididos por domínio e responsabilidade (`components/admin`, `components/sections`, `components/ui`).
- **Animações**: Framer Motion para transições de layout e micro-interações.

### 2. Backend (Supabase)
- **Database**: PostgreSQL com RLS (Row Level Security) habilitado em todas as tabelas. 
  - *Veja a documentação completa em [DATABASE.md](./DATABASE.md).*
- **Auth**: Autenticação customizada via WhatsApp (OTP) integrada com os perfis do Supabase.
- **Storage**: Buckets para armazenamento de imagens de ensaios e assets da landing page.

### 3. Middleware
- Localizado em `src/middleware.ts`, gerencia o redirecionamento automático baseado no perfil do usuário (`is_admin`).
- Garante que administradores não acessem áreas de clientes e vice-versa.

## 🔐 Segurança e Permissões

- **RLS**: Nenhuma query é executada no cliente sem passar pelas políticas de segurança do PostgreSQL.
- **Admin Flag**: O campo `is_admin` na tabela `profiles` é a fonte da verdade para permissões elevadas.

## 📱 PWA (Progressive Web App)

- Manifest configurado em `public/manifest.json`.
- Prompt de instalação customizado para dispositivos iOS e Android.

---
*Mantido por @devops-engineer e @documentation-writer*
