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
- **Instalável como app (PWA)**, com suporte offline básico
- Login com Google e rondas compartilhadas pelo Firestore, com cache offline
- Sem instalação obrigatória — também funciona direto no navegador do celular

## Salas

| Andar | Continente | Salas |
|---|---|---|
| Térreo | África | Nairóbi, Acra, Cairo |
| 1º andar | Oceania | Adelaide, Sydney |
| 2º andar | Europa | Barcelona, Berlim, Londres, Roma |
| 4º andar | Ásia | Pequim, Seul, Tóquio |

## Como usar

1. Abra o link do site no navegador do celular e entre com sua conta Google autorizada.
2. Toque na aba do andar e marque o status de cada sala conforme for passando.
3. Ao final da ronda, toque em **Relatório**, revise o texto e toque em **Copiar relatório** — ou envie direto pelo botão **WhatsApp** ou **Discord**.
4. Cole no WhatsApp para o Head de Infraestrutura (ou use o envio direto).

> **Instalar como app:** no Android/Chrome, o aviso de instalação pode não aparecer automaticamente; nesse caso, use o menu ⋮ → "Instalar app" / "Adicionar à tela inicial". No iOS/Safari, use _Compartilhar_ (ícone ⬆️) → _Adicionar à Tela de Início_. Após instalado, o app funciona offline (as páginas são carregadas do cache quando não houver rede).

## Configuração

### Firebase: projeto, login e dados

1. No [console do Firebase](https://console.firebase.google.com/), crie ou selecione um projeto e registre um app **Web**.
2. Em **Configurações do projeto → Seus apps**, copie a configuração Web e preencha os seis campos de `firebase-config.js`, substituindo os valores `COLE_AQUI`: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` e `appId`.
3. Em **Authentication → Sign-in method**, habilite o provedor **Google** e configure o e-mail de suporte. Não é necessário habilitar e-mail/senha.
4. Em **Authentication → Settings → Authorized domains**, adicione o domínio publicado (por exemplo, `seu-usuario.github.io`, sem o caminho do repositório) e `localhost` para testes locais.
5. Crie o banco **Cloud Firestore** e publique as regras abaixo em **Firestore Database → Rules**, substituindo o e-mail de exemplo pelas pessoas autorizadas.

O objeto de configuração do Firebase é **público** e pode ficar no repositório. A segurança dos dados vem do login e das **regras do Firestore**, não de esconder a `apiKey`.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function autorizado() {
      return request.auth != null
        && request.auth.token.firebase.sign_in_provider == 'google.com'
        && request.auth.token.email_verified == true
        && request.auth.token.email in [
          'pessoa@scaffoldeducation.com.br'
        ];
    }

    match /rondas/{data} {
      allow read, create, update: if autorizado();
    }
  }
}
```

O acesso é controlado pela **lista de e-mails nas regras**. Para liberar alguém novo, edite essa lista no console do Firebase e publique as regras novamente. Use apenas contas `@scaffoldeducation.com.br`. O filtro de domínio na tela de login é uma ajuda de interface; ele não substitui as regras.

As rondas ficam na coleção `rondas`, em documentos com ID `AAAA-MM-DD`, contendo `{ rooms, updatedAt }`. Cada alteração grava apenas a sala modificada, com merge. **Todos os dias permanecem na nuvem**; somente a lista exibida no relatório é limitada a 7 dias, incluindo o dia atual.

A sessão fica persistida pelo SDK. Após um primeiro acesso autenticado e o carregamento dos dados, o cache do Firestore permite consultar dados já disponíveis e enfileirar alterações sem rede, inclusive entre abas. As alterações são sincronizadas quando a conexão volta. Os dados são recarregados ao abrir o app e ao voltar para a aba; não há atualização em tempo real nesta etapa. Para sair, abra a engrenagem e toque em **Sair**.

Os registros antigos `day:AAAA-MM-DD` do `localStorage` são preservados, mas não são lidos, migrados ou apagados por esta versão. O webhook do Discord continua exclusivamente no `localStorage` e nunca é enviado ao Firestore.

### Testar localmente

O login com Google não funciona abrindo `index.html` diretamente por `file://`. Na raiz do repositório, inicie um servidor:

```bash
python3 -m http.server 8000
```

Abra **http://localhost:8000** e confirme que `localhost` está nos domínios autorizados do Firebase.

### Regerar o bundle do Firebase

O GitHub Pages publica arquivos estáticos: **não há npm nem build no deploy**. O navegador carrega, nesta ordem, `firebase-config.js`, `vendor/firebase-bundle.js` e `app.js`. `firebase-entry.js` é apenas a entrada usada para gerar o bundle.

Quando precisar atualizar o SDK, execute os comandos abaixo **a partir da raiz do repositório**. Eles criam uma pasta temporária fora do repo, instalam as ferramentas nessa pasta e copiam somente o bundle gerado de volta:

```bash
RONDA_REPO="$(pwd)"
RONDA_BUNDLE_TMP="$(mktemp -d)"
cp "$RONDA_REPO/firebase-entry.js" "$RONDA_BUNDLE_TMP/firebase-entry.js"
mkdir -p "$RONDA_BUNDLE_TMP/vendor"
cd "$RONDA_BUNDLE_TMP"
npm install firebase esbuild
npx esbuild firebase-entry.js --bundle --minify --format=iife --outfile=vendor/firebase-bundle.js
cp vendor/firebase-bundle.js "$RONDA_REPO/vendor/firebase-bundle.js"
cd "$RONDA_REPO"
```

Mantenha o bundle gerado no repositório e atualize a versão do cache em `service-worker.js` ao publicar uma atualização. Não copie `node_modules`, `package.json` ou arquivos de lock da pasta temporária para o fluxo de deploy.

### Webhook do Discord

O botão **Enviar no Discord** usa uma Webhook URL que você mesmo configura:

1. Toque no ⚙️ **ícone de engrenagem** no cabeçalho do app.
2. Cole a URL do Webhook do seu canal do Discord (obtida em _Configurações do servidor → Integçraões → Webhooks_).
3. Clique em **Salvar**. A URL fica salva **somente no `localStorage` deste navegador** — ela não é sincronizada com o Firebase nem deve ser adicionada ao código-fonte (o repositório é público).

> **Segurança:** nunca cole a Webhook URL diretamente no código. Qualquer pessoa com acesso ao webhook pode enviar mensagens ao seu canal.

## Tecnologia

HTML, CSS e JavaScript puro, sem frameworks nem build no deploy. O código está separado em `index.html` (estrutura), `style.css` (estilos) e `app.js` (lógica). Firebase Auth fornece o login com Google; o Firestore compartilha as rondas entre usuários autorizados e mantém um cache local persistente para uso offline. O SDK modular é servido pelo bundle local `vendor/firebase-bundle.js`.

## Licença

Uso interno.
