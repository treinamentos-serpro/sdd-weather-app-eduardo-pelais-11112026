## Architecture (Overview)

A aplicação manterá a separação já adotada entre interface, orquestração, acesso a dados e funções puras. `App` compõe a experiência; componentes em `src/components/` renderizam a interface; `useWeather` controla busca e seleção; `weatherService` integra com a API e converte as respostas para os tipos de domínio; `src/lib/` concentra formatação e conversão.

Fluxo alvo: `SearchBar → useWeather.search → searchCities → CityResults → useWeather.selectCity → getWeather → CurrentWeather + ForecastList`.

A busca deve apresentar resultados sem selecionar automaticamente o primeiro. A pessoa seleciona uma cidade explicitamente (FR-01/02). A unidade continua sendo estado local de apresentação e não gera nova consulta (FR-05/NFR-04).

## Tech Stack

- TypeScript strict, React 19 e Vite.
- Tailwind CSS para a interface responsiva.
- Open-Meteo Geocoding e Forecast, sem chave de API.
- pnpm, Biome, Vitest, Testing Library e Playwright.
- Estado local do React; não adicionar store global ou biblioteca de validação sem necessidade demonstrada.

## Project Structure

- `src/App.tsx`: compõe a tela, mantém unidade e conecta callbacks.
- `src/components/SearchBar.tsx`: entrada e envio da busca.
- `src/components/CityResults.tsx` (novo): lista acessível de cidades candidatas e seleção explícita, exibindo região/país quando disponíveis.
- `src/components/CurrentWeather.tsx`, `ForecastList.tsx`, `ForecastCard.tsx`, `UnitToggle.tsx`: apresentação dos dados e unidade.
- `src/components/states/`: estados de vazio, carregamento e erro, incluindo retry.
- `src/hooks/useWeather.ts`: orquestra busca, seleção, consulta, erro e retry.
- `src/services/weatherService.ts`: chamadas HTTP, timeout, validação estrutural mínima e mapeamento de DTO externo para domínio.
- `src/types/weather.ts`: contratos `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `Unit`.
- `src/lib/`: funções puras de temperatura, formatação e códigos meteorológicos.
- `tests/unit/` e `tests/e2e/weather.spec.ts`: ampliar a cobertura existente sem criar infraestrutura paralela.

## Data Model

- `City`: `id`, `name`, `country`, `admin1?`, `latitude`, `longitude`.
- `Unit`: `'celsius' | 'fahrenheit'`; temperaturas internas permanecem Celsius.
- `CurrentWeather`: `time`, `temperature`, `weatherCode`, `humidity`, `windSpeed`, `pressure`, `precipitation` conforme os campos aprovados para exibição.
- `ForecastDay`: `date`, `min`, `max`, `weatherCode` e `precipitationProbability` opcional/nulo quando não fornecido. Ausência nunca é convertida em zero.
- `WeatherData`: associa `City` aos dados atuais e à lista diária. Representar separadamente dados atuais ausentes e previsão parcial; nunca inventar entradas para completar cinco dias.
- DTOs da Open-Meteo permanecem privados ao `weatherService`; validar estrutura antes do mapeamento.

Os campos meteorológicos, a semântica de cinco dias e o fuso são decisões de produto ainda abertas e devem ser confirmados antes de congelar os contratos da camada de apresentação.

## Data Flow

1. `SearchBar` envia termo normalizado para `useWeather.search`.
2. `searchCities` consulta geocoding e devolve até cinco resultados; zero resultados levam ao estado vazio e resultados levam ao estado de seleção.
3. A pessoa escolhe um resultado em `CityResults`; `selectCity` consulta `getWeather` pelas coordenadas.
4. `weatherService` valida e mapeia dados atuais e previsão; a UI apresenta cada parte disponível.
5. A alternância C/F converte os valores existentes sem novo request, preservando local e período.
6. Retry repete a operação pertinente; resposta obsoleta não substitui resultado de busca/seleção mais recente.

## External APIs

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`, usando atualmente `name`, `count=5`, `language=pt`, `format=json`.
- Forecast: `https://api.open-meteo.com/v1/forecast`, usando coordenadas, campos current/daily, `forecast_days=5` e `timezone=auto`.
- Preservar `AbortController` e timeout atual de 10 segundos como baseline; mensagens e recuperação devem cobrir rede, timeout, HTTP, JSON inválido e resposta incompleta.
- Usar mocks em testes; nenhuma suíte deve depender de chamadas reais.
- Confirmar idiomas da busca, métricas exibidas, fuso e interpretação de cinco dias conforme Open Questions da spec.

