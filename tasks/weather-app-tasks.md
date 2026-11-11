# Backlog de Implementação — Weather App

Fonte: [specs/weather-app-spec.md](../specs/weather-app-spec.md) e [plans/weather-app-plan.md](../plans/weather-app-plan.md).

## Entrega 1 — Busca e seleção explícita

### T-01 — Confirmar contrato de dados do produto

- **Descrição:** resolver as decisões da spec que afetam os tipos e a apresentação de clima atual, previsão, dados parciais e unidade inicial. Se uma decisão não puder ser tomada, mantê-la marcada como bloqueadora, sem inventar comportamento.
- **Critérios de aceite:** a spec define ou identifica explicitamente como pendentes os campos meteorológicos exibidos, a interpretação de cinco dias e fuso, o tratamento de disponibilidade parcial e a unidade inicial/persistência; o plano e os tipos propostos não contradizem essas decisões.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.
- **Tipo:** Infra.

### T-02 — Separar busca e seleção no hook

- **Descrição:** fazer a busca apenas retornar candidatos; consultar o clima somente após `selectCity`.
- **Critérios de aceite:** ao buscar com resultados, `cities` contém os candidatos e `getWeather` não é chamado; ao selecionar uma cidade, a consulta usa exatamente essa cidade; busca vazia não chama os serviços.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`, `tests/unit/useWeather.test.ts`.
- **Tipo:** Data.

### T-03 — Criar lista acessível de cidades

- **Descrição:** criar um componente que apresente candidatos e permita selecionar um deles, diferenciando homônimos com os dados disponíveis.
- **Critérios de aceite:** cada opção mostra nome e, quando disponíveis, região e país; opções têm semântica acessível e podem ser percorridas e escolhidas por teclado; seleção chama o callback com a cidade correspondente.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/CityResults.tsx`, `tests/unit/CityResults.test.tsx`.
- **Tipo:** UI.

### T-04 — Conectar resultados à aplicação

- **Descrição:** integrar lista, hook e apresentação meteorológica, distinguindo estado de busca de estado de consulta.
- **Critérios de aceite:** `App` renderiza os resultados da busca; nenhuma cidade é carregada até seleção; após a seleção, clima atual e previsão da cidade aparecem; busca sem resultados continua exibindo o estado vazio.
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/states/EmptyState.tsx`.
- **Tipo:** UI.

### T-05 — Testar seleção explícita na aplicação

- **Descrição:** cobrir a integração de busca e seleção com múltiplos resultados usando mocks, sem rede real.
- **Critérios de aceite:** teste comprova que buscar não consulta clima automaticamente e que selecionar o segundo resultado carrega os dados desse resultado; casos vazio e sem correspondência não selecionam uma cidade inexistente.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`.
- **Tipo:** Test.

### T-06 — Atualizar E2E do fluxo principal

- **Descrição:** adaptar o fluxo ponta a ponta para selecionar explicitamente um candidato antes de consultar clima.
- **Critérios de aceite:** com APIs interceptadas, o teste executa busca, seleção, clima atual, previsão de cinco dias e troca de unidade; fixture com mais de uma cidade confirma que não há seleção automática; nenhuma chamada real externa é feita.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.

## Entrega 2 — Resiliência e integridade dos dados

### T-07 — Validar estrutura das respostas da API

- **Descrição:** rejeitar JSON ou payloads incompatíveis antes de mapear os dados meteorológicos.
- **Critérios de aceite:** resposta JSON inválida, campos obrigatórios ausentes ou arrays diários com comprimentos incompatíveis produzem erro tipado; resposta válida continua sendo convertida para o modelo de domínio.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`.
- **Tipo:** Data.

### T-08 — Preservar campos opcionais ausentes

- **Descrição:** representar probabilidade de precipitação ausente como `null`/opcional, em vez de convertê-la para zero.
- **Critérios de aceite:** payload com probabilidade `null` ou ausente mantém a ausência no resultado mapeado; payload com valor mantém o valor recebido; testes distinguem ausência de zero por cento.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`, `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`.
- **Tipo:** Data.

