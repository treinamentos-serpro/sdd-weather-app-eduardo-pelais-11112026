# Weather App — Especificação de Produto

## Overview

Esta especificação é a fonte de verdade do escopo de produto definido para a aplicação de previsão do tempo. Ela transforma o briefing e o discovery em requisitos e critérios verificáveis. Decisões ainda não resolvidas estão registradas em **Open Questions** e não devem ser tratadas como requisitos aprovados.

O produto permite que uma pessoa pesquise e selecione uma cidade, consulte as condições meteorológicas atuais e uma previsão de cinco dias, e alterne a unidade de temperatura entre Celsius e Fahrenheit. As funções principais devem estar disponíveis também em dispositivos móveis.

### Objetivos

- Permitir a consulta meteorológica por cidade escolhida pelo usuário.
- Apresentar condições atuais e previsão para cinco dias.
- Permitir alternar a unidade de temperatura entre Celsius e Fahrenheit.
- Manter as funções principais legíveis e utilizáveis em dispositivos móveis.

## Functional Requirements

Os requisitos usam a forma orientada a evento de EARS: **Quando** ocorrer um evento, **o sistema deve** produzir a resposta descrita.

- **FR-01 — Buscar cidades:** Quando o usuário enviar uma consulta por cidade, o sistema deve apresentar os resultados correspondentes disponíveis para seleção.
- **FR-02 — Selecionar cidade:** Quando o usuário selecionar um resultado, o sistema deve definir essa cidade como o local da consulta meteorológica.
- **FR-03 — Exibir clima atual:** Quando uma cidade for selecionada e houver dados atuais disponíveis, o sistema deve apresentar as condições meteorológicas atuais associadas à cidade.
- **FR-04 — Exibir previsão:** Quando uma cidade for selecionada e houver dados de previsão disponíveis, o sistema deve apresentar cinco dias de previsão associados à cidade.
- **FR-05 — Alternar unidade:** Quando o usuário escolher Celsius ou Fahrenheit, o sistema deve exibir nessa unidade todas as temperaturas apresentadas, sem alterar a cidade ou o período consultado.

## User Stories

- **US-01 — Encontrar uma cidade:** Como pessoa que consulta o tempo, quero buscar uma cidade e selecionar o resultado correto para ver informações meteorológicas daquele local.
- **US-02 — Ver condições atuais:** Como pessoa que consulta o tempo, quero ver as condições atuais da cidade selecionada para entender o clima no momento da consulta.
- **US-03 — Planejar os próximos dias:** Como pessoa que consulta o tempo, quero ver uma previsão para cinco dias da cidade selecionada para planejar atividades próximas.
- **US-04 — Escolher unidade de temperatura:** Como pessoa que consulta o tempo, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.
- **US-05 — Consultar em dispositivo móvel:** Como pessoa que usa um dispositivo móvel, quero acessar as funções principais com conteúdo legível e controles utilizáveis.

## Acceptance Criteria

Os cenários abaixo são critérios de aceite em Gherkin. Os cenários de erro cobrem o comportamento mínimo esperado; a política de recuperação e mensagens específicas permanece sujeita às perguntas em aberto.

