# 🛫 Ronda de Salas

Checklist diário de verificação das salas de reunião do escritório, com relatório pronto para compartilhar no WhatsApp. Feito para ser usado direto do celular, sala por sala, enquanto você faz a ronda.

## Funcionalidades

- Salas organizadas por andar (cada andar = um continente, seguindo os nomes das cidades)
- Três opções de status por sala, em ordem de severidade: **Tudo certo** ✅ / **Sala ocupada** 🟡 / **Cabos desorganizados** 🔌❌
- Campo de observação opcional para detalhar problemas fora do padrão
- Horário registrado automaticamente ao marcar uma sala
- Histórico dos últimos 7 dias
- Relatório com um clique para copiar e colar no WhatsApp
- **Envio direto para WhatsApp e Discord a partir do relatório**
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
3. Ao final da ronda, toque em **Relatório**, revise o texto e toque em **Copiar relatório** — ou envie direto pelo botão **WhatsApp** ou **Discord**.
4. Cole no WhatsApp para o Head de Infraestrutura (ou use o envio direto).

## Configuração

### Webhook do Discord

O botão **Enviar no Discord** usa uma Webhook URL que você mesmo configura:

1. Toque no ⚙️ **ícone de engrenagem** no cabeçalho do app.
2. Cole a URL do Webhook do seu canal do Discord (obtida em _Configurações do servidor → Integçraões → Webhooks_).
3. Clique em **Salvar**. A URL fica salva **somente no `localStorage` deste navegador** — ela nunca é enviada a nenhum servidor nem deve ser adicionada ao código-fonte (o repositório é público).

> **Segurança:** nunca cole a Webhook URL diretamente no código. Qualquer pessoa com acesso ao webhook pode enviar mensagens ao seu canal.

## Tecnologia

HTML, CSS e JavaScript puro, sem frameworks nem build. O código está separado em três arquivos: `index.html` (estrutura), `style.css` (estilos) e `app.js` (lógica). Os dados ficam salvos no `localStorage` do navegador, ou seja, apenas no dispositivo/navegador usado para a ronda (não sincroniza entre aparelhos).

## Licença

Uso interno.
