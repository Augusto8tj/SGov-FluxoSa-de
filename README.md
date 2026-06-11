
# SGov FluxoSaúde - Rio Claro, RJ

Sistema de Gestão de Transporte Sanitário para a Prefeitura de Rio Claro - RJ.

## 🏛️ Arquitetura por Perfis

O sistema é dividido em três ecossistemas distintos para garantir a eficiência operacional:

### 1. Central de Comando (Secretário/Admin) - `/dashboard`
*   **Objetivo**: Gestão macro e tomada de decisão estratégica.
*   **Recursos**: Painel de aprovação, otimização de rotas por IA, gestão de frota municipal e configurações de usuários.
*   **IA**: Suporte à decisão de prioridade clínica e logística.

### 2. Portal das Unidades (Gerentes UBS) - `/ubs-portal`
*   **Objetivo**: Entrada de demanda e gestão de pacientes.
*   **Recursos**: Cadastro de cidadãos (CNS/Comorbidades), solicitações de transporte e acompanhamento de status.
*   **IA**: Resumo de demanda semanal e recomendações de organização de fila.

### 3. Portal do Condutor (Motoristas) - `/driver`
*   **Objetivo**: Execução de campo e segurança.
*   **Recursos**: Manifesto de viagem digital, integração com Google Maps, checklist de segurança e protocolos de emergência.
*   **IA**: Briefing inteligente de pacientes (ex: alertas de oxigênio ou prioridade alta).

## 🚀 Como conectar ao repositório GitHub

Para sincronizar este projeto com o repositório oficial (`https://github.com/Augusto8tj/SGov-FluxoSa-de.git`), execute os seguintes comandos no seu terminal:

```bash
# 1. Inicialize o git localmente
git init

# 2. Adicione o repositório remoto
git remote add origin https://github.com/Augusto8tj/SGov-FluxoSa-de.git

# 3. Adicione todos os arquivos
git add .

# 4. Crie o commit
git commit -m "Arquitetura multi-perfil: Secretaria, UBS e Motoristas"

# 5. Envie
git branch -M main
git push -u origin main
```

## 🤖 Inteligência Artificial
O sistema utiliza **Genkit (Google Gemini)** para:
- Otimização de rotas em tempo real.
- Classificação de urgência clínica.
- Briefing automatizado para motoristas.
- Insights estratégicos para a secretaria.

---
**2026 - Secretaria Municipal de Ordem Pública - PMRC**