```gherkin
# language: pt
Funcionalidade: Consultar o tempo por cidade

	Cenário: Encontrar e selecionar uma cidade
		Dado que a pessoa está na aplicação
		Quando enviar uma consulta por cidade
		Então o sistema apresenta resultados correspondentes disponíveis
		Quando selecionar um dos resultados
		Então esse resultado passa a ser o local da consulta meteorológica

	Cenário: Exibir as condições atuais
		Dado que uma cidade está selecionada
		E há dados meteorológicos atuais disponíveis para ela
		Quando a consulta for concluída
		Então o sistema apresenta as condições atuais associadas à cidade

	Cenário: Exibir cinco dias de previsão
		Dado que uma cidade está selecionada
		E há dados de previsão disponíveis para ela
		Quando a consulta for concluída
		Então o sistema apresenta cinco dias de previsão associados à cidade

	Cenário: Alternar a unidade de temperatura
		Dado que temperaturas estão sendo apresentadas
		Quando a pessoa escolher Celsius ou Fahrenheit
		Então todas as temperaturas apresentadas usam a unidade escolhida
		E a cidade e o período consultados permanecem os mesmos

	Cenário: Usar as funções principais em dispositivo móvel
		Dado que a aplicação foi acessada em um dispositivo móvel
		Quando a pessoa buscar uma cidade, consultar seus dados ou alternar a unidade
		Então o conteúdo permanece legível
		E os controles das funções principais permanecem utilizáveis

	Cenário: Nenhum resultado corresponde à busca
		Dado que a busca não encontra uma cidade correspondente
		Quando os resultados forem apresentados
		Então o sistema informa que não há resultados
		E não apresenta a cidade não encontrada como selecionada

	Cenário: Os dados meteorológicos não estão disponíveis
		Dado que uma cidade está selecionada
		Quando a rede ou o serviço de dados não permitir obter as informações
		Então o sistema informa que não foi possível obter os dados meteorológicos
		E não apresenta dados indisponíveis como se fossem atuais
```

## Non-Functional Requirements

- **NFR-01 — Responsividade (EARS, orientado a evento):** Quando acessada em dispositivo móvel, a aplicação deve adaptar conteúdo e controles à tela, mantendo legibilidade e acesso às funções principais.
- **NFR-02 — Acessibilidade (EARS, ubíquo):** A aplicação deve permitir operar os controles principais por teclado e compreendê-los com tecnologias assistivas.
- **NFR-03 — Comunicação de indisponibilidade (EARS, comportamento indesejado):** Se a rede ou o serviço de dados estiver indisponível, a aplicação deve informar que não foi possível obter os dados meteorológicos.
- **NFR-04 — Integridade de unidade (EARS, orientado a evento):** Quando a unidade de temperatura for alterada, a aplicação deve manter a mesma cidade e o mesmo período consultados e atualizar a unidade de todas as temperaturas exibidas.
- **NFR-05 — Atualidade dos dados:** A aplicação deve apresentar os dados meteorológicos atuais e de previsão disponibilizados para a consulta. A frequência máxima de atualização e a idade máxima aceitável dos dados ainda não foram definidas.
- **NFR-06 — Usabilidade:** As ações principais de busca, consulta e troca de unidade devem ser compreensíveis e operáveis. Não há, nesta versão, metas quantitativas de usabilidade ou desempenho aprovadas.

## Edge Cases

- **Consulta vazia ou composta apenas por espaços:** não deve ser tratada como uma cidade selecionada. O sistema deve indicar que uma consulta é necessária; a redação da mensagem ainda não está definida.
- **Nenhum resultado:** informar que não há resultados e não substituir uma cidade já selecionada por um local inexistente.
- **Cidades com nomes iguais ou semelhantes:** os resultados podem ser ambíguos. A forma de identificação e os campos de contexto exibidos precisam ser definidos antes da implementação final.
- **Dados atuais ou previsão ausentes:** não apresentar dados ausentes como válidos. A interface deve indicar a indisponibilidade da parte correspondente sem afirmar que os dados estão atualizados.
- **Falha de rede, erro do serviço ou timeout:** informar que os dados não puderam ser obtidos e não permanecer indefinidamente em estado de carregamento. Opções de repetição e comportamento para falha parcial ainda precisam ser definidos.
- **Alternância de unidade antes da seleção de cidade:** a unidade escolhida pode ser aplicada às consultas subsequentes; a unidade inicial e a persistência da preferência estão em aberto.
- **Previsão parcial:** se houver menos de cinco dias de dados disponíveis, não completar os dias ausentes com valores inventados; informar que a previsão está incompleta.
- **Telas pequenas ou ampliação de conteúdo:** controles e informações principais devem continuar acessíveis sem sobreposição ou perda de legibilidade; tamanhos mínimos de tela e critérios de zoom ainda não foram definidos.