## State Management

- `useWeather` mantém consulta, candidatos, cidade selecionada, dados, status e erro; `App` mantém `Unit`.
- Distinguir busca de cidades, seleção/consulta meteorológica, sucesso, vazio e erro, sem tratar candidatos como dados meteorológicos carregados.
- Preservar resultados até nova busca ou seleção explícita.
- Proteger contra requisições fora de ordem por cancelamento ou identificador de requisição; escolher a abordagem mais simples compatível com `fetch`.
- Não persistir unidade entre visitas nesta versão; a escolha inicial continua pendente na spec.

## Error Handling

- Consulta vazia não chama a API nem seleciona cidade.
- Busca sem resultados apresenta estado vazio e não seleciona um local inexistente.
- Rede, timeout, HTTP, JSON inválido ou payload incoerente encerram loading e apresentam erro acionável com retry quando aplicável.
- Falhas parciais devem identificar a seção indisponível e mostrar apenas dados válidos; dias ausentes não são preenchidos artificialmente.
- Erros e estados de carregamento devem ser anunciados semanticamente, reutilizando os componentes de estado existentes.
- Política de retry por seção e mensagens finais dependem das decisões em aberto da spec.

## Testing Strategy

- Unitários de `weatherService`: parâmetros, encoding, mapeamento, dados nulos/parciais/malformados, vazio, HTTP, rede e timeout.
- Unitários de temperatura: conversão consistente em dados atuais e previsão, sem request adicional.
- Testes de UI/App: seleção explícita entre resultados, busca vazia, nenhum resultado, loading, erro/retry, falha parcial, previsão incompleta e uso por teclado.
- E2E com rotas mockadas: busca → seleção → clima atual/previsão → alternância; vazio, falha/retry, resultado parcial e viewport móvel. Fixture com mais de uma cidade confirma que não há seleção automática.
- Gates para mudanças de código: `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e`.

## Risks & Trade-offs

- A seleção automática atual contradiz FR-01/02; adicionar lista e estado de seleção expande o fluxo, mas permite a pessoa confirmar a cidade correta.
- Payloads parciais exigem tipos/UI mais expressivos; em contrapartida, evitam mascarar ausência como dado real.
- Validação manual de payload evita dependência adicional e é suficiente para os endpoints atuais, mas requer testes de contrato abrangentes.
- Identificador de requisição é simples para descartar respostas obsoletas; cancelamento também economiza rede, mas aumenta o acoplamento do hook ao transporte.
- Fuso, campos meteorológicos, persistência da unidade e metas quantitativas permanecem em aberto; congelá-los sem validação pode causar retrabalho.

## Sequência de Implementação

1. Corrigir o fluxo de busca para aguardar seleção explícita, com estado e UI de resultados acessível.
2. Endurecer contratos e mapeamento do serviço para dados ausentes/parciais e payloads incoerentes.
3. Tratar respostas fora de ordem, erros, retry e transições de estado.
4. Cobrir os critérios de aceite no nível de componente e E2E, incluindo móvel e teclado.
5. Executar os gates de lint, build e testes; resolver decisões de produto antes de fechar os campos e a semântica de previsão.

## Rastreamento

- FR-01/02: busca, resultados e seleção explícita.
- FR-03/04: integração Forecast e apresentação de clima atual/previsão.
- FR-05/NFR-04: estado local de unidade e conversão sem request.
- NFR-01/02: responsividade, semântica e teclado.
- NFR-03 e Edge Cases: estados de falha, vazio, timeout e dados parciais.

## Decisões Pendentes

- Métricas do clima atual e da previsão; definição de “cinco dias” e fuso.
- Contexto obrigatório para distinguir cidades homônimas e idiomas da busca.
- Unidade inicial e eventual persistência da preferência.
- Atualidade/cobertura dos dados, política de falha parcial/retry, navegadores/dispositivos, critérios de acessibilidade e metas quantitativas de desempenho/usabilidade.
