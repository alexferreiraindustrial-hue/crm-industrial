<h1 align="center">Alex Ferreira</h1>
<p align="center"><b>Estudante de Engenharia de Produção (UniFatecie) · Técnico em Óptica · Lean Six Sigma Yellow Belt</b><br>
Resolvo problemas reais de gestão com <b>Lean, Kanban, 5S e Six Sigma</b> — e uso a <b>Inteligência Artificial</b> para transformar a solução em sistema funcionando.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Lean%20Manufacturing-0e6b62?style=flat-square" alt="Lean">
  <img src="https://img.shields.io/badge/Kanban-0e6b62?style=flat-square" alt="Kanban">
  <img src="https://img.shields.io/badge/5S-0e6b62?style=flat-square" alt="5S">
  <img src="https://img.shields.io/badge/Six%20Sigma%20%C2%B7%20DMAIC-0e6b62?style=flat-square" alt="Six Sigma">
  <img src="https://img.shields.io/badge/PDCA%20%C2%B7%20Kaizen-0e6b62?style=flat-square" alt="PDCA">
  <img src="https://img.shields.io/badge/IA%20aplicada-8b7fd6?style=flat-square" alt="IA aplicada">
</p>

---

> **Perfil híbrido:** gestão da produção + vivência no setor óptico + IA aplicada. Eu enxergo o problema no chão da operação e entrego a solução funcionando — três sistemas em uso real, construídos assim.
>
> **O que me guia:** os maiores erros estão em complicar o que era para ser simples. A indústria sempre tem o que organizar, mesmo com poucos recursos, e a tecnologia de hoje permite que quem conhece o processo construa a solução.

### Como eu trabalho

Não sou programador de formação. Sou alguém que **enxerga o processo**, mede, encontra o desperdício e busca a solução — e hoje a IA me permite ir além da planilha e entregar a solução como software usado de verdade.

```
Problema no dia a dia  →  mapear o processo  →  medir  →  causa raiz  →  solução com IA  →  testar no chão  →  padronizar  →  melhorar de novo
```

- 🏭 **Gestão da produção:** fluxo de valor, gargalos, trabalho padronizado, gestão visual e indicadores
- 📊 **Melhoria contínua:** PDCA, DMAIC, 5S, Kanban, poka-yoke e qualidade na fonte
- 🤖 **IA como ferramenta de engenharia:** eu defino processo, regras e critérios de aceite; a IA ajuda a construir; eu valido em uso real
- 🔗 **Integração e automação:** conecto as ferramentas da operação por **API** e **MCP**, monto fluxos no **n8n**, integro **CRM** e WhatsApp — sem retrabalho e sem planilha paralela
- 👓 **Setor óptico:** formação técnica e vivência dentro de laboratório de montagem

---

### 🧰 Ferramentas que uso para resolver

| Gestão e melhoria | IA e automação | Para construir |
| --- | --- | --- |
| Lean · Kanban · 5S | Claude e outros modelos de IA | Next.js · TypeScript |
| Six Sigma (DMAIC) · PDCA | MCP (Model Context Protocol) | Supabase · PostgreSQL |
| Gestão visual · indicadores | n8n · integrações via API | Vercel · GitHub Actions |
| Mapeamento de processos | CRM · WhatsApp | Git · GitHub |

---

### 🔬 Projeto 1 — [Laboratório Óptico · OticaHub Lab](https://github.com/alexferreiraindustrial-hue/laboratorio-optico)

**Problema:** em um laboratório de montagem de óculos o controle era em papel e WhatsApp — ninguém sabia em que etapa estava cada serviço e o atraso só aparecia quando o cliente cobrava.