## Assumptions

- A consulta começa por busca manual de cidade; não se presume uso da localização do dispositivo.
- O usuário seleciona um resultado da busca antes de consultar clima e previsão.
- A unidade de temperatura é uma preferência de apresentação e não muda a cidade nem os dados meteorológicos consultados.
- Os dados necessários para clima atual e previsão são fornecidos por uma fonte de dados externa; a escolha do provedor é uma decisão técnica e não é definida por esta especificação.
- “Cinco dias” significa cinco entradas diárias de previsão. Se essas entradas forem dias-calendário locais ou períodos de 24 horas, a definição dependerá da resposta em Open Questions.
- Preferências entre visitas, contas de usuário e dados salvos não fazem parte do escopo aprovado nesta versão.

## Risks

| Risco | Impacto | Mitigação de produto |
|---|---|---|
| Cidades homônimas ou nomes semelhantes | O usuário pode consultar o local errado. | Definir quais informações de região/país distinguem resultados; validar a apresentação antes do aceite final. |
| Indisponibilidade, lentidão ou limite da fonte de dados | Clima ou previsão podem não aparecer no momento da consulta. | Comunicar indisponibilidade e evitar apresentar dados ausentes como atuais; definir recuperação e metas de serviço nas etapas seguintes. |
| Frequência de atualização ou fuso horário indefinidos | Os dados podem parecer desatualizados ou pertencer a um dia inesperado. | Definir idade máxima dos dados, fuso e interpretação dos cinco dias antes de fechar os critérios finais. |
| Densidade de dados em telas pequenas | A previsão pode ficar difícil de ler ou operar. | Validar as funções principais em dispositivos móveis e fechar critérios de viewport e acessibilidade. |
| Conversão ou rótulo de unidade inconsistente | A pessoa pode interpretar temperaturas incorretamente. | Exigir a unidade escolhida em todas as temperaturas e validar a consistência ao alternar. |

## Out of Scope

Não fazem parte do escopo definido nesta versão:

- Previsões para período diferente de cinco dias, histórico meteorológico ou mapas/radar.
- Alertas meteorológicos ou notificações push.
- Contas, autenticação, cidades salvas ou sincronização entre dispositivos.
- Uso automático de geolocalização do dispositivo.
- Preferências persistentes entre visitas.
- Comparação entre várias cidades na mesma visualização.
- Definição de provedor, arquitetura, armazenamento, bibliotecas ou outros detalhes de implementação.

## Open Questions

- Como distinguir cidades homônimas: quais informações de país, estado ou região devem aparecer nos resultados?
- A busca deve aceitar nomes em quais idiomas e oferecer sugestões enquanto a pessoa digita?
- “Cinco dias” representa cinco dias-calendário locais ou os próximos cinco períodos de 24 horas? Qual fuso deve orientar a apresentação?
- Quais campos devem aparecer no clima atual e em cada dia da previsão (por exemplo, temperatura mínima/máxima, condição, precipitação e sensação térmica)?
- Qual unidade deve ser usada inicialmente? A escolha de Celsius/Fahrenheit deve persistir entre visitas?
- Qual fonte, cobertura geográfica, frequência de atualização e idade máxima aceitável dos dados devem ser suportadas?
- O que deve ocorrer quando apenas o clima atual ou apenas a previsão estiver disponível? A pessoa deve poder tentar novamente?
- Quais mensagens e ações de recuperação devem ser oferecidas para consulta vazia, nenhum resultado, erro de serviço e timeout?
- Quais tamanhos de tela, dispositivos, navegadores, idiomas e nível de conformidade de acessibilidade devem ser suportados?
- Quais metas mensuráveis de desempenho, disponibilidade e usabilidade são necessárias?
- Quem é o público-alvo prioritário e quais métricas definirão o sucesso do produto?
