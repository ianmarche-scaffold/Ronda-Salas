# 🛫 Ronda de Salas

Checklist diário de verificação das salas de reunião do escritório, com relatório pronto para compartilhar no WhatsApp. Feito para ser usado direto do celular, sala por sala, enquanto você faz a ronda.

## Funcionalidades

- Salas organizadas por andar (cada andar = um continente, seguindo os nomes das cidades)
- Três opções de status por sala, em ordem de severidade: **Tudo certo** ✅ / **Sala ocupada** 🟡 / **Cabos desorganizados** 🔌❌
- Campo de observação opcional para detalhar problemas fora do padrão
- Horário registrado automaticamente ao marcar uma sala
- Histórico dos últimos 7 dias
- Relatório com um clique para copiar e colar no WhatsApp
- Sem instalação — funciona direto no navegador do celular (pode ser adicionado à tela inicial)

## Salas

| Andar | Continente | Salas |
|---|---|---|
| Térreo | África | Nairóbi, Acra, Cairo |
| 1º andar | Oceania | Adelaide, Sydney |
| 2º andar | Europa | Barcelona, Berlim, Londres, Roma |
| 4º andar | Ásia | Pequim, Seul, Tóquio |

## Como usar

1. Abra o link do site no navegador do celular.
2. Toque na aba do andar e marque o status de cada sala conforme for passando.
3. Ao final da ronda, toque em **Relatório**, revise o texto e toque em **Copiar relatório**.
4. Cole no WhatsApp para o Head de Infraestrutura.

## Tecnologia

HTML, CSS e JavaScript puro, sem frameworks nem build. Os dados ficam salvos no `localStorage` do navegador — ou seja, apenas no dispositivo/navegador usado para a ronda (não sincroniza entre aparelhos).

## Licença

Uso interno.