### T-09 — Modelar dados meteorológicos parciais

- **Descrição:** ajustar o modelo de domínio para representar indisponibilidade de clima atual ou previsão parcial sem fabricar valores.
- **Critérios de aceite:** tipos permitem ausência de clima atual e lista com menos de cinco dias; o mapeamento conserva somente dados válidos; nenhum dia ou valor ausente é preenchido artificialmente.
- **Dependências:** T-01, T-07, T-08.
- **Arquivos prováveis:** `src/types/weather.ts`, `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`.
- **Tipo:** Data.

### T-10 — Exibir indisponibilidade parcial

- **Descrição:** adaptar componentes para renderizar as seções disponíveis e comunicar a indisponibilidade das partes ausentes.
- **Critérios de aceite:** clima atual ausente não impede a renderização de previsão disponível; previsão incompleta mostra apenas os dias recebidos e identifica que está incompleta; temperaturas e métricas ausentes não recebem rótulos de dados válidos.
- **Dependências:** T-09.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/CurrentWeather.tsx`, `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`, componentes em `src/components/states/`.
- **Tipo:** UI.

### T-11 — Descartar respostas obsoletas

- **Descrição:** impedir que uma busca ou consulta anterior sobrescreva o resultado da operação mais recente.
- **Critérios de aceite:** quando duas buscas ou seleções terminam fora de ordem, somente a resposta da operação mais recente atualiza estado e UI; a proteção é exercitada por teste determinístico.
- **Dependências:** T-02, T-04.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`, `tests/unit/useWeather.test.ts`.
- **Tipo:** Data.

### T-12 — Testar falhas de transporte e payload

- **Descrição:** completar cobertura unitária dos erros da camada de serviço.
- **Critérios de aceite:** testes cobrem falha de rede, timeout, resposta HTTP não-OK, JSON inválido e payload incompatível; cada cenário rejeita com `WeatherServiceError` e não depende da API externa.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`, `src/services/weatherService.ts` se necessário.
- **Tipo:** Test.

## Entrega 3 — Estados, acessibilidade e mobile

### T-13 — Testar apresentação de dados parciais

- **Descrição:** verificar em testes de componente os estados de dados atuais e previsão parciais.
- **Critérios de aceite:** testes cobrem clima atual ausente, previsão parcial, valores opcionais ausentes e mensagens/roles semânticos; valores inexistentes não aparecem como zero.
- **Dependências:** T-03, T-04, T-10.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`, `tests/unit/ForecastList.test.tsx`.
- **Tipo:** Test.

### T-14 — Cobrir retry e estados de falha em E2E

- **Descrição:** verificar comunicação de indisponibilidade e recuperação pelo fluxo completo com APIs interceptadas.
- **Critérios de aceite:** cenário de erro apresenta estado de falha e ação de retry; após resposta bem-sucedida ao retry, os dados são exibidos; cenário sem resultados continua distinto de erro de rede.
- **Dependências:** T-04, T-12.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.

### T-15 — Validar seleção acessível em viewport móvel

- **Descrição:** verificar legibilidade e operabilidade do fluxo de busca e seleção em tela móvel.
- **Critérios de aceite:** em viewport móvel configurado no Playwright, os controles de busca, resultados, seleção e unidade permanecem visíveis e operáveis sem sobreposição; a seleção pode ser feita por teclado; o clima da cidade escolhida é exibido.
- **Dependências:** T-03, T-04.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.

## Critérios de conclusão

- Cada tarefa foi aceita pelos critérios listados e os testes correspondentes foram adicionados ou atualizados.
- As decisões de T-01 não foram presumidas: itens ainda abertos continuam registrados na spec e bloqueiam apenas as tarefas que dependem deles.
- `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` passam ao concluir as tarefas de implementação.
