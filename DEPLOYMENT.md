# FarmaGo — guia de publicação na Hostinger e GitHub

Este guia descreve o fluxo usado neste projeto: guardar o código no GitHub,
gerar um ZIP no Windows e carregar esse ZIP na Web App Node.js da Hostinger.

## Atualização de rotina

No PowerShell, dentro da pasta do projeto:

```powershell
Set-Location C:\Projectos\FarmaGo
git status
git diff
```

Confirme os ficheiros alterados. Adicione explicitamente os ficheiros que
pertencem à atualização e guarde-os; substitua os caminhos do exemplo pelos
ficheiros que realmente alterou:

```powershell
git add -- package.json scripts/build-hostinger.ps1 DEPLOYMENT.md
git commit -m "Atualiza configuração de deploy Hostinger"
git push origin master
npm run build:hostinger
```

Se não houver alterações pendentes, não é necessário criar outro commit.
Evite `git add .` sem rever os ficheiros: a pasta `last-source` é uma cópia
recuperada e pode aparecer como não versionada.

O push guarda o código no GitHub. A publicação neste site é manual:
o site só recebe o novo código quando carregar o ZIP na Hostinger.
O ZIP não é enviado para o Git, pois está excluído no `.gitignore`.

## Pré-requisitos

- Windows com PowerShell e `tar.exe` disponível (incluído no Windows 10/11).
- Node.js e npm para executar `npm run build:hostinger`.
- Git e permissão de escrita em `wetech-gw/FarmaGo` para fazer push.
- Acesso ao site existente no hPanel da Hostinger.

## Autenticar no GitHub

Se `gh` não for reconhecido, instale o GitHub CLI e abra um novo terminal:

```powershell
winget install --id GitHub.cli --exact --source winget
```

Depois execute:

```powershell
gh auth login
```

Escolha GitHub.com, HTTPS e autenticação pelo navegador. O código temporário
no formato `XXXX-XXXX` aparece no **terminal**; introduza-o na página de
autorização do GitHub. Não é enviado por email ou SMS. Entre com a conta
que tem acesso ao repositório.

```powershell
gh auth setup-git
gh auth status
git push origin master
```

Se já houver várias contas autenticadas, pode selecionar a conta correta com
`gh auth switch --hostname github.com` e repetir `gh auth setup-git`.

Para confirmar que a versão foi enviada:

```powershell
git log -1 --oneline
git ls-remote origin refs/heads/master
```

O hash do commit local deve corresponder ao hash remoto. No GitHub, selecione
a branch `master` para ver estes ficheiros.

## Como funciona o pacote

Este projeto usa a **Web App Node.js gerida**, com upload do codigo-fonte.
A Hostinger instala as dependencias e compila a aplicacao em Linux.

## Gerar o ZIP no Windows

```powershell
npm run build:hostinger
```

Alternativa sem npm: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-hostinger.ps1`.
Pode executar o script de qualquer pasta. Cada execucao substitui
`hostinger-deploy.zip` na raiz apenas depois de criar e verificar o novo arquivo.
O ZIP inclui alteracoes locais ainda nao commitadas nas pastas de codigo.
Nao instala dependencias nem executa um build local.

Inclui codigo, assets estaticos, schema Prisma, configuracoes e lockfile.
Exclui `last-source`, `.env*`, chaves privadas, `.git`, `node_modules`, `.next`,
cliente Prisma gerado, arquivos ZIP, bases locais e as pastas de imagens
enviadas pelos utilizadores. O utilitario local `prisma/create-admin.sql`
tambem e excluido. Novas pastas de codigo na raiz devem ser adicionadas a
`$inputs` no script.

## Implantar

1. No site existente: **Implantacoes > Reimplementar**, carregue o novo ZIP.
2. Confirme o framework **Next.js**, Node.js **22** e build `npm run build`.
   Mantenha a configuracao de saida detetada para Next.js no painel.
3. Preserve/configure as variaveis de producao no hPanel:
   `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`,
   `DATABASE_NAME`, e `DATABASE_URL` para as ferramentas Prisma.
   Configure tambem as chaves de IA/SMS usadas pela aplicacao.
4. Inicie a implantacao e confirme os logs e o funcionamento do site.

O `prebuild` gera o cliente Prisma no servidor antes de `next build`.
O build usa `next build --webpack` para evitar o erro de processos auxiliares
do Turbopack no ambiente da Hostinger. No painel, mantenha `npm run build`
para que a geracao do Prisma tambem seja executada.
O pacote mantem as versoes atuais; nao recupera automaticamente alteracoes
da pasta `last-source`. Nao precisa de `app.js` do Passenger para este fluxo.

O script nao altera a base de dados nem aplica migracoes. A raiz atual nao
tem historico de migracoes; o historico em `last-source` nao e importado.
As imagens carregadas por utilizadores precisam de armazenamento persistente;
nao estao no ZIP e devem ser preservadas separadamente entre implantacoes.

## Referencias

- https://www.hostinger.com/support/how-to-migrate-a-node-js-application-to-hostinger/
- https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- https://www.hostinger.com/support/how-to-fix-next-js-16-turbopack-build-errors-on-hostinger/

## Confirmar a implantação

O log deve mostrar instalação de dependências, `prisma generate` e
`next build --webpack`. Aguarde o estado **Concluído** e abra o site.
Verifique a página inicial, o login, a consulta de farmácias/medicamentos e
as imagens. Se usar a instalação PWA, confirme também a aplicação instalada.

Gerar o ZIP com sucesso valida o empacotamento, mas não confirma que a
aplicação compila ou que consegue ligar à base de dados na Hostinger.

## Resolver problemas conhecidos

| Sintoma | O que fazer |
|---|---|
| `TurbopackInternalError`, `creating new process` ao processar CSS | Confirme que `package.json` usa `next build --webpack`. Gere outro ZIP e carregue-o. No painel mantenha `npm run build`. |
| Log ainda mostra `next build` sem `--webpack` | Confirme o conteúdo do novo ZIP e volte a carregá-lo; reimplementar o arquivo anterior repete a versão antiga. |
| Erro de cliente Prisma ausente | Confirme que o `prebuild` executa `prisma generate` e consulte essa etapa no log. |
| Falha de conexão à base de dados | Reveja no hPanel as variáveis `DATABASE_*`, incluindo as variáveis separadas usadas pela aplicação. |
| Push com erro 403 ou `denied to ...` | A conta autenticada não tem permissão de escrita. Selecione a conta correta ou obtenha acesso ao repositório. |
| `gh` não é reconhecido após instalar | Feche e abra o terminal para atualizar o PATH. |
| Código de autorização expirado | Cancele com Ctrl+C, execute `gh auth login` novamente e use o novo código apresentado no terminal. |
| Alteração não aparece no GitHub | Verifique a branch `master`, o último commit e o resultado do push. |
| `Required project input missing` ao gerar ZIP | Execute na cópia completa do projeto e confirme o ficheiro ou pasta indicado pelo script. |

## Recuperar uma versão anterior

Guarde uma cópia de cada ZIP que foi publicado com sucesso fora da pasta
do projeto, identificada pela data e pelo commit. O gerador substitui sempre
`hostinger-deploy.zip`; o Git guarda o código, não esses arquivos.

Para regressar a uma versão anterior da aplicação, carregue o ZIP guardado
em **Implantações > Reimplementar** e confirme os logs e o funcionamento.
Isto não restaura a base de dados nem as imagens dos utilizadores; essas
cópias de segurança são independentes do código.

A pasta `last-source` serve de referência para comparação. Copiar todo o seu
conteúdo por cima do projeto atual pode remover melhorias mais recentes.
