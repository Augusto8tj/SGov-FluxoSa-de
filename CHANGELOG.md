# Changelog - SGov FluxoSaúde

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.0.0] - 2024-05-22
### Lançamento da Versão Estável (v1.0.0)

### 🚀 Novidades & Funcionalidades
- **Portal do Cidadão (Público):** Novo canal seguro para pacientes consultarem o status de suas viagens via código de acesso de 6 dígitos, preservando o sigilo de dados.
- **Manifestos de Viagem para UBS:** Visualização em tempo real das escalas logísticas (veículos e motoristas) diretamente no portal das unidades.
- **Arquitetura Multi-Perfil:** Implementação completa dos quatro ecossistemas: Secretaria (Gestão), UBS (Demanda), Motorista (Execução) e Cidadão (Consulta).
- **IA Unificada (Nvidia Nemotron):** Modelo Nvidia Nemotron Nano 9B via OpenRouter como padrão para triagem de urgência e otimização.
- **PWA (Progressive Web App):** Sistema autoinstalável em Android, iOS e Desktop, com suporte a notificações Web Push para alertas críticos.
- **Gestão de Frota Avançada:** Telemetria incluindo odômetro, nível de combustível e histórico de sanitização.

### 🛡️ Segurança & Resiliência
- **Sigilo de Dados (Pseudonimização):** Lógica de mascaramento de nomes de pacientes em canais públicos e processamento de IA.
- **Autenticação Segura:** Fluxo de login robusto com redirecionamento inteligente baseado no perfil (RBAC).

---
**Prefeitura de Rio Claro - RJ**
*Secretaria Municipal de Ordem Pública & Saúde*
