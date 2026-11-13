# Upload manual para a Hostinger

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
