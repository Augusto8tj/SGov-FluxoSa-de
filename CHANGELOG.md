# Changelog - SGov FluxoSaúde

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.0.0] - 2024-05-22
### Lançamento da Versão Estável (v1.0.0)

### 🚀 Novidades & Funcionalidades
- **Arquitetura Multi-Perfil:** Implementação completa dos três ecossistemas: Secretaria (Gestão), UBS (Demanda) e Motorista (Execução).
- **IA Unificada (Nvidia Nemotron):** Migração para o modelo Nvidia Nemotron Nano 9B via OpenRouter como padrão do sistema, garantindo alta performance e baixo custo.
- **PWA (Progressive Web App):** Sistema agora é autoinstalável em Android, iOS e Desktop, com suporte a funcionamento offline básico.
- **Notificações em Tempo Real:** Implementação de alertas para motoristas e gestores via Web Push.
- **Gestão de Frota Avançada:** Telemetria completa incluindo odômetro, nível de combustível, histórico de sanitização e controle de validade de seguros/revisões.
- **Portal do Condutor:** Manifesto digital com integração Google Maps, checklist de segurança obrigatório e sistema de reporte de ocorrências.
- **Portal UBS:** Acompanhamento transparente de manifestos de viagem e gestão de base de cidadãos (CNS).
- **Central de Comando (Secretaria):** Dashboard estratégico com análise de IA para triagem de urgência e otimização de rotas logísticas.

### 🛡️ Segurança & Resiliência
- **IA Resilience:** Implementação de fallbacks determinísticos locais para garantir operação mesmo com instabilidade em serviços de nuvem.
- **Sigilo de Dados:** Lógica de pseudonimização no envio de dados para modelos de IA externos.
- **Role-Based Access Control (RBAC):** Roteamento inteligente baseado no perfil do usuário logado.

### 🎨 Interface & UX
- **Temas Customizáveis:** Opções de Azul Municipal, Verde Saúde e Roxo Inovação, com suporte a Modo Escuro completo.
- **Design Responsivo:** Interface otimizada para tablets de UBS e smartphones de motoristas.

---
**Prefeitura de Rio Claro - RJ**
*Secretaria Municipal de Ordem Pública & Saúde*
