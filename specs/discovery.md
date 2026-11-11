# Entendendo o problema (Discovery)

## Contexto

A empresa deseja oferecer uma aplicação de previsão do tempo. O briefing indica as principais capacidades esperadas, mas ainda não define detalhes de experiência, cobertura de dados, critérios de qualidade ou regras de negócio.

## Requisitos funcionais

Os requisitos abaixo usam padrões EARS, especialmente o padrão orientado a evento: **Quando** ocorrer um evento, **o sistema deve** responder de forma especificada.

- **FR-01 — Buscar cidades (EARS, orientado a evento):** Quando o usuário enviar uma consulta por cidade, o sistema deve apresentar cidades correspondentes para seleção.
- **FR-02 — Selecionar cidade (EARS, orientado a evento):** Quando o usuário selecionar uma cidade, o sistema deve usar essa cidade como local da consulta meteorológica.
- **FR-03 — Clima atual (EARS, orientado a evento):** Quando uma cidade for selecionada, o sistema deve apresentar as condições meteorológicas atuais disponíveis para essa cidade.
- **FR-04 — Previsão de cinco dias (EARS, orientado a evento):** Quando uma cidade for selecionada, o sistema deve apresentar a previsão do tempo para os próximos cinco dias.
- **FR-05 — Alternar unidade (EARS, orientado a evento):** Quando o usuário escolher Celsius ou Fahrenheit, o sistema deve exibir as temperaturas nessa unidade.

## Cenários de aceitação (Gherkin)

```gherkin
# language: pt
Funcionalidade: Consultar o tempo por cidade

	Cenário: Buscar uma cidade
		Dado que o usuário está na aplicação
		Quando enviar uma consulta por cidade
		Então o sistema apresenta cidades correspondentes para seleção

	Cenário: Consultar o clima atual de uma cidade
		Dado que o usuário tem uma cidade selecionada
		Quando a consulta meteorológica for concluída
		Então o sistema apresenta as condições meteorológicas atuais disponíveis

	Cenário: Consultar a previsão de cinco dias
		Dado que o usuário tem uma cidade selecionada
		Quando a consulta de previsão for concluída
		Então o sistema apresenta a previsão para os próximos cinco dias

	Cenário: Alternar a unidade de temperatura
		Dado que temperaturas estão sendo exibidas
		Quando o usuário escolher Celsius ou Fahrenheit
		Então o sistema exibe as temperaturas na unidade escolhida
```

## Requisitos não funcionais

- **NFR-01 — Responsividade (EARS, orientado a evento):** Quando a aplicação for acessada em um dispositivo móvel, o sistema deve adaptar conteúdo e controles à tela, mantendo legibilidade e acesso às funcionalidades principais.
- **NFR-02 — Acessibilidade (EARS, ubíquo):** O sistema deve permitir que os controles principais sejam operados por teclado e compreendidos por tecnologias assistivas.
- **NFR-03 — Falha de dados (EARS, comportamento indesejado):** Se a rede ou o serviço de dados estiver indisponível, o sistema deve informar que não foi possível obter os dados meteorológicos.
- **NFR-04 — Usabilidade (EARS, ubíquo; a validar):** O sistema deve permitir que o usuário encontre e opere as ações principais de busca, consulta e troca de unidade de forma compreensível. Critérios mensuráveis de usabilidade ainda precisam ser definidos.
- **NFR-05 — Atualidade dos dados (EARS, ubíquo; a definir):** O sistema deve apresentar dados meteorológicos atualizados conforme uma frequência de atualização que ainda precisa ser acordada.

> Os requisitos não funcionais são expectativas derivadas do briefing. Limites mensuráveis, como tempo de resposta, frequência de atualização, dispositivos suportados e metas de acessibilidade, precisam ser definidos na especificação do produto.

## Riscos

- **Ambiguidade na busca:** nomes de cidades podem se repetir ou ter grafias semelhantes; sem contexto de país ou região, o usuário pode selecionar o local errado.
- **Dependência de serviço externo:** falhas, lentidão ou limites do provedor de dados podem impedir ou atrasar as consultas.
- **Atualidade e interpretação dos dados:** sem definição de fonte, frequência de atualização e fuso horário, as informações podem parecer desatualizadas ou ser interpretadas incorretamente.
- **Escopo de “cinco dias”:** pode significar cinco dias-calendário ou as próximas 120 horas, e a apresentação esperada ainda não está definida.
- **Uso em telas pequenas:** se a densidade de informações não for planejada, a previsão pode ficar difícil de consultar em dispositivos móveis.
- **Conversão de unidades inconsistente:** alternar a unidade pode deixar valores ou rótulos divergentes caso a conversão não seja aplicada a todas as temperaturas exibidas.

## Perguntas em aberto (open questions)

- A busca deve aceitar nomes em quais idiomas? Deve sugerir resultados enquanto o usuário digita?
- Como diferenciar cidades homônimas: país, estado/região ou outro contexto deve ser exibido?
- A aplicação deve usar a localização atual do dispositivo ou a busca manual é suficiente?
- Quais informações compõem o clima atual e cada dia da previsão (por exemplo, temperatura mínima e máxima, sensação térmica, precipitação e condição do tempo)?
- A previsão deve mostrar dias-calendário ou períodos das próximas 120 horas? Em qual fuso horário?
- Celsius ou Fahrenheit deve ser a unidade inicial? A preferência do usuário deve persistir entre visitas?
- Quais requisitos de atualização, precisão e cobertura geográfica dos dados são necessários?
- Como a aplicação deve se comportar quando não houver resultados, conexão ou dados disponíveis?
- Há requisitos de desempenho, navegadores/dispositivos suportados, acessibilidade ou idiomas que devam ser atendidos?
- Há metas de uso, público-alvo ou critérios de sucesso para avaliar se a aplicação atende à necessidade do negócio?