**Solução:** um sistema de gestão da produção, **em uso real** em [lab.oticahub.com](https://lab.oticahub.com), construído aplicando ferramentas de Engenharia de Produção:

| Ferramenta | Como virou solução |
| --- | --- |
| Kanban | Fluxo das ordens de serviço em colunas, puxado pelo prazo |
| Gestão visual / Andon | Alerta de risco de atraso **antes** do prazo vencer e ranking em modo TV |
| Trabalho padronizado | Bancada com 5 etapas fixas e a próxima ação em um toque |
| Poka-yoke | O sistema impede marcar como pronto sem todas as etapas e sem defeito aberto |
| Jidoka | Defeito registrado na etapa onde aconteceu, bloqueando o avanço |
| 5S | Cadastros padronizados, etiquetas com QR Code e estoque organizado por grau |

📄 **[Leia o estudo de caso completo no roteiro DMAIC](https://github.com/alexferreiraindustrial-hue/laboratorio-optico/blob/main/docs/estudo-de-caso.md)** · 🗺️ **[Roadmap de melhorias](https://github.com/alexferreiraindustrial-hue/laboratorio-optico/issues)**

<sub>Construído com Next.js, TypeScript e Supabase (PostgreSQL), com apoio de IA.</sub>

### 🏪 Projeto 2 — [ERP Ótica · OticaHub](https://github.com/alexferreiraindustrial-hue/erp-otica)

**ERP web completo para óticas, construído do zero ao final com IA e em uso real por uma empresa.** Código privado — [veja a vitrine do projeto](https://github.com/alexferreiraindustrial-hue/erp-otica).

- Receitas oftálmicas com **leitura automática por IA (OCR)**, vendas, ordem de serviço, estoque com baixa automática, financeiro com DRE, CRM em Kanban e agenda
- **API First**: webhooks, integração com **n8n** e WhatsApp e API para agentes de IA
- Planejado como projeto de engenharia: **22 módulos**, cada um com o mesmo ciclo padronizado de 12 etapas e revisão de qualidade

<sub>Next.js · TypeScript · Prisma · PostgreSQL · n8n · IA</sub>

### 🏭 Projeto 3 — [CRM Industrial](https://github.com/alexferreiraindustrial-hue/crm-industrial)

**Elaborado em conjunto com [Bruna Raphaela de Paula](https://www.linkedin.com/in/bruna-raphaela-de-paula-4427802bb/), profissional de logística e estudante de bacharelado em Administração.** Código privado — [veja a vitrine do projeto](https://github.com/alexferreiraindustrial-hue/crm-industrial).

**Problema:** a informação entre setores nasce no WhatsApp e se perde no celular de uma pessoa. O comercial combina um prazo, a produção não vê e a logística cobra de novo.

**Solução:** um CRM aplicado a uma operação real, que serve a qualquer tipo de empresa:

| Ferramenta | Como virou solução |
| --- | --- |
| Kanban | Quadros com colunas da própria operação, tempo em cada etapa e checklist por serviço |
| Gestão visual | Cor por prazo nos cards e cor de prioridade no contato, já na lista de conversas |
| Poka-yoke | A mesma conversa não abre dois cards no mesmo quadro, e excluir pede confirmação |
| Trabalho padronizado | Modelos de quadro e checklist específico para cada serviço |
| Redução de desperdício | Alerta um dia antes e no dia do prazo, sem depender da memória de alguém |

Por meio da **ANTONIO ALEX SILVA FERREIRA LTDA**, empresa de licenciamento e construção de sistemas e software personalizado, a estrutura apoia o objetivo de habilitação como Tech Provider da Meta.

<sub>Adaptado sobre software de atendimento aberto (Chatwoot CE, licença MIT), com Docker e PostgreSQL, e com apoio de IA.</sub>

---

### 🎯 Aberto a oportunidades

De **estágio** em **Engenharia de Produção, Melhoria Contínua, PCP, Qualidade e Operações** — onde eu possa unir gestão da produção e tecnologia para resolver problemas do dia a dia.

### 📫 Contato

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Antonio%20Alex%20Silva%20Ferreira-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/antonio-alex-silva-ferreira-65434a298/)
[![Site](https://img.shields.io/badge/Site-antonio.oticahub.com-0e6b62?style=for-the-badge)](https://antonio.oticahub.com)
