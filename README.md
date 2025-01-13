# Intranet

Pagina de Intranet para empresas com Autenticação feita por Active Directory e outras funcionalidades.

## 🚀 Começando

Essas instruções permitirão que você obtenha uma cópia do projeto em operação na sua máquina local para fins de desenvolvimento e teste.

### 📋 Pré-requisitos

De que coisas você precisa para funcionar?

```
Servidor com AD (Active Directory)
Node.js
Central Telefonica GRANDSTREAM UCM6510 (Somente para pagina de Ramais)
MySQL (Somente para pagina de registro dos offices)
Servidor Linux ou Windows

```

### 🔧 Instalação

Pegue todos os arquivos do repositório e coloque em uma pasta.

Crie um arquivo .env na raiz com as seguintes informações

```
VITE_USE_AD_AUTH=false // use true para autenticar com active directory e false para usar o usuario abaixo de teste
VITE_DEV_USERNAME=admin
VITE_DEV_PASSWORD=admin

DB_SERVERNAME=endereço de banco de dados
DB_USERNAME=InstaOffice
DB_PASSWORD=senha
DB_NAME=InstaOffice

CENTRALAPI=central
CENTRALAPIPASS=senhadacentraltelefonica
```

Uma das paginas faz leitura de documentos pdfs em uma pasta especifica modifique os arquivos dependendo do seu servidor no arquivo server/index.js nas seguintes rotas

Windows

```
app.get("/api/papers/:filename", authMiddleware, (req, res) => {
const pdfFolderPath = "\\\\192.168.1.2\\teste\\PAPERS Publicados"; // Caminho UNC para a pasta de rede Windows
```

```
app.get("/api/papers", authMiddleware, (req, res) => {
const pdfFolderPath = "\\\\192.168.1.2\\teste\\PAPERS Publicados"; // Caminho UNC para a pasta de rede Windows
```

Linux

```
app.get("/api/papers/:filename", authMiddleware, (req, res) => {
const pdfFolderPath = "/mnt/papers"; // Caminho montado no Linux
```

```
app.get("/api/papers", authMiddleware, (req, res) => {
const pdfFolderPath = "/mnt/papers"; // Caminho montado no Linux
```

Para autenticação com o AD altere o arquivo ldapConfig.js (nao é necessario para teste)

```
export const ldapConfig = {
	server: "ldap://192.168.1.1",
	domain: "dominio.local",
	port: 389,
	baseDN: "dc=dominio,dc=local", // DN do seu dominio.
};
```

Para usar API da central telefonica Grandstream altere a linha abaixo no arquivo server/services/extensionsServices.js

```
const baseUrl = "https://192.168.100.35:8089/api/";
```

Execute no console os comandos na seguinte ordem:

```
npm install
npm run build
npm run server ou node server/index.js
```

O servidor web iniciará no endereço local na porta HTTP 8080

```
Servidor rodando em:
  ➜  Local:   http://localhost:8080
  ➜  Network: http://localhost:8080
```

Agora é só acessar o endereço informado no Terminal.

## ⚙️ Executando os testes

Abra a pagina informada no terminal no browser e navegue.

## 🛠️ Construído com

- [React](https://reactjs.org/) - O framework web usado
- [React Router](https://reactrouter.com/) - Gerente de Rotas
- [Lucide](https://lucide.dev/) - Usada para ícones personalizados
- [Express](https://expressjs.com/) - Framework web para APIs
- [Vite](https://vitejs.dev/) - Ferramenta de build e desenvolvimento rápido
- [PDF.js](https://mozilla.github.io/pdf.js/) - Usada para renderizar PDFs
- [Node.js](https://nodejs.org/) - Ambiente de execução para JavaScript
- [cdnjs](https://cdnjs.com/) - Usada como CDN para bibliotecas web
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário para estilização rápida

## 📌 Versão

v1.0.0

## ✒️ Autores

- **Pedro Cruzeiro** - https://github.com/pedrozun

## 📄 Licença

[MIT](https://choosealicense.com/licenses/mit/)

## 🎁 Expressões de gratidão

- Me pague um café ☕ PIX: 8eab24d7-fd5d-46fc-812f-e6dbe64e3e12

- Conte a outras pessoas sobre este projeto 📢

## Screenshots

## Login

![App Screenshot](https://i.imgur.com/XyaM3Bb.png)

## Inicio

![App Screenshot](https://i.imgur.com/mPdKzUM.png)

## Menu Lateral

![App Screenshot](https://i.imgur.com/gz7Cv2Z.png)

## Não encontrado

![App Screenshot](https://i.imgur.com/9JwAYc6.png)

## Aniversarios

![App Screenshot](https://i.imgur.com/RDXCjlJ.png)

## Agenda

![App Screenshot](https://i.imgur.com/TblSgPB.png)

## Sem Acesso

![App Screenshot](https://i.imgur.com/IGvMWCd.png)

## Offices

![App Screenshot](https://i.imgur.com/0VKaCvx.png)

## Papers

![App Screenshot](https://i.imgur.com/MYPJsLf.png)

## Ramais

![App Screenshot](https://i.imgur.com/9VoSJxi.png)

## Tarefas

![App Screenshot](https://i.imgur.com/z8F7m28.png)

## Dashboard

![App Screenshot](https://i.imgur.com/2BATFGk.png)

---
